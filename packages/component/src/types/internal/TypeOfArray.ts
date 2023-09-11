export type TypeOfArray<T extends unknown[] | Array<unknown> | ReadonlyArray<unknown>> = T extends (infer I)[]
  ? I
  : T extends Array<infer I>
  ? I
  : T extends ReadonlyArray<infer I>
  ? I
  : T;
