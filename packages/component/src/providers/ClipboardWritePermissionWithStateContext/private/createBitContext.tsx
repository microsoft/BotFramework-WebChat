import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, {
  createContext,
  memo,
  useContext,
  useState,
  type ComponentType,
  type Dispatch,
  type SetStateAction
} from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

type BitContextType<T> = readonly [T, Dispatch<SetStateAction<T>>];

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

    const context = useState<BitContextType<T>[0]>(() => initialValue);

    return <AtomContext.Provider value={context}>{children}</AtomContext.Provider>;
  }

  return Object.freeze({
    Composer: memo(BitComposer),
    useState: () => useContext(AtomContext)
  });
}
