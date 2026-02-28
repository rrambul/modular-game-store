import { useState, useEffect, useCallback } from 'react';
import { Badge, Button } from '@mgs/design-system';
import { loadManifest, setVersionOverride, getVersionOverrides } from '../utils/remoteLoader';
import type { RemoteManifest } from '@mgs/types';

export function VersionToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [manifest, setManifest] = useState<RemoteManifest | null>(null);
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    loadManifest()
      .then(setManifest)
      .catch(() => setManifest(null));
    setOverrides(getVersionOverrides());
  }, []);

  const handleVersionChange = useCallback((remoteName: string, version: string) => {
    setVersionOverride(remoteName, version);
    setOverrides({ ...getVersionOverrides() });
    // Force reload to pick up new version
    window.location.reload();
  }, []);

  if (!manifest) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-colors"
        aria-label="Toggle version toolbar"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        MF Versions
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-surface-secondary rounded-card shadow-card-hover border border-white/10 animate-slide-up">
          <div className="p-4 border-b border-white/10">
            <h3 className="font-display font-semibold text-text-primary">Microfrontend Versions</h3>
            <p className="text-xs text-text-muted mt-1">Switch remote versions at runtime</p>
          </div>
          <div className="p-4 space-y-4">
            {Object.entries(manifest).map(([remoteName, remote]) => {
              const versions = Object.keys(remote.versions);
              const activeVersion = overrides[remoteName] || remote.activeVersion;

              return (
                <div key={remoteName}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary capitalize">{remoteName}</span>
                    <Badge variant="info" size="sm">v{activeVersion}</Badge>
                  </div>
                  <div className="flex gap-2">
                    {versions.map((v) => (
                      <Button
                        key={v}
                        size="sm"
                        variant={activeVersion === v ? 'primary' : 'secondary'}
                        onClick={() => handleVersionChange(remoteName, v)}
                      >
                        v{v}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-3 border-t border-white/10 text-center">
            <p className="text-xs text-text-muted">
              Switching versions reloads the page to fetch the new remoteEntry.js
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
