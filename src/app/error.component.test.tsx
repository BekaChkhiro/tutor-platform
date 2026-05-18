import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from './error';
import NotFound from './not-found';

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe('Error boundary page', () => {
  const baseError = Object.assign(new globalThis.Error('boom'), { digest: undefined });

  it('renders 500 label and heading', () => {
    render(<ErrorPage error={baseError} reset={vi.fn()} />);
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
  });

  it('shows error digest when present', () => {
    const errWithDigest = Object.assign(new globalThis.Error('oops'), { digest: 'abc-123' });
    render(<ErrorPage error={errWithDigest} reset={vi.fn()} />);
    expect(screen.getByText(/Error ID: abc-123/)).toBeInTheDocument();
  });

  it('does not show digest element when digest is absent', () => {
    render(<ErrorPage error={baseError} reset={vi.fn()} />);
    expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
  });

  it('calls reset when "Try again" is clicked', async () => {
    const reset = vi.fn();
    const user = userEvent.setup();
    render(<ErrorPage error={baseError} reset={reset} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it('renders "Go home" link pointing to /', () => {
    render(<ErrorPage error={baseError} reset={vi.fn()} />);
    const link = screen.getByRole('link', { name: /go home/i });
    expect(link).toHaveAttribute('href', '/');
  });
});

describe('NotFound page', () => {
  it('renders 404 label and heading', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('renders "Go home" link pointing to /', () => {
    render(<NotFound />);
    const link = screen.getByRole('link', { name: /go home/i });
    expect(link).toBeInTheDocument();
  });
});
