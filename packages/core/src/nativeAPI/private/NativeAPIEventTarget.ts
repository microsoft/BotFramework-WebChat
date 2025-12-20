interface EventListener<T extends Event> {
  (evt: T): void;
}

interface EventListenerObject<T extends Event> {
  handleEvent(object: T): void;
}

type Activity = any;

class IncomingActivityEvent extends CustomEvent<Activity> {
  // eslint-disable-next-line no-useless-constructor
  constructor(type: 'incomingactivity', eventInitDict?: EventInit & { detail: Activity }) {
    super(type, eventInitDict);
  }
}

type NativeAPIEventMap = {
  incomingactivity: IncomingActivityEvent;
};

class NativeAPIEventTarget extends EventTarget {
  addEventListener(
    type: keyof NativeAPIEventMap,
    listener: EventListener<NativeAPIEventMap[typeof type]> | EventListenerObject<NativeAPIEventMap[typeof type]>,
    options?: AddEventListenerOptions | boolean
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: keyof NativeAPIEventMap,
    listener: EventListener<NativeAPIEventMap[typeof type]> | EventListenerObject<NativeAPIEventMap[typeof type]>,
    options?: EventListenerOptions | boolean
  ): void {
    super.removeEventListener(type, listener, options);
  }
}

export default NativeAPIEventTarget;
export { IncomingActivityEvent, type NativeAPIEventMap };
