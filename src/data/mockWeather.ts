import type { WeatherData } from '../types/weather';

export const MOCK_WEATHER: WeatherData[] = [
  {
    city: {
      id: 1,
      name: 'Seattle',
      country: 'Estados Unidos',
      admin1: 'Washington',
      latitude: 47.6,
      longitude: -122.33,
    },
    current: {
      time: '2026-11-11T12:00',
      temperature: 12,
      weatherCode: 3,
      humidity: 72,
      windSpeed: 13,
      pressure: 1014,
      precipitation: 0.2,
    },
    forecast: [
      { date: '2026-11-11', min: 8, max: 13, weatherCode: 3, precipitationProbability: 20 },
      { date: '2026-11-12', min: 7, max: 12, weatherCode: 61, precipitationProbability: 80 },
      { date: '2026-11-13', min: 6, max: 11, weatherCode: 2, precipitationProbability: 10 },
      { date: '2026-11-14', min: 8, max: 14, weatherCode: 1, precipitationProbability: 0 },
      { date: '2026-11-15', min: 9, max: 15, weatherCode: 2, precipitationProbability: 5 },
    ],
  },
  {
    city: {
      id: 2,
      name: 'Springfield',
      country: 'Estados Unidos',
      admin1: 'Missouri',
      latitude: 37.2,
      longitude: -93.3,
    },
    current: {
      time: '2026-11-11T12:00',
      temperature: 14,
      weatherCode: 1,
      humidity: 48,
      windSpeed: 9,
      pressure: 1018,
      precipitation: 0,
    },
    forecast: [
      { date: '2026-11-11', min: 9, max: 16, weatherCode: 1, precipitationProbability: 0 },
      { date: '2026-11-12', min: 10, max: 17, weatherCode: 2, precipitationProbability: 5 },
      { date: '2026-11-13', min: 8, max: 14, weatherCode: 3, precipitationProbability: 20 },
      { date: '2026-11-14', min: 7, max: 12, weatherCode: 61, precipitationProbability: 70 },
      { date: '2026-11-15', min: 6, max: 13, weatherCode: 2, precipitationProbability: 10 },
    ],
  },
  {
    city: {
      id: 3,
      name: 'Springfield',
      country: 'Estados Unidos',
      admin1: 'Illinois',
      latitude: 39.8,
      longitude: -89.6,
    },
    current: {
      time: '2026-11-11T12:00',
      temperature: 10,
      weatherCode: 61,
      humidity: 84,
      windSpeed: 18,
      pressure: 1009,
      precipitation: 2.4,
    },
    forecast: [
      { date: '2026-11-11', min: 7, max: 11, weatherCode: 61, precipitationProbability: 85 },
      { date: '2026-11-12', min: 6, max: 12, weatherCode: 3, precipitationProbability: 30 },
      { date: '2026-11-13', min: 5, max: 13, weatherCode: 2, precipitationProbability: 10 },
      { date: '2026-11-14', min: 8, max: 15, weatherCode: 1, precipitationProbability: 0 },
      { date: '2026-11-15', min: 9, max: 14, weatherCode: 3, precipitationProbability: 25 },
    ],
  },
];
