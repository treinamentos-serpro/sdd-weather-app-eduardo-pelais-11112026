import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useWeather } from '../../src/hooks/useWeather';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

const FIRST_CITY: City = {
  id: 1,
  name: 'Springfield',
  country: 'Estados Unidos',
  admin1: 'Missouri',
  latitude: 37.2,
  longitude: -93.3,
};

const SECOND_CITY: City = {
  ...FIRST_CITY,
  id: 2,
  admin1: 'Illinois',
};

const WEATHER: WeatherData = {
  city: SECOND_CITY,
  current: {
    time: '2026-11-11T12:00',
    temperature: 10,
    weatherCode: 3,
    humidity: 50,
    windSpeed: 10,
    pressure: 1013,
    precipitation: 0,
  },
  forecast: [],
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe('useWeather', () => {
  it('ignora respostas de busca obsoletas', async () => {
    const slowSearch = deferred<City[]>();
    const fastSearch = deferred<City[]>();
    vi.mocked(searchCities)
      .mockReturnValueOnce(slowSearch.promise)
      .mockReturnValueOnce(fastSearch.promise);
    const { result } = renderHook(() => useWeather());

    let firstRequest!: Promise<void>;
    let secondRequest!: Promise<void>;
    act(() => {
      firstRequest = result.current.search('Springfield lento');
      secondRequest = result.current.search('Springfield rápido');
    });

    await act(async () => {
      fastSearch.resolve([SECOND_CITY]);
      await secondRequest;
    });
    expect(result.current.cities).toEqual([SECOND_CITY]);

    await act(async () => {
      slowSearch.resolve([FIRST_CITY]);
      await firstRequest;
    });
    expect(result.current.cities).toEqual([SECOND_CITY]);
    expect(result.current.query).toBe('Springfield rápido');
  });

  it('repete a busca que falhou ao acionar retry', async () => {
    vi.mocked(searchCities)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce([FIRST_CITY]);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Springfield'));
    expect(result.current.status).toBe('error');

    await act(async () => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('selecting');
    expect(getWeather).not.toHaveBeenCalled();
  });

  it('repete a consulta da cidade que falhou sem refazer a busca', async () => {
    vi.mocked(searchCities).mockResolvedValueOnce([SECOND_CITY]);
    vi.mocked(getWeather)
      .mockRejectedValueOnce(new WeatherServiceError('Falha de rede.'))
      .mockResolvedValueOnce(WEATHER);
    const { result } = renderHook(() => useWeather());

    await act(async () => result.current.search('Springfield'));
    await act(async () => result.current.selectCity(SECOND_CITY));
    expect(result.current.status).toBe('error');

    await act(async () => result.current.retry());
    expect(searchCities).toHaveBeenCalledTimes(1);
    expect(getWeather).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('success');
  });
});
