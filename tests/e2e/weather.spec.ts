import { expect, type Page, test } from '@playwright/test';

const cityResults = {
  Seattle: [
    {
      id: 1,
      name: 'Seattle',
      country: 'Estados Unidos',
      admin1: 'Washington',
      latitude: 47.6,
      longitude: -122.33,
    },
  ],
  Springfield: [
    {
      id: 2,
      name: 'Springfield',
      country: 'Estados Unidos',
      admin1: 'Missouri',
      latitude: 37.2,
      longitude: -93.3,
    },
    {
      id: 3,
      name: 'Springfield',
      country: 'Estados Unidos',
      admin1: 'Illinois',
      latitude: 39.8,
      longitude: -89.6,
    },
  ],
};

const forecast = {
  current: {
    time: '2026-11-11T12:00',
    temperature_2m: 10,
    relative_humidity_2m: 84,
    wind_speed_10m: 18,
    surface_pressure: 1009,
    precipitation: 2.4,
    weather_code: 61,
  },
  daily: {
    time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
    weather_code: [61, 3, 2, 1, 3],
    temperature_2m_max: [11, 12, 13, 15, 14],
    temperature_2m_min: [7, 6, 5, 8, 9],
    precipitation_probability_max: [85, 30, 10, 0, 25],
  },
};

async function mockApis(page: Page) {
  const requests: string[] = [];
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    requests.push(route.request().url());
    const url = new URL(route.request().url());
    const query = url.searchParams.get('name') ?? '';
    const key = query.toLowerCase() === 'springfield' ? 'Springfield' : 'Seattle';
    const results = query.toLowerCase() === 'atlantis' ? [] : cityResults[key];
    await route.fulfill({ json: { results } });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    requests.push(route.request().url());
    await route.fulfill({ json: forecast });
  });
  return requests;
}

test('fluxo completo: buscar → clima atual → previsão → trocar unidade', async ({ page }) => {
  const apiRequests = await mockApis(page);
  await page.goto('/');

  await expect(page.getByText(/busque uma cidade para começar/i)).toBeVisible();

  await page.getByLabel(/buscar cidade/i).fill('Springfield');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Springfield, Illinois, Estados Unidos/i }).click();

  await expect(page.getByRole('heading', { name: 'Springfield' })).toBeVisible();
  await expect(page.getByRole('region', { name: /previsão de 5 dias/i })).toBeVisible();
  const currentWeather = page.getByRole('region', { name: /clima atual/i });
  await expect(currentWeather.getByText('10°')).toBeVisible();
  await page.getByRole('button', { name: '°F' }).click();
  await expect(currentWeather.getByText('50°')).toBeVisible();

  expect(apiRequests).toHaveLength(2);
  const geocodingUrl = new URL(apiRequests[0]);
  expect(geocodingUrl.hostname).toBe('geocoding-api.open-meteo.com');
  expect(geocodingUrl.searchParams.get('name')).toBe('Springfield');
  expect(geocodingUrl.searchParams.get('count')).toBe('5');
  expect(geocodingUrl.searchParams.get('language')).toBe('pt');
  expect(geocodingUrl.searchParams.get('format')).toBe('json');
  const forecastUrl = new URL(apiRequests[1]);
  expect(forecastUrl.hostname).toBe('api.open-meteo.com');
  expect(forecastUrl.searchParams.get('latitude')).toBe('39.8');
  expect(forecastUrl.searchParams.get('longitude')).toBe('-89.6');
  expect(forecastUrl.searchParams.get('current')).toContain('temperature_2m');
  expect(forecastUrl.searchParams.get('daily')).toContain('temperature_2m_max');
  expect(forecastUrl.searchParams.get('forecast_days')).toBe('5');
  expect(forecastUrl.searchParams.get('timezone')).toBe('auto');
});

test('estado vazio quando a cidade não existe', async ({ page }) => {
  await mockApis(page);
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Atlantis');
  await page.getByRole('button', { name: /buscar/i }).click();

  await expect(page.getByText(/nenhuma cidade encontrada/i)).toBeVisible();
});

test('recupera uma falha do Forecast pelo botão de retry', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', (route) =>
    route.fulfill({ json: { results: cityResults.Seattle } }),
  );
  await page.route('**/api.open-meteo.com/**', (route) => {
    forecastRequests += 1;
    return forecastRequests === 1
      ? route.fulfill({ status: 503, json: { error: true } })
      : route.fulfill({ json: forecast });
  });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Seattle, Washington, Estados Unidos/i }).click();
  await expect(page.getByRole('alert')).toContainText(/não foi possível carregar o clima/i);

  await page.getByRole('button', { name: /tentar novamente/i }).click();
  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  expect(forecastRequests).toBe(2);
});

test('grid da previsão se adapta a mobile, tablet e desktop com APIs mockadas', async ({
  page,
}) => {
  const apiRequests = await mockApis(page);
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Seattle, Washington, Estados Unidos/i }).click();

  const grid = page.getByRole('region', { name: /previsão de 5 dias/i }).locator('ul');
  for (const [width, columns] of [
    [320, 2],
    [375, 2],
    [800, 3],
    [1280, 5],
  ]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length),
      )
      .toBe(columns);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }

  expect(apiRequests).toHaveLength(2);
});

test('viewport mobile renderiza o fluxo com dados da API mockada', async ({ page }) => {
  await mockApis(page);
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/');

  await page.getByLabel(/buscar cidade/i).fill('Seattle');
  await page.getByRole('button', { name: /buscar/i }).click();
  await page.getByRole('button', { name: /Seattle, Washington, Estados Unidos/i }).click();

  await expect(page.getByRole('heading', { name: 'Seattle' })).toBeVisible();
  await expect(page.getByRole('region', { name: /previsão de 5 dias/i })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
