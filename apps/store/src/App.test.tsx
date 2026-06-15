import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('./components/RemoteComponent', () => ({
  RemoteComponent: () => <div data-testid="remote" />,
}));

import { App } from './App';

describe('store App', () => {
  it('renders the header and the home route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText('GameStore')).toBeInTheDocument();
    expect(screen.getByText('Modular Game Store')).toBeInTheDocument();
  });
});
