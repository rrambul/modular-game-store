import { Layout, Header, Main } from '@mgs/design-system';
import ReviewList from './components/ReviewList';

export function App() {
  return (
    <Layout>
      <Header>
        <span className="text-xl font-display font-bold text-text-primary">
          ⭐ Reviews MF <span className="text-xs text-text-muted">(standalone)</span>
        </span>
      </Header>
      <Main>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-6">
          Demo: Reviews for Sample Game
        </h1>
        <ReviewList gameId="game-1" />
      </Main>
    </Layout>
  );
}
