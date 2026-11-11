import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchBar from '../../src/components/SearchBar';

describe('SearchBar', () => {
  it('informa que uma cidade é necessária quando a busca está vazia', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/digite o nome de uma cidade/i);
    expect(screen.getByRole('textbox', { name: /buscar cidade/i })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('dispara busca com o termo digitado', async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    await userEvent.type(screen.getByLabelText(/buscar cidade/i), 'Lisboa');
    await userEvent.click(screen.getByRole('button', { name: /buscar/i }));
    expect(onSearch).toHaveBeenCalledWith('Lisboa');
  });
});
