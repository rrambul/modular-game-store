import type { Review } from '@mgs/types';

const mockReviews: Review[] = [
  {
    id: 'r1',
    gameId: 'game-1',
    author: 'GamerPro99',
    rating: 5,
    comment: 'Absolutely stunning open-world experience. The graphics are breathtaking and the storyline keeps you hooked for hours. A true masterpiece!',
    date: '2025-12-15',
    helpful: 42,
  },
  {
    id: 'r2',
    gameId: 'game-1',
    author: 'CasualPlayer',
    rating: 4,
    comment: 'Great game overall. Combat mechanics are solid and the world design is top-notch. Lost a star for occasional frame drops.',
    date: '2025-11-28',
    helpful: 18,
  },
  {
    id: 'r3',
    gameId: 'game-1',
    author: 'RPGLover',
    rating: 5,
    comment: 'Best RPG I have played this year. The character progression system is deep and rewarding. Side quests feel meaningful.',
    date: '2025-10-05',
    helpful: 35,
  },
  {
    id: 'r4',
    gameId: 'game-2',
    author: 'SpeedRunner',
    rating: 3,
    comment: 'Fun but a bit short. Finished the main story in 12 hours. Multiplayer mode makes up for it though.',
    date: '2025-09-20',
    helpful: 7,
  },
  {
    id: 'r5',
    gameId: 'game-2',
    author: 'StoryFirst',
    rating: 4,
    comment: 'Loved the narrative. The voice acting is superb and the plot twists genuinely surprised me.',
    date: '2025-08-14',
    helpful: 22,
  },
  {
    id: 'r6',
    gameId: 'game-3',
    author: 'StrategyMind',
    rating: 5,
    comment: 'Perfect balance of depth and accessibility. Every decision feels impactful. The AI is challenging without being unfair.',
    date: '2025-12-01',
    helpful: 31,
  },
  {
    id: 'r7',
    gameId: 'game-3',
    author: 'NightOwl',
    rating: 4,
    comment: 'Addictive gameplay loop. Lost track of time multiple sessions. Great value for the price.',
    date: '2025-07-19',
    helpful: 14,
  },
  {
    id: 'r8',
    gameId: 'game-4',
    author: 'PixelArtFan',
    rating: 5,
    comment: 'Beautiful retro aesthetic with modern gameplay. The soundtrack is an absolute banger. Indie gem of the year!',
    date: '2025-11-10',
    helpful: 28,
  },
];

export function getReviewsForGame(gameId: string): Review[] {
  return mockReviews.filter((r) => r.gameId === gameId);
}

export function getAllReviews(): Review[] {
  return mockReviews;
}

export function getAverageRating(gameId: string): { average: number; count: number } {
  const reviews = getReviewsForGame(gameId);
  if (reviews.length === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return { average: sum / reviews.length, count: reviews.length };
}
