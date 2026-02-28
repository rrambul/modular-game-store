export interface Game {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  genre: Genre;
  rating: number;
  reviewCount: number;
  platforms: Platform[];
  releaseDate: string;
  developer: string;
  publisher: string;
  tags: string[];
}

export type Genre =
  | 'Action'
  | 'Adventure'
  | 'RPG'
  | 'Strategy'
  | 'Simulation'
  | 'Sports'
  | 'Puzzle'
  | 'Horror'
  | 'FPS'
  | 'Indie';

export type Platform = 'PC' | 'PlayStation' | 'Xbox' | 'Nintendo' | 'Mobile';

export interface CartItem {
  gameId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Review {
  id: string;
  gameId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface RemoteManifestEntry {
  url: string;
  scope: string;
  module: string;
  version: string;
}

export interface RemoteManifest {
  [remoteName: string]: {
    versions: {
      [version: string]: RemoteManifestEntry;
    };
    activeVersion: string;
  };
}
