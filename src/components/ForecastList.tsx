import type { ForecastDay, Unit } from '../types/weather';
import ForecastCard from './ForecastCard';

interface ForecastListProps {
  forecast: ForecastDay[];
  unit: Unit;
}

/** Grid responsivo com a previsão de 5 dias. */
export default function ForecastList({ forecast, unit }: ForecastListProps) {
  return (
    <section aria-label="Previsão de 5 dias">
      <h2 className="mb-4 text-xl font-bold">Previsão de 5 dias</h2>
      {forecast.length === 0 ? (
        <p role="status" className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/75">
          Previsão indisponível
        </p>
      ) : (
        <>
          {forecast.length < 5 && (
            <p role="status" className="mb-3 text-sm text-white/75">
              Previsão parcial: dados disponíveis para {forecast.length} de 5 dias.
            </p>
          )}
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {forecast.map((day, index) => (
              <ForecastCard key={day.date} day={day} index={index} unit={unit} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
