import { Layout, Header, Main } from '@mgs/design-system';
import CartPage from './components/CartPage';
import { CartProvider } from './store/CartProvider';

export function App() {
  return (
    <CartProvider>
      <Layout>
        <Header>
          <span className="text-xl font-display font-bold text-text-primary">
            🛒 Cart MF <span className="text-xs text-text-muted">(standalone)</span>
          </span>
        </Header>
        <Main>
          <CartPage />
        </Main>
      </Layout>
    </CartProvider>
  );
}
