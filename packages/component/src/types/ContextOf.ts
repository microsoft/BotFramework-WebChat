import { type Context } from 'react';

type ContextOf<T extends Context<unknown>> = T extends Context<infer C> ? C : never;

export type { ContextOf };
