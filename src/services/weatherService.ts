import type { City, CurrentWeather, ForecastDay, WeatherData } from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const REQUEST_TIMEOUT_MS = 10_000;

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

interface GeocodingResult {
  id: number;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

interface ForecastDailyResponse {
  time: string[];
  weather_code?: unknown;
  temperature_2m_max?: unknown;
  temperature_2m_min?: unknown;
  precipitation_probability_max?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function isGeocodingResult(value: unknown): value is GeocodingResult {
  if (!isRecord(value)) return false;
  return (
    isFiniteNumber(value.id) &&
    isString(value.name) &&
    (value.country === undefined || isString(value.country)) &&
    (value.admin1 === undefined || isString(value.admin1)) &&
    isFiniteNumber(value.latitude) &&
    isFiniteNumber(value.longitude)
  );
}

function isForecastCurrent(value: unknown): value is Record<string, unknown> {
  if (!isRecord(value)) return false;
  return [
    value.temperature_2m,
    value.relative_humidity_2m,
    value.wind_speed_10m,
    value.surface_pressure,
    value.precipitation,
    value.weather_code,
  ].some(isFiniteNumber);
}

function isForecastDaily(value: unknown): value is ForecastDailyResponse {
  if (!isRecord(value)) return false;
  return isStringArray(value.time);
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new WeatherServiceError('A requisição demorou demais. Tente novamente.');
    }
    throw new WeatherServiceError('Falha de rede. Verifique sua conexão.');
  } finally {
    clearTimeout(timeout);
  }
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    throw new WeatherServiceError('A API retornou uma resposta inválida. Tente novamente.');
  }
}

export async function searchCities(name: string): Promise<City[]> {
  const query = name.trim();
  if (!query) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(query)}&count=5&language=pt&format=json`;
  const response = await fetchWithTimeout(url);
  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível buscar a cidade. Tente novamente.');
  }

  const payload = await parseJson(response);
  if (!isRecord(payload)) {
    throw new WeatherServiceError('Resposta de busca inválida. Tente novamente.');
  }
  if (payload.results === undefined) return [];
  if (!Array.isArray(payload.results) || !payload.results.every(isGeocodingResult)) {
    throw new WeatherServiceError('Resposta de busca inválida. Tente novamente.');
  }

  return payload.results.map((result) => ({
    id: result.id,
    name: result.name,
    country: result.country ?? '',
    admin1: result.admin1,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

function mapCurrent(current: unknown): CurrentWeather {
  const values = isRecord(current) ? current : {};
  return {
    time: isString(values.time) ? values.time : null,
    temperature: isFiniteNumber(values.temperature_2m) ? values.temperature_2m : null,
    humidity: isFiniteNumber(values.relative_humidity_2m) ? values.relative_humidity_2m : null,
    windSpeed: isFiniteNumber(values.wind_speed_10m) ? values.wind_speed_10m : null,
    pressure: isFiniteNumber(values.surface_pressure) ? values.surface_pressure : null,
    precipitation: isFiniteNumber(values.precipitation) ? values.precipitation : null,
    weatherCode: isFiniteNumber(values.weather_code) ? values.weather_code : null,
  };
}

function mapForecast(daily: ForecastDailyResponse): ForecastDay[] {
  const numberAt = (values: unknown, index: number): number | null => {
    if (!Array.isArray(values)) return null;
    const value: unknown = values[index];
    return isFiniteNumber(value) ? value : null;
  };

  return daily.time.map((date, index) => ({
    date,
    weatherCode: numberAt(daily.weather_code, index),
    max: numberAt(daily.temperature_2m_max, index),
    min: numberAt(daily.temperature_2m_min, index),
    precipitationProbability: numberAt(daily.precipitation_probability_max, index),
  }));
}

export async function getWeather(city: City): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,precipitation,weather_code',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    forecast_days: '5',
    timezone: 'auto',
  });

  const response = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new WeatherServiceError('Não foi possível carregar o clima. Tente novamente.');
  }

  const payload = await parseJson(response);
  if (!isRecord(payload)) {
    throw new WeatherServiceError('Resposta de clima incompleta. Tente novamente.');
  }
  const currentPayload = payload.current;
  const dailyPayload = payload.daily;
  const current = isForecastCurrent(currentPayload) ? currentPayload : null;
  const daily = isForecastDaily(dailyPayload) ? dailyPayload : null;

  if (!current && (!daily || daily.time.length === 0)) {
    throw new WeatherServiceError('Resposta de clima incompleta. Tente novamente.');
  }

  return {
    city,
    current: mapCurrent(current),
    forecast: daily && daily.time.length > 0 ? mapForecast(daily) : [],
  };
}
