import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../components/RemoteComponent', () => ({
  RemoteComponent: ({ componentName }: { componentName: string }) => (
    <div data-testid="remote">{componentName}</div>
  ),
}));

import { CartPage } from './CartPage';

describe('store CartPage', () => {
  it('embeds the cart remote', () => {
    render(<CartPage />);
    expect(screen.getByTestId('remote')).toHaveTextContent('CartPage');
  });
});
