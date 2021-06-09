type CallFunction<TArguments extends any[], TResult> = (...args: TArguments) => TResult;

type FunctionEnhancer<TCallArguments extends any[], TResult> = (
  next: CallFunction<TCallArguments, TResult>
) => CallFunction<TCallArguments, TResult>;

type FunctionMiddleware<TSetupArguments extends any[], TCallArguments extends any[], TResult> = (
  ...args: TSetupArguments
) => FunctionEnhancer<TCallArguments, TResult>;

export default FunctionMiddleware;

export type { CallFunction, FunctionEnhancer };
