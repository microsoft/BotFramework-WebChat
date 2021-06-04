export type CallFunction<TArguments extends any[], TResult> = (...args: TArguments) => TResult;

export type FunctionEnhancer<TCallArguments extends any[], TResult> = (
  next: CallFunction<TCallArguments, TResult>
) => CallFunction<TCallArguments, TResult>;

export type FunctionMiddleware<TSetupArguments extends any[], TCallArguments extends any[], TResult> = (
  ...args: TSetupArguments
) => FunctionEnhancer<TCallArguments, TResult>;

export default FunctionMiddleware;
