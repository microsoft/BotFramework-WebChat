import { isValidElement } from 'react';

// For uniformity, we are patching legacy renderer middleware signature to newer one.
// - Legacy: () => next => args => next(args): React.Element
// - Current: () => next => args => next(args): false | () => React.Element
export default function upgradeLegacyRendererMiddleware(middleware) {
  return (...setupArgs) => {
    const setup = middleware(...setupArgs);

    return next => {
      const runMiddleware = setup(next);

      return (...renderArgs) => {
        const result = runMiddleware(...renderArgs);

        return !!result && (isValidElement(result) ? () => result : result);
      };
    };
  };
}
