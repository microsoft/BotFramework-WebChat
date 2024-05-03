export default function createOnEventShim<Name extends string = string, Target extends EventTarget = EventTarget>(
  target: Target
) {
  const currentListeners: Map<Name, EventListener> = new Map();

  return {
    get(name: Name): EventListener | undefined {
      return currentListeners.get(name);
    },
    set(name: Name, listener: EventListener | undefined): void {
      const current = currentListeners.get(name);

      current && target.removeEventListener(name, current);

      if (listener) {
        target.addEventListener(name, listener);
        currentListeners.set(name, listener);
      } else {
        currentListeners.delete(name);
      }
    }
  };
}
