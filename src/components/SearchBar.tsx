import { type FormEvent, useState } from 'react';

interface SearchBarProps {
  onSearch: (city: string) => void;
  disabled?: boolean;
}

/** Barra de busca de cidade. Bloqueia submit com input vazio. */
export default function SearchBar({ onSearch, disabled }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setValidationMessage('Digite o nome de uma cidade para buscar.');
      return;
    }
    setValidationMessage('');
    onSearch(trimmed);
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="w-full min-w-0 flex-1">
      <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 backdrop-blur-md focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-400/40">
        <span aria-hidden="true" className="text-white/50">
          🔍
        </span>
        <label htmlFor="city-search" className="sr-only">
          Buscar cidade
        </label>
        <input
          id="city-search"
          type="text"
          disabled={disabled}
          aria-invalid={Boolean(validationMessage)}
          aria-describedby={validationMessage ? 'city-search-error' : undefined}
          enterKeyHint="search"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.trim()) setValidationMessage('');
          }}
          placeholder="Buscar cidade…"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-white placeholder-white/60 outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={disabled}
          className="min-h-11 shrink-0 rounded-lg bg-accent-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-accent-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
        >
          Buscar
        </button>
      </div>
      {validationMessage && (
        <p id="city-search-error" role="alert" className="mt-2 text-sm text-rose-300">
          {validationMessage}
        </p>
      )}
    </form>
  );
}
