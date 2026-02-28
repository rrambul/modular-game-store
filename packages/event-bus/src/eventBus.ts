import type { CartItem } from '@mgs/types';

// ---- Event name constants ----
export const EventNames = {
  CART_ITEM_ADDED: 'mgs:cart:item-added',
  CART_ITEM_REMOVED: 'mgs:cart:item-removed',
  CART_UPDATED: 'mgs:cart:updated',
  REVIEW_SUBMITTED: 'mgs:review:submitted',
  NAVIGATE: 'mgs:navigate',
} as const;

// ---- Event payload types ----
export interface EventPayloadMap {
  [EventNames.CART_ITEM_ADDED]: { gameId: string; title: string; price: number; image: string };
  [EventNames.CART_ITEM_REMOVED]: { gameId: string };
  [EventNames.CART_UPDATED]: { items: CartItem[]; totalItems: number; totalPrice: number };
  [EventNames.REVIEW_SUBMITTED]: { gameId: string; rating: number; comment: string; author: string };
  [EventNames.NAVIGATE]: { path: string };
}

export type EventName = (typeof EventNames)[keyof typeof EventNames];

// ---- Core dispatch / listen ----
export function dispatch<K extends keyof EventPayloadMap>(name: K, payload: EventPayloadMap[K]): void {
  window.dispatchEvent(new CustomEvent(name, { detail: payload }));
}

export function listen<K extends keyof EventPayloadMap>(
  name: K,
  handler: (payload: EventPayloadMap[K]) => void,
): () => void {
  const listener = (e: Event) => handler((e as CustomEvent).detail);
  window.addEventListener(name, listener);
  return () => window.removeEventListener(name, listener);
}
