import { Routes, Route } from 'react-router-dom';
import { Layout, Main } from '@mgs/design-system';
import { AppHeader } from './components/AppHeader';
import { VersionToolbar } from './components/VersionToolbar';
import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { CartPage } from './pages/CartPage';
import { useEffect } from 'react';
import { loadManifest, prefetchRemote } from './utils/remoteLoader';

export function App() {
  // Prefetch remote entries on idle
  useEffect(() => {
    loadManifest().then((manifest) => {
      Object.values(manifest).forEach((remote) => {
        const version = remote.activeVersion;
        const versionEntry = remote.versions[version];
        if (versionEntry) {
          const urls = new Set(Object.values(versionEntry).map((e) => e.url));
          urls.forEach((url) => {
            if ('requestIdleCallback' in window) {
              requestIdleCallback(() => prefetchRemote(url));
            } else {
              setTimeout(() => prefetchRemote(url), 1000);
            }
          });
        }
      });
    }).catch(() => {
      // Manifest not available — remotes will show error fallbacks
    });
  }, []);

  return (
    <Layout>
      <AppHeader />
      <Main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:id" element={<GameDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </Main>
      <VersionToolbar />
    </Layout>
  );
}
