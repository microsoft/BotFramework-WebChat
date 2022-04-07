export type AnyAnd<T> = Omit<any, keyof T> & T;
