import { createContext, type ReactNode } from 'react';

type DialogInit = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  className?: string;
};

type RenderFunction = () => ReactNode;

type ContextType = Readonly<{
  close(): void;
  showModal(render: RenderFunction, init?: DialogInit): void;
}>;

type ContextAsGetter<T extends Record<string, unknown>> =
  T extends Record<infer K, infer V> ? Record<K, { get(): V }> : never;

const defaultContextValue: ContextAsGetter<ContextType> = {
  close: {
    get() {
      throw new Error('close cannot be used outside of <ModalDialogComposer>.');
    }
  },
  showModal: {
    get() {
      throw new Error('showModal cannot be used outside of <ModalDialogComposer>.');
    }
  }
};

const Context = createContext<ContextType>(Object.create({}, defaultContextValue));

Context.displayName = 'ModalDialogComposer';

export default Context;
