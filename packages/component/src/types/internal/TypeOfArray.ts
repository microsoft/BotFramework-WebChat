export type TypeOfArray<T extends unknown[] | Array<unknown> | ReadonlyArray<unknown>> = T extends (infer I)[]
  ? I
  : T extends readonly (infer I)[]
  ? I
  : T;
