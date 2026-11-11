import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { getWeather, searchCities, WeatherServiceError } from '../../src/services/weatherService';
import type { City, WeatherData } from '../../src/types/weather';

vi.mock('../../src/services/weatherService', () => ({
  getWeather: vi.fn(),
  searchCities: vi.fn(),
  WeatherServiceError: class WeatherServiceError extends Error {},
}));

const cityResults: City[] = [
  {
    id: 1,
    name: 'Springfield',
    country: 'Estados Unidos',
    admin1: 'Missouri',
    latitude: 37.2,
    longitude: -93.3,
  },
  {
    id: 2,
    name: 'Springfield',
    country: 'Estados Unidos',
    admin1: 'Illinois',
    latitude: 39.8,
    longitude: -89.6,
  },
];

const weatherData: WeatherData = {
  city: cityResults[1],
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
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('App', () => {
  it('renderiza a marca e o estado inicial vazio', () => {
    render(<App />);
    expect(screen.getByText('WeatherView')).toBeInTheDocument();
    expect(screen.getByText(/busque uma cidade para começar/i)).toBeInTheDocument();
  });

  it('mostra a barra de busca e o alternador de unidade', () => {
    render(<App />);
    expect(screen.getByLabelText(/buscar cidade/i)).toBeInTheDocument();
    expect(screen.getByRole('group', { name: /unidade de temperatura/i })).toBeInTheDocument();
  });

  it('consulta o clima somente após escolher um resultado de busca', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue(cityResults);
    vi.mocked(getWeather).mockResolvedValue(weatherData);
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Springfield');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    const secondCity = await screen.findByRole('button', {
      name: /Springfield, Illinois, Estados Unidos/i,
    });
    expect(getWeather).not.toHaveBeenCalled();
    await user.click(secondCity);

    expect(getWeather).toHaveBeenCalledWith(cityResults[1]);
    expect(await screen.findByRole('heading', { name: 'Springfield' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /previsão de 5 dias/i })).toBeInTheDocument();
  });

  it('permite pesquisar e selecionar resultados usando apenas o teclado', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue(cityResults);
    vi.mocked(getWeather).mockResolvedValue(weatherData);
    render(<App />);

    const searchInput = screen.getByRole('textbox', { name: /buscar cidade/i });
    await user.type(searchInput, 'Springfield');
    await user.keyboard('{Enter}');

    const secondCity = await screen.findByRole('button', {
      name: /Springfield, Illinois, Estados Unidos/i,
    });
    for (let tab = 0; tab < 5; tab += 1) await user.tab();
    expect(secondCity).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(await screen.findByRole('heading', { name: 'Springfield' })).toBeInTheDocument();
    expect(getWeather).toHaveBeenCalledWith(cityResults[1]);
  });

  it('mostra o estado vazio quando o geocoding não encontra resultados', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([]);
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Atlantis');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByText(/nenhuma cidade encontrada/i)).toBeInTheDocument();
  });

  it('mostra erro quando a busca falha', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockRejectedValue(new WeatherServiceError('Falha de rede.'));
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Seattle');
    await user.click(screen.getByRole('button', { name: /buscar/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Falha de rede.');
  });

  it('alterna as temperaturas entre Celsius e Fahrenheit', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([cityResults[1]]);
    vi.mocked(getWeather).mockResolvedValue(weatherData);
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Springfield');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await user.click(
      await screen.findByRole('button', { name: /Springfield, Illinois, Estados Unidos/i }),
    );

    const currentWeather = within(await screen.findByRole('region', { name: /clima atual/i }));
    expect(currentWeather.getByText('10°')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '°F' }));
    expect(currentWeather.getByText('50°')).toBeInTheDocument();
  });

  it('exibe traços para métricas ausentes e informa previsão indisponível', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([cityResults[1]]);
    vi.mocked(getWeather).mockResolvedValue({
      city: cityResults[1],
      current: {
        time: null,
        temperature: null,
        weatherCode: null,
        humidity: null,
        windSpeed: null,
        pressure: null,
        precipitation: null,
      },
      forecast: [],
    });
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Springfield');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await user.click(
      await screen.findByRole('button', { name: /Springfield, Illinois, Estados Unidos/i }),
    );

    const currentWeather = within(await screen.findByRole('region', { name: /clima atual/i }));
    expect(currentWeather.getAllByText('—')).toHaveLength(6);
    expect(currentWeather.getByRole('status')).toHaveTextContent('Clima atual indisponível');
    const forecast = within(screen.getByRole('region', { name: /previsão de 5 dias/i }));
    expect(forecast.getByRole('status')).toHaveTextContent('Previsão indisponível');
  });

  it('exibe traços para valores ausentes em dias de previsão', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([cityResults[1]]);
    vi.mocked(getWeather).mockResolvedValue({
      ...weatherData,
      forecast: [
        {
          date: '2026-11-11',
          min: null,
          max: 15,
          weatherCode: null,
          precipitationProbability: null,
        },
      ],
    });
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Springfield');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await user.click(
      await screen.findByRole('button', { name: /Springfield, Illinois, Estados Unidos/i }),
    );

    const forecast = within(await screen.findByRole('region', { name: /previsão de 5 dias/i }));
    expect(forecast.getAllByText('—')).toHaveLength(3);
  });

  it('informa quando a previsão contém menos de cinco dias', async () => {
    const user = userEvent.setup();
    vi.mocked(searchCities).mockResolvedValue([cityResults[1]]);
    vi.mocked(getWeather).mockResolvedValue({
      ...weatherData,
      forecast: weatherData.forecast.slice(0, 2),
    });
    render(<App />);

    await user.type(screen.getByRole('textbox', { name: /buscar cidade/i }), 'Springfield');
    await user.click(screen.getByRole('button', { name: /buscar/i }));
    await user.click(
      await screen.findByRole('button', { name: /Springfield, Illinois, Estados Unidos/i }),
    );

    expect(await screen.findByRole('status')).toHaveTextContent(
      'Previsão parcial: dados disponíveis para 2 de 5 dias.',
    );
  });
});
