type GenericHandler<Result, Request> = (request: Request) => Result;
type GenericEnhancer<Result, Request> = (next: GenericHandler<Result, Request>) => GenericHandler<Result, Request>;
type GenericMiddleware<Result, Request, Init> = (init: Init) => GenericEnhancer<Result, Request>;

function composeEnhancer<Result, Request>(
  ...enhancers: readonly GenericEnhancer<Result, Request>[]
): GenericEnhancer<Result, Request> {
  return next => enhancers.reduce((chain, enhancer) => enhancer(chain), next);
}

export default composeEnhancer;
export { type GenericEnhancer, type GenericHandler, type GenericMiddleware };
