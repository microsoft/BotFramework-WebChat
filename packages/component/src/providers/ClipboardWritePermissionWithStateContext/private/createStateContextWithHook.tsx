// import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import { validateProps } from 'botframework-webchat-api/internal';
import React, {
  createContext,
  memo,
  useContext,
  useMemo,
  useState,
  type ComponentType,
  type Dispatch,
  type ReactNode,
  type SetStateAction
} from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';
import reactNode from '../../../types/internal/reactNode';

type GenericContextType<T> = Readonly<{
  valueState: readonly [T, Dispatch<SetStateAction<T>>];
}>;

type GenericComposerProps<T> = Readonly<{
  children?: ReactNode | undefined;
  defaultValue: T;
}>;

export default function createStateContextWithHook<T>(defaultValue: T): Readonly<{
  Composer: ComponentType<GenericComposerProps<T>>;
  useValue(): readonly [T, Dispatch<SetStateAction<T>>];
  '~types': {
    props: GenericComposerProps<T>;
  };
}> {
  type ContextType = GenericContextType<T>;

  const Context = createContext<ContextType>(
    new Proxy({} as ContextType, {
      get() {
        throw new Error('botframework-webchat: This hook can only be used under its corresponding context.');
      }
    })
  );

  const composerPropsSchema = pipe(
    object({
      children: optional(reactNode())
    }),
    readonly()
  );

  type ComposerProps = InferInput<typeof composerPropsSchema>;

  function Composer(props: ComposerProps) {
    // const { children, defaultValue } = validateProps(composerPropsSchema, props);
    const { children } = validateProps(composerPropsSchema, props);

    const valueState = useState<ContextType['valueState'][0]>(() => defaultValue as any);

    const context = useMemo<ContextType>(() => Object.freeze({ valueState }), [valueState]);

    return <Context.Provider value={context}>{children}</Context.Provider>;
  }

  return Object.freeze({
    Composer: memo(Composer),
    useValue: () => useContext(Context).valueState,
    '~types': {
      props: {} as any
    }
  });
}
