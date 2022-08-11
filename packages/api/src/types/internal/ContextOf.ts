import type { Context } from 'react';

type ContextOf<T> = T extends Context<infer P> ? P : never;

export type { ContextOf };
