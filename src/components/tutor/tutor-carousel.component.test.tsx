import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TutorCarousel, type TutorCarouselProps } from './tutor-carousel';
import type { TutorCardProps } from './tutor-card';

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

function makeTutor(n: number): TutorCardProps {
  return {
    id: `tutor-${n}`,
    slug: `tutor-${n}`,
    name: `Tutor ${n}`,
    headline: `Tutor ${n} headline`,
    hourlyRate: 50 + n * 10,
  };
}

const tutors: TutorCardProps[] = [1, 2, 3, 4, 5].map(makeTutor);

const baseProps: TutorCarouselProps = { tutors };

describe('TutorCarousel (T2.9.6)', () => {
  it('renders nothing when tutors array is empty', () => {
    const { container } = render(<TutorCarousel tutors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders a card for each tutor', () => {
    render(<TutorCarousel {...baseProps} />);
    for (let i = 1; i <= 5; i++) {
      expect(screen.getByText(`Tutor ${i}`)).toBeInTheDocument();
    }
  });

  it('renders a section with the provided title', () => {
    render(<TutorCarousel {...baseProps} title="Featured Tutors" />);
    expect(screen.getByRole('region', { name: 'Featured Tutors' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Featured Tutors' })).toBeInTheDocument();
  });

  it('uses a default aria-label when title is omitted', () => {
    render(<TutorCarousel tutors={tutors.slice(0, 1)} />);
    expect(screen.getByRole('region', { name: 'Tutor carousel' })).toBeInTheDocument();
  });

  it('renders the list with role=list', () => {
    render(<TutorCarousel {...baseProps} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('renders each tutor card as a list item', () => {
    render(<TutorCarousel {...baseProps} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(5);
  });

  it('moves focus to the next card on ArrowRight', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel {...baseProps} />);
    const [first, second] = screen.getAllByRole('link') as [HTMLElement, HTMLElement];

    first.focus();
    expect(first).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(second).toHaveFocus();
  });

  it('moves focus to the previous card on ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel {...baseProps} />);
    const [, second, third] = screen.getAllByRole('link') as [
      HTMLElement,
      HTMLElement,
      HTMLElement,
    ];

    third.focus();
    expect(third).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(second).toHaveFocus();
  });

  it('does not move focus beyond the first card on ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel {...baseProps} />);
    const [first] = screen.getAllByRole('link') as [HTMLElement];

    first.focus();
    await user.keyboard('{ArrowLeft}');
    expect(first).toHaveFocus();
  });

  it('does not move focus beyond the last card on ArrowRight', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel {...baseProps} />);
    const allLinks = screen.getAllByRole('link');
    const last = allLinks[allLinks.length - 1] as HTMLElement;

    last.focus();
    await user.keyboard('{ArrowRight}');
    expect(last).toHaveFocus();
  });
});
