import { type ComponentType, type MemoExoticComponent } from 'react';

export type PropsOf<T> =
  T extends ComponentType<infer P> ? P : T extends MemoExoticComponent<ComponentType<infer P>> ? P : never;
