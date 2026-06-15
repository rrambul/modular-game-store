import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RemoteComponent } from './RemoteComponent';

const silenceConsole = () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  return () => {
    error.mockRestore();
    warn.mockRestore();
  };
};

describe('RemoteComponent', () => {
  it('loads and renders each registered remote that resolves', async () => {
    const entries = [
      ['cart', 'CartWidget'],
      ['cart', 'CartPage'],
      ['reviews', 'ReviewList'],
      ['reviews', 'ReviewSummary'],
    ] as const;
    for (const [remoteName, componentName] of entries) {
      const { unmount } = render(
        <RemoteComponent remoteName={remoteName} componentName={componentName} />,
      );
      expect(await screen.findByTestId('remote-stub')).toBeInTheDocument();
      unmount();
    }
  });

  it('renders the default error fallback for an unknown module', async () => {
    const restore = silenceConsole();
    render(<RemoteComponent remoteName="ghost" componentName="Nope" />);
    expect(await screen.findByText(/is currently unavailable/i)).toBeInTheDocument();
    restore();
  });

  it('renders a custom error fallback when a remote fails to load', async () => {
    const restore = silenceConsole();
    render(
      <RemoteComponent
        remoteName="reviews"
        componentName="ReviewForm"
        errorFallback={<div>custom-error</div>}
      />,
    );
    expect(await screen.findByText('custom-error')).toBeInTheDocument();
    restore();
  });
});
