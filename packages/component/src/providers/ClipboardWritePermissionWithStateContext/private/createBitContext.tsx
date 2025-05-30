import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, {
  createContext,
  memo,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type Dispatch,
  type SetStateAction
} from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

type BitContextType<T> = Readonly<{
  state: readonly [T, Dispatch<SetStateAction<T>>];
}>;

const bitComposerPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type BitComposerProps = InferInput<typeof bitComposerPropsSchema>;

export default function createBitContext<T>(initialValue: T): Readonly<{
  Composer: ComponentType<BitComposerProps>;
  useState(): readonly [T, Dispatch<SetStateAction<T>>];
}> {
  const AtomContext = createContext<BitContextType<T>>(
    new Proxy({} as BitContextType<T>, {
      get() {
        throw new Error('botframework-webchat: This hook can only be used under its corresponding context.');
      }
    })
  );

  function BitComposer(props: BitComposerProps) {
    const { children } = validateProps(bitComposerPropsSchema, props);

    const state = useState<BitContextType<T>['state'][0]>(() => initialValue);

    const context = useMemo<BitContextType<T>>(() => Object.freeze({ state }), [state]);

    return <AtomContext.Provider value={context}>{children}</AtomContext.Provider>;
  }

  return Object.freeze({
    Composer: memo(BitComposer),
    useState: () => useContext(AtomContext).state
  });
}
