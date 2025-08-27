import { type ComponentHandlerResult } from 'react-chain-of-responsibility/preview';
import ErrorBoundaryForRenderFunction, {
  type ErrorBoundaryForRenderFunctionProps
} from './ErrorBoundaryForRenderFunction';
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

      return (
        result &&
        reactComponent(ErrorBoundaryForRenderFunction, {
          errorBoundaryRenderFunction: result?.render,
          errorBoundaryWhere: where
          // TODO: [P1] Fix force casting by using React Context to hide internal props.
        } as unknown as ErrorBoundaryForRenderFunctionProps<Props>)
      );
    } catch (error) {
      // Simplify code by re-assigning to `error`.
      // eslint-disable-next-line no-ex-assign
      error = unwrapIfValiError(error);

      // Thrown before render, show the red box immediately.
      return reactComponent(ErrorBoundaryForRenderFunction, {
        errorBoundaryRenderFunction: () => {
          throw error;
        },
        errorBoundaryWhere: where
        // TODO: [P1] Fix force casting by using React Context to hide internal props.
      } as unknown as ErrorBoundaryForRenderFunctionProps<Props>);
    }
  });
}
