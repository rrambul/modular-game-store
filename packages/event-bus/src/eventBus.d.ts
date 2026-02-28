import type { CartItem } from '@mgs/types';
export declare const EventNames: {
    readonly CART_ITEM_ADDED: "mgs:cart:item-added";
    readonly CART_ITEM_REMOVED: "mgs:cart:item-removed";
    readonly CART_UPDATED: "mgs:cart:updated";
    readonly REVIEW_SUBMITTED: "mgs:review:submitted";
    readonly NAVIGATE: "mgs:navigate";
};
export interface EventPayloadMap {
    [EventNames.CART_ITEM_ADDED]: {
        gameId: string;
        title: string;
        price: number;
        image: string;
    };
    [EventNames.CART_ITEM_REMOVED]: {
        gameId: string;
    };
    [EventNames.CART_UPDATED]: {
        items: CartItem[];
        totalItems: number;
        totalPrice: number;
    };
    [EventNames.REVIEW_SUBMITTED]: {
        gameId: string;
        rating: number;
        comment: string;
        author: string;
    };
    [EventNames.NAVIGATE]: {
        path: string;
    };
}
export type EventName = (typeof EventNames)[keyof typeof EventNames];
export declare function dispatch<K extends keyof EventPayloadMap>(name: K, payload: EventPayloadMap[K]): void;
export declare function listen<K extends keyof EventPayloadMap>(name: K, handler: (payload: EventPayloadMap[K]) => void): () => void;
//# sourceMappingURL=eventBus.d.ts.map