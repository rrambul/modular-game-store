import { Routes, Route } from 'react-router-dom';
import { Layout, Main } from '@mgs/design-system';
import { AppHeader } from './components/AppHeader';
import { VersionToolbar } from './components/VersionToolbar';
import { HomePage } from './pages/HomePage';
import { GameDetailPage } from './pages/GameDetailPage';
import { CartPage } from './pages/CartPage';

export function App() {
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
