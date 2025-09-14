import type { ReactElement } from 'react';
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
    let result: { readonly render: (overridingProps?: Partial<Props> | undefined) => ReactElement | null } | undefined;

    try {
      result = next(request);
    } catch (error) {
      result = {
        render() {
          throw unwrapIfValiError(error);
        }
      };
    }

    return (
      result &&
      reactComponent(ErrorBoundaryBody, undefined, {
        wrapperComponent: ErrorBoundaryWrapper,
        wrapperProps: { renderFunction: result?.render, where }
      })
    );
  });
}
