import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { TutorCarousel } from './tutor-carousel';

afterEach(() => cleanup());

function makeCards(n: number) {
  return Array.from({ length: n }, (_, i) => (
    <div key={i} style={{ scrollSnapAlign: 'start' }}>
      <a href={`/tutors/tutor-${i}`}>სპეციალისტი {i}</a>
    </div>
  ));
}

describe('TutorCarousel', () => {
  it('renders with the expected region role and default label', () => {
    render(<TutorCarousel>{makeCards(3)}</TutorCarousel>);
    expect(screen.getByRole('region', { name: 'ექსპერტების კარუსელი' })).toBeInTheDocument();
  });

  it('renders all children', () => {
    render(<TutorCarousel>{makeCards(3)}</TutorCarousel>);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('accepts a custom label via prop', () => {
    render(<TutorCarousel label="custom label">{makeCards(2)}</TutorCarousel>);
    expect(screen.getByRole('region', { name: 'custom label' })).toBeInTheDocument();
  });

  it('moves focus to the next card on ArrowRight', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel>{makeCards(3)}</TutorCarousel>);
    const [first, second] = screen.getAllByRole<HTMLAnchorElement>('link');
    if (!first || !second) throw new Error('expected at least 2 links');
    first.focus();
    expect(first).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(second).toHaveFocus();
  });

  it('moves focus to the previous card on ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel>{makeCards(3)}</TutorCarousel>);
    const [first, second] = screen.getAllByRole<HTMLAnchorElement>('link');
    if (!first || !second) throw new Error('expected at least 2 links');
    second.focus();
    await user.keyboard('{ArrowLeft}');
    expect(first).toHaveFocus();
  });

  it('does not move past the first card on ArrowLeft', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel>{makeCards(3)}</TutorCarousel>);
    const [first] = screen.getAllByRole<HTMLAnchorElement>('link');
    if (!first) throw new Error('expected at least 1 link');
    first.focus();
    await user.keyboard('{ArrowLeft}');
    expect(first).toHaveFocus();
  });

  it('does not move past the last card on ArrowRight', async () => {
    const user = userEvent.setup();
    render(<TutorCarousel>{makeCards(2)}</TutorCarousel>);
    const links = screen.getAllByRole<HTMLAnchorElement>('link');
    const last = links.at(-1);
    if (!last) throw new Error('expected at least 1 link');
    last.focus();
    await user.keyboard('{ArrowRight}');
    expect(last).toHaveFocus();
  });
});
