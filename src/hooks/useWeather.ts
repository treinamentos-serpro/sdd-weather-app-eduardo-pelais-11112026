import { useCallback, useRef, useState } from 'react';
import { getWeather, searchCities, WeatherServiceError } from '../services/weatherService';
import type { City, WeatherData } from '../types/weather';

export type WeatherStatus = 'idle' | 'loading' | 'selecting' | 'success' | 'error' | 'empty';

interface UseWeatherResult {
  status: WeatherStatus;
  data: WeatherData | null;
  cities: City[];
  error: string | null;
  query: string;
  search: (name: string) => Promise<void>;
  selectCity: (city: City) => Promise<void>;
  retry: () => Promise<void>;
}

type RetryAction = { type: 'search'; query: string } | { type: 'weather'; city: City };

/**
 * Hook de orquestração: busca cidades, seleciona uma e carrega o clima.
 * Expõe uma máquina de estados simples (idle/loading/success/error/empty).
 */
export function useWeather(): UseWeatherResult {
  const [status, setStatus] = useState<WeatherStatus>('idle');
  const [data, setData] = useState<WeatherData | null>(null);
  const [cities, setCities] = useState<City[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const requestId = useRef(0);
  const retryAction = useRef<RetryAction | null>(null);

  const search = useCallback(async (name: string) => {
    const trimmed = name.trim();
    setQuery(trimmed);
    if (!trimmed) return;

    const currentRequestId = ++requestId.current;
    retryAction.current = { type: 'search', query: trimmed };
    setStatus('loading');
    setError(null);
    setCities([]);
    try {
      const results = await searchCities(trimmed);
      if (currentRequestId !== requestId.current) return;
      if (results.length === 0) {
        setStatus('empty');
        return;
      }
      setCities(results);
      setStatus('selecting');
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      setStatus('error');
      setError(toMessage(err));
    }
  }, []);

  const loadWeather = useCallback(async (city: City) => {
    const currentRequestId = ++requestId.current;
    retryAction.current = { type: 'weather', city };
    setStatus('loading');
    setError(null);
    try {
      const weather = await getWeather(city);
      if (currentRequestId !== requestId.current) return;
      setData(weather);
      setStatus('success');
    } catch (err) {
      if (currentRequestId !== requestId.current) return;
      setStatus('error');
      setError(toMessage(err));
    }
  }, []);

  const selectCity = useCallback(
    async (city: City) => {
      await loadWeather(city);
    },
    [loadWeather],
  );

  const retry = useCallback(async () => {
    const action = retryAction.current;
    if (action?.type === 'weather') {
      await loadWeather(action.city);
    } else if (action?.type === 'search') {
      await search(action.query);
    }
  }, [loadWeather, search]);

  return { status, data, cities, error, query, search, selectCity, retry };
}

function toMessage(err: unknown): string {
  if (err instanceof WeatherServiceError) return err.message;
  return 'Algo deu errado. Tente novamente.';
}
