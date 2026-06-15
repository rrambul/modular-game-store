import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReviewSummary from './ReviewSummary';

describe('ReviewSummary', () => {
  it('renders the rating and a pluralised count', () => {
    render(<ReviewSummary averageRating={4.5} reviewCount={3} />);
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('3 reviews')).toBeInTheDocument();
  });

  it('uses the singular form for a single review', () => {
    render(<ReviewSummary averageRating={5} reviewCount={1} />);
    expect(screen.getByText('1 review')).toBeInTheDocument();
  });
});
