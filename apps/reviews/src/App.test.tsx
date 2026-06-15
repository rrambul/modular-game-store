import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('Reviews standalone App', () => {
  it('renders the standalone reviews shell with a demo list', () => {
    render(<App />);
    expect(screen.getByText('Demo: Reviews for Sample Game')).toBeInTheDocument();
    expect(screen.getByText('GamerPro99')).toBeInTheDocument();
  });
});
