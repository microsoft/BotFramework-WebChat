import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import {
  array,
  custom,
  function_,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  transform,
  type InferInput
} from 'valibot';

import { ActivityPolyMiddlewareProvider, extractActivityPolyMiddleware } from './activityPolyMiddleware';
import { PolyMiddleware } from './types/PolyMiddleware';

const polyMiddlewareComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    middleware: pipe(
      custom<readonly PolyMiddleware[]>(value => safeParse(array(function_()), value).success),
      transform<readonly PolyMiddleware[], readonly PolyMiddleware[]>(value => Object.freeze(Array.from(value)))
    )
  }),
  readonly()
);

type PolyMiddlewareComposerProps = Readonly<InferInput<typeof polyMiddlewareComposerPropsSchema>>;

function PolyMiddlewareComposer(props: PolyMiddlewareComposerProps) {
  const { children, middleware } = validateProps(polyMiddlewareComposerPropsSchema, props);

  const activityPolyMiddleware = useMemo(() => extractActivityPolyMiddleware(middleware), [middleware]);

  return (
    <ActivityPolyMiddlewareProvider middleware={activityPolyMiddleware}>{children}</ActivityPolyMiddlewareProvider>
  );
}

export default memo(PolyMiddlewareComposer);
export { polyMiddlewareComposerPropsSchema, type PolyMiddlewareComposerProps };
