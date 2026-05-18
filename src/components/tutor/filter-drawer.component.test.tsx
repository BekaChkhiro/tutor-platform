import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilterDrawer, type FilterDrawerProps } from './filter-drawer';

afterEach(cleanup);

const noop = vi.fn();

const baseProps: FilterDrawerProps = {
  open: true,
  onClose: noop,
  filters: {},
  onApply: noop,
  availableCategories: ['Math', 'Physics', 'Law'],
};

describe('FilterDrawer (T2.9.5)', () => {
  it('is not rendered when open=false', () => {
    render(<FilterDrawer {...baseProps} open={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders the dialog when open=true', () => {
    render(<FilterDrawer {...baseProps} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('has aria-modal set to "true"', () => {
    render(<FilterDrawer {...baseProps} />);
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
  });

  it('renders available categories as toggle buttons', () => {
    render(<FilterDrawer {...baseProps} />);
    expect(screen.getByRole('button', { name: 'Math' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Physics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Law' })).toBeInTheDocument();
  });

  it('marks selected category as aria-pressed=true', () => {
    render(<FilterDrawer {...baseProps} filters={{ categories: ['Math'] }} />);
    expect(screen.getByRole('button', { name: 'Math' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Physics' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('toggles a category on click', async () => {
    const user = userEvent.setup();
    render(<FilterDrawer {...baseProps} filters={{}} />);
    const mathBtn = screen.getByRole('button', { name: 'Math' });

    expect(mathBtn).toHaveAttribute('aria-pressed', 'false');
    await user.click(mathBtn);
    expect(mathBtn).toHaveAttribute('aria-pressed', 'true');
    await user.click(mathBtn);
    expect(mathBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onApply with current draft state when "Apply filters" is clicked', async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    render(<FilterDrawer {...baseProps} onApply={onApply} filters={{}} />);

    await user.click(screen.getByRole('button', { name: 'Physics' }));
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ categories: ['Physics'] }));
  });

  it('calls onClose when "Apply filters" is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<FilterDrawer {...baseProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets draft to empty on "Clear all"', async () => {
    const user = userEvent.setup();
    render(<FilterDrawer {...baseProps} filters={{ categories: ['Math'], rating: 4 }} />);

    expect(screen.getByRole('button', { name: 'Math' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByRole('button', { name: 'Math' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<FilterDrawer {...baseProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Close filters' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<FilterDrawer {...baseProps} onClose={onClose} />);
    await user.click(screen.getByTestId('filter-drawer-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('resets draft to incoming filters when reopened', async () => {
    const { rerender } = render(
      <FilterDrawer {...baseProps} open={false} filters={{ categories: ['Law'] }} />,
    );
    rerender(<FilterDrawer {...baseProps} open={true} filters={{ categories: ['Law'] }} />);
    expect(screen.getByRole('button', { name: 'Law' })).toHaveAttribute('aria-pressed', 'true');
  });
});
