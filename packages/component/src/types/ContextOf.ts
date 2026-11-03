import { type Context } from 'react';

type ContextOf<T> = T extends Context<infer C> ? C : never;

export type { ContextOf };
