import { useEffect, useRef } from 'react';
import { listen, type EventPayloadMap } from './eventBus';

/**
 * React hook that subscribes to a cross-MF event.
 * Automatically cleans up on unmount.
 */
export function useEventBus<K extends keyof EventPayloadMap>(
  eventName: K,
  handler: (payload: EventPayloadMap[K]) => void,
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const unsubscribe = listen(eventName, (payload) => {
      savedHandler.current(payload);
    });
    return unsubscribe;
  }, [eventName]);
}
