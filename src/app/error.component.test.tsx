import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from './error';
import NotFound from './not-found';

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
});

describe('Error boundary page', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  function renderError(digest?: string, reset = vi.fn()) {
    const error = Object.assign(new globalThis.Error('boom'), { digest });
    render(<ErrorPage error={error} reset={reset} />);
    return { reset };
  }

  it('renders the 500 label and heading', () => {
    renderError();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('shows the error digest when present', () => {
    renderError('abc-123');
    expect(screen.getByText(/abc-123/)).toBeInTheDocument();
  });

  it('does not show a digest element when digest is absent', () => {
    renderError();
    expect(screen.queryByText(/ID:/)).not.toBeInTheDocument();
  });

  it('calls reset when "ხელახლა სცადე" is clicked', async () => {
    const user = userEvent.setup();
    const { reset } = renderError();
    await user.click(screen.getByRole('button', { name: /ხელახლა სცადე/i }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('renders the "Go home" link pointing to /', () => {
    renderError();
    const link = screen.getByRole('link', { name: /მთავარ გვერდზე/i });
    expect(link).toHaveAttribute('href', '/');
  });
});

describe('NotFound page', () => {
  it('renders the 404 label and heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders the "Go home" link pointing to /', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /მთავარ გვერდზე დაბრუნება/i });
    expect(link).toHaveAttribute('href', '/');
  });
});
