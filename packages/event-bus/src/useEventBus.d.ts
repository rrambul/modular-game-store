import { type EventPayloadMap } from './eventBus';
/**
 * React hook that subscribes to a cross-MF event.
 * Automatically cleans up on unmount.
 */
export declare function useEventBus<K extends keyof EventPayloadMap>(eventName: K, handler: (payload: EventPayloadMap[K]) => void): void;
//# sourceMappingURL=useEventBus.d.ts.map