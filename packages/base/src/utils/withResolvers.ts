// Promise.withResolvers() is about 90 KiB.
// @ts-expect-error: no types available
import coreJSWithResolvers from 'core-js-pure/features/promise/with-resolvers.js';

export type PromiseWithResolvers<T> = {
  promise: Promise<T>;
  reject: (error: unknown) => void;
  resolve: (value: T) => void;
};

export default function withResolvers<T>(): PromiseWithResolvers<T> {
  return coreJSWithResolvers();
}
