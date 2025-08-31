import { type ComponentHandlerResult } from 'react-chain-of-responsibility/preview';
import { ErrorBoundaryBody, ErrorBoundaryWrapper } from './ErrorBoundaryForRenderFunction';
import type templatePolymiddleware from './templatePolymiddleware';
import unwrapIfValiError from './unwrapIfValiError';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default function createErrorBoundaryMiddleware<Request, Props extends {}>({
  createMiddleware,
  reactComponent,
  where
}: Pick<ReturnType<typeof templatePolymiddleware<Request, Props>>, 'createMiddleware' | 'reactComponent'> & {
  where: string;
}) {
  return createMiddleware(next => request => {
    // TODO: [P1] Simplify this code.
    let result: ComponentHandlerResult<Props> | undefined;

    try {
      result = next(request);

      return (
        result &&
        reactComponent(ErrorBoundaryBody, undefined, {
          wrapperComponent: ErrorBoundaryWrapper,
          wrapperProps: {
            renderFunction: result?.render,
            where
          }
        })
      );
    } catch (error) {
      // Simplify code by re-assigning to `error`.
      // eslint-disable-next-line no-ex-assign
      error = unwrapIfValiError(error);

      // Thrown before render, show the red box immediately.
      return reactComponent(ErrorBoundaryBody, undefined, {
        wrapperComponent: ErrorBoundaryWrapper,
        wrapperProps: {
          renderFunction() {
            throw error;
          },
          where
        }
      });
    }
  });
}
