import { formatTemperature } from '../lib/temperature';
import { getWeatherIcon, getWeatherLabel } from '../lib/weatherCodes';
import type { City, CurrentWeather as CurrentWeatherType, Unit } from '../types/weather';

interface CurrentWeatherProps {
  city: City;
  current: CurrentWeatherType;
  unit: Unit;
}

interface MetricProps {
  icon: string;
  label: string;
  value: string;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 backdrop-blur-md sm:gap-3 sm:px-4">
      <span aria-hidden="true" className="text-xl">
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-xs leading-tight text-white/70">{label}</dt>
        <dd className="break-words font-semibold">{value}</dd>
      </div>
    </div>
  );
}

/** Seção "hero" com as condições atuais da cidade selecionada. */
export default function CurrentWeather({ city, current, unit }: CurrentWeatherProps) {
  const location = [city.admin1, city.country].filter(Boolean).join(', ');

  return (
    <section
      aria-label="Clima atual"
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-glass md:p-8"
    >
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold md:text-3xl">{city.name}</h2>
          {location && <p className="text-white/60">{location}</p>}

          <div className="mt-6 flex items-center gap-3 sm:gap-4">
            <span aria-hidden="true" className="text-5xl sm:text-6xl">
              {getWeatherIcon(current.weatherCode)}
            </span>
            <span className="text-5xl font-light sm:text-6xl md:text-7xl">
              {formatTemperature(current.temperature, unit)}
            </span>
          </div>
          <p className="mt-2 text-white/80">{getWeatherLabel(current.weatherCode)}</p>
        </div>

        <dl className="grid grid-cols-2 gap-2 sm:gap-3 md:min-w-72">
          <Metric
            icon="💧"
            label="Umidade"
            value={current.humidity === null ? '—' : `${Math.round(current.humidity)}%`}
          />
          <Metric
            icon="💨"
            label="Vento"
            value={current.windSpeed === null ? '—' : `${Math.round(current.windSpeed)} km/h`}
          />
          <Metric
            icon="🌧️"
            label="Precipitação"
            value={current.precipitation === null ? '—' : `${current.precipitation} mm`}
          />
          <Metric
            icon="📊"
            label="Pressão"
            value={current.pressure === null ? '—' : `${Math.round(current.pressure)} hPa`}
          />
        </dl>
      </div>
    </section>
  );
}
