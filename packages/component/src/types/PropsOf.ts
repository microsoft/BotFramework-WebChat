import { type ComponentType } from 'react';

export type PropsOf<T extends ComponentType> = T extends ComponentType<infer P> ? P : never;
