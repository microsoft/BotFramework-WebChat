import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { Fragment, memo, useMemo } from 'react';
import { array, custom, object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import { middlewareFactoryMarker } from '../middleware/private/templateMiddleware';
import InternalDecoratorComposer from './internal/InternalDecoratorComposer';
import { type DecoratorMiddleware } from './types';

const decoratorComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    middleware: optional(pipe(array(custom<DecoratorMiddleware>(value => typeof value === 'function')), readonly()))
  }),
  readonly()
);

const warnInvalidMiddlewarePropsSchema = optional(
  array(custom(value => value[middlewareFactoryMarker satisfies symbol] === middlewareFactoryMarker))
);

type DecoratorComposerProps = Omit<InferInput<typeof decoratorComposerPropsSchema>, 'middleware'> & {
  // Mark "middleware" as read-only.
  // Otherwise, passing a read-only middleware would fail because we prefer writable.
  // eslint-disable-next-line react/require-default-props, react/no-unused-prop-types
  readonly middleware?: readonly DecoratorMiddleware[] | undefined;
};

function DecoratorComposer(props: DecoratorComposerProps) {
  const { children, middleware } = validateProps(decoratorComposerPropsSchema, props);

  useMemo(() => {
    if (!safeParse(warnInvalidMiddlewarePropsSchema, middleware).success) {
      console.warn(
        'botframework-webchat: "middleware" props passed to <DecoratorComposer> should be created using createXXXMiddleware() functions.',
        { middleware }
      );
    }
  }, [middleware]);

  return middleware ? (
    <InternalDecoratorComposer middleware={middleware} priority="normal">
      {children}
    </InternalDecoratorComposer>
  ) : (
    // We can't return `children` unless we are not using memo().
    <Fragment>{children}</Fragment>
  );
}

export default memo(DecoratorComposer);
export { decoratorComposerPropsSchema, type DecoratorComposerProps };
