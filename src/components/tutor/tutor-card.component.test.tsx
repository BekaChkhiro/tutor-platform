import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TutorCard, type TutorCardProps } from './tutor-card';

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

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    src: string;
    fill?: boolean;
    sizes?: string;
  }) => <img src={src} alt={alt} {...rest} />,
}));

afterEach(cleanup);

const base: TutorCardProps = {
  id: 'tutor-1',
  slug: 'giorgi-beridze',
  name: 'Giorgi Beridze',
  headline: 'Math & Physics tutor with 5 years of experience',
  hourlyRate: 50,
};

describe('TutorCard (T2.9.4)', () => {
  it('renders the tutor name', () => {
    render(<TutorCard {...base} />);
    expect(screen.getByText('Giorgi Beridze')).toBeInTheDocument();
  });

  it('renders the headline', () => {
    render(<TutorCard {...base} />);
    expect(screen.getByText('Math & Physics tutor with 5 years of experience')).toBeInTheDocument();
  });

  it('renders the hourly rate formatted as GEL', () => {
    render(<TutorCard {...base} />);
    expect(screen.getByText('50 ₾')).toBeInTheDocument();
  });

  it('renders "უფასო" when hourlyRate is 0', () => {
    render(<TutorCard {...base} hourlyRate={0} />);
    expect(screen.getByText('უფასო')).toBeInTheDocument();
  });

  it('links to the tutor profile page', () => {
    render(<TutorCard {...base} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tutors/giorgi-beridze');
  });

  it('has an accessible label combining name and headline', () => {
    render(<TutorCard {...base} />);
    expect(screen.getByRole('link')).toHaveAttribute(
      'aria-label',
      'Giorgi Beridze — Math & Physics tutor with 5 years of experience',
    );
  });

  it('renders rating when provided', () => {
    render(<TutorCard {...base} rating={4.8} reviewCount={32} />);
    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(32)')).toBeInTheDocument();
  });

  it('does not render rating section when rating is omitted', () => {
    render(<TutorCard {...base} />);
    expect(screen.queryByText(/\d+\.\d/)).not.toBeInTheDocument();
  });

  it('renders category tags', () => {
    render(<TutorCard {...base} categories={['Math', 'Physics']} />);
    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('renders the first initial as placeholder when photoUrl is absent', () => {
    render(<TutorCard {...base} />);
    expect(screen.getByText('G')).toBeInTheDocument();
  });

  it('renders the default variant without extra classes', () => {
    const { container } = render(<TutorCard {...base} variant="default" />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.classList.contains('ring-2')).toBe(false);
    expect(link.classList.contains('flex-row')).toBe(false);
  });

  it('renders the featured variant with a ring', () => {
    const { container } = render(<TutorCard {...base} variant="featured" />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.classList.contains('ring-2')).toBe(true);
  });

  it('renders the compact variant with flex-row layout', () => {
    const { container } = render(<TutorCard {...base} variant="compact" />);
    const link = container.querySelector('a') as HTMLAnchorElement;
    expect(link.classList.contains('flex-row')).toBe(true);
  });
});
