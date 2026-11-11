import type { City } from '../types/weather';

interface CityResultsProps {
  cities: City[];
  onSelect: (city: City) => void;
}

export default function CityResults({ cities, onSelect }: CityResultsProps) {
  return (
    <section aria-labelledby="city-results-title" aria-live="polite" className="space-y-3">
      <h1 id="city-results-title" className="text-xl font-semibold">
        Selecione uma cidade
      </h1>
      <ul className="grid gap-3 sm:grid-cols-2">
        {cities.map((city) => {
          const location = [city.admin1, city.country].filter(Boolean).join(', ');

          return (
            <li key={city.id}>
              <button
                type="button"
                aria-label={location ? `${city.name}, ${location}` : city.name}
                onClick={() => onSelect(city)}
                className="flex min-h-12 w-full flex-col items-start rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur-md transition hover:border-accent-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400"
              >
                <span className="font-semibold">{city.name}</span>
                {location && <span className="text-sm text-white/60">{location}</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
