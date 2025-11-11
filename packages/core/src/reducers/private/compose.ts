type ComposeFn<T> = (value: T) => T;

const IDENTITY_FUNCTION: ComposeFn<any> = value => value;

function compose<T>(...fns: readonly ComposeFn<T>[]): ComposeFn<T> {
  return fns.reduce(
    (fn, prevFn): ComposeFn<T> =>
      value =>
        fn(prevFn(value)),
    IDENTITY_FUNCTION
  );
}

export default compose;
export { type ComposeFn };
