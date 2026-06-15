import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { listen, EventNames } from '@mgs/event-bus';
import ReviewForm from './ReviewForm';

describe('ReviewForm', () => {
  it('opens, validates, and submits a review', () => {
    const onSubmit = vi.fn();
    const events: unknown[] = [];
    const off = listen(EventNames.REVIEW_SUBMITTED, (p) => events.push(p));
    render(<ReviewForm gameId="game-1" onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Write a Review' }));
    const submit = screen.getByRole('button', { name: 'Submit Review' });
    expect(submit).toBeDisabled();

    fireEvent.click(screen.getByRole('radio', { name: 'Rate 5 stars' }));
    fireEvent.change(screen.getByLabelText('Display Name'), { target: { value: 'Tester' } });
    fireEvent.change(screen.getByLabelText('Your Review'), { target: { value: 'Great game' } });
    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(events).toHaveLength(1);
    expect(screen.getByText('✓ Review submitted!')).toBeInTheDocument();
    off();
  });

  it('can be cancelled back to the trigger button', () => {
    render(<ReviewForm gameId="game-1" />);
    fireEvent.click(screen.getByRole('button', { name: 'Write a Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Write a Review' })).toBeInTheDocument();
  });
});
