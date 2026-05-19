import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => mockSearchParams,
}));

import { FilterDrawer } from './filter-drawer';

const CATEGORIES = [
  { slug: 'math', name: 'მათემატიკა' },
  { slug: 'science', name: 'მეცნიერება' },
];

afterEach(() => {
  cleanup();
  mockPush.mockReset();
});

beforeEach(() => {
  mockSearchParams.delete('category');
  mockSearchParams.delete('sort');
  mockSearchParams.delete('page');
});

describe('FilterDrawer', () => {
  it('renders the filter toggle button', () => {
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="" activeSort="newest" total={12} />,
    );
    expect(screen.getByRole('button', { name: /ფილტრი/i })).toBeInTheDocument();
  });

  it('opens the drawer on button click', async () => {
    const user = userEvent.setup();
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="" activeSort="newest" total={12} />,
    );
    await user.click(screen.getByRole('button', { name: /ფილტრი/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows all categories inside the drawer', async () => {
    const user = userEvent.setup();
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="" activeSort="newest" total={12} />,
    );
    await user.click(screen.getByRole('button', { name: /ფილტრი/i }));
    expect(screen.getByText('მათემატიკა')).toBeInTheDocument();
    expect(screen.getByText('მეცნიერება')).toBeInTheDocument();
  });

  it('closes the drawer when the close button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="" activeSort="newest" total={12} />,
    );
    await user.click(screen.getByRole('button', { name: /ფილტრი/i }));
    await user.click(screen.getByRole('button', { name: /დახურვა/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls router.push with the selected category on apply', async () => {
    const user = userEvent.setup();
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="" activeSort="newest" total={12} />,
    );
    await user.click(screen.getByRole('button', { name: /ფილტრი/i }));
    await user.click(screen.getByText('მათემატიკა'));
    await user.click(screen.getByRole('button', { name: /ექსპერტ/i }));
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush.mock.calls[0]?.[0]).toContain('category=math');
  });

  it('navigates without category param when "ყველა" is selected', async () => {
    const user = userEvent.setup();
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="math" activeSort="newest" total={5} />,
    );
    await user.click(screen.getByRole('button', { name: /ფილტრი/i }));
    await user.click(screen.getByText('ყველა'));
    await user.click(screen.getByRole('button', { name: /ექსპერტ/i }));
    expect(mockPush).toHaveBeenCalledOnce();
    expect(mockPush.mock.calls[0]?.[0]).not.toContain('category=');
  });

  it('clears pending selections when "გასუფთავება" is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="math" activeSort="rating" total={5} />,
    );
    await user.click(screen.getByRole('button', { name: /ფილტრი/i }));
    await user.click(screen.getByText('გასუფთავება'));
    await user.click(screen.getByRole('button', { name: /ექსპერტ/i }));
    const url: string = mockPush.mock.calls[0]?.[0] as string;
    expect(url).not.toContain('category=');
    expect(url).not.toContain('sort=');
  });

  it('shows active filter count badge when filters are applied', () => {
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="math" activeSort="rating" total={5} />,
    );
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not show badge when no filters are active', () => {
    render(
      <FilterDrawer categories={CATEGORIES} activeCategory="" activeSort="newest" total={12} />,
    );
    expect(screen.queryByText('1')).not.toBeInTheDocument();
    expect(screen.queryByText('2')).not.toBeInTheDocument();
  });
});
