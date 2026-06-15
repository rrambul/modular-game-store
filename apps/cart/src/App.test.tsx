import '@testing-library/jest-dom/vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('Cart standalone App', () => {
  beforeEach(() => localStorage.clear());

  it('renders the standalone cart shell', () => {
    render(<App />);
    expect(screen.getByText('(standalone)')).toBeInTheDocument();
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
  });
});
