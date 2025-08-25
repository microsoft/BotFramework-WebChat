import { type ReactNode } from 'react';
import { type ComponentHandlerResult } from 'react-chain-of-responsibility/preview';
import ErrorBoundaryForRenderFunction from './ErrorBoundaryForRenderFunction';
import type templatePolymiddleware from './templatePolymiddleware';
import unwrapIfValiError from './unwrapIfValiError';

// Following @types/react to use {} for props.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export default function createErrorBoundaryMiddleware<Request, Props extends {}>({
  createMiddleware,
  where,
  reactComponent
}: Pick<ReturnType<typeof templatePolymiddleware<Request, Props>>, 'createMiddleware' | 'reactComponent'> & {
  where: string;
}) {
  return createMiddleware(next => request => {
    // TODO: [P1] Simplify this code.
    let result: ComponentHandlerResult<Props> | undefined;

    try {
      result = next(request);

      return reactComponent<
        // TODO: [P*] Fix unknown.
        Props & {
          readonly errorBoundaryRenderFunction: (props: unknown) => { render: () => ReactNode };
          readonly errorBoundaryWhere: string;
        }
      >(
        ErrorBoundaryForRenderFunction,
        // TODO: [P*] Fix any.
        { errorBoundaryRenderFunction: result?.render, errorBoundaryWhere: where } as any
      );
    } catch (error) {
      // Simplify code by re-assigning to `error`.
      // eslint-disable-next-line no-ex-assign
      error = unwrapIfValiError(error);

      // Thrown before render, show the red box immediately.
      return reactComponent<
        // TODO: [P*] Fix unknown.
        Props & {
          readonly errorBoundaryRenderFunction: (props: unknown) => { render: () => ReactNode };
          readonly errorBoundaryWhere: string;
        }
      >(
        ErrorBoundaryForRenderFunction,
        // TODO: [P*] Fix any.
        {
          errorBoundaryRenderFunction: () => {
            throw error;
          },
          errorBoundaryWhere: where
        } as any
      );
    }
  });
}
