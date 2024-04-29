import { WaitUntilable } from './internal/createWaitUntilable';

// TODO [P0]: remove to `use-propagate` when it
// is able to work with React v16+
// import { createPropagation } from 'use-propagate';
import { useEffect } from 'react';
import { useRefFrom } from 'use-ref-from';

function removeInline<T>(array: T[], ...items: T[]): void {
  for (const item of items) {
    let index;

    while (~(index = array.indexOf(item))) {
      array.splice(index, 1);
    }
  }
}

type Listener<T> = (value: T) => void;

export default function createPropagation<T>() {
  type Fn = Listener<T>;

  const listeners: Fn[] = [];

  // eslint-disable-next-line no-void
  const addListener = (listener: Fn): void => void listeners.push(listener);
  const removeListener = (listener: Fn): void => removeInline(listeners, listener);
  const usePropagate = () => (value: T) => listeners.forEach(listener => listener(value));

  return {
    useListen: (listener: Fn) => {
      const listenerRef = useRefFrom(listener);

      useEffect(() => {
        const wrappingListener = (value: T) => listenerRef.current(value);

        addListener(wrappingListener);

        return () => removeListener(wrappingListener);
      }, [listenerRef]);
    },
    usePropagate
  };
}
// end of the TODO

export type SendBoxFocusOptions = WaitUntilable<{ noKeyboard: boolean }>;

const { useListen: useRegisterFocusSendBox, usePropagate: useFocusSendBox } = createPropagation<SendBoxFocusOptions>();

export { useRegisterFocusSendBox, useFocusSendBox };
