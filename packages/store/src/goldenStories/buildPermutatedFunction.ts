function buildPermutatedFunction<TParameter, TFn extends (...args: any[]) => any>(
  permutations: [string, TParameter][],
  fn: (parameter: TParameter, ...args: Parameters<TFn>) => ReturnType<TFn>
): [string, TFn][] {
  return permutations.map(([message, parameter]) => [
    message,
    fn.bind<undefined, [TParameter], Parameters<TFn>, ReturnType<TFn>>(undefined, parameter) as TFn
  ]);
}

export default buildPermutatedFunction;
