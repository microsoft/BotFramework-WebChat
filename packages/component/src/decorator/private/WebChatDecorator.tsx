/* eslint-disable prefer-arrow-callback */
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  createActivityBorderMiddleware,
  DecoratorComposer,
  type DecoratorMiddleware
} from 'botframework-webchat-api/decorator';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import useNonce from '../../hooks/internal/useNonce';
import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';
import InjectDecoratorCSS from './InjectDecoratorCSS';

const middleware: readonly DecoratorMiddleware[] = Object.freeze([
  createActivityBorderMiddleware(function BorderFlairDecorator({ request, Next, ...props }) {
    return (
      <BorderFlair showFlair={props.showFlair ?? request.livestreamingState === 'completing'}>
        <Next {...props} showFlair={false} />
      </BorderFlair>
    );
  }),
  createActivityBorderMiddleware(function BorderLoaderDecorator({ request, Next, ...props }) {
    return (
      <BorderLoader showLoader={props.showLoader ?? request.livestreamingState === 'preparing'}>
        <Next {...props} showLoader={false} />
      </BorderLoader>
    );
  })
]);

const webChatDecoratorPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type WebChatDecoratorProps = InferInput<typeof webChatDecoratorPropsSchema>;

function WebChatDecorator(props: WebChatDecoratorProps) {
  const { children } = validateProps(webChatDecoratorPropsSchema, props);

  const [nonce] = useNonce();

  return (
    <InjectDecoratorCSS nonce={nonce}>
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </InjectDecoratorCSS>
  );
}

export default memo(WebChatDecorator);
export { webChatDecoratorPropsSchema, type WebChatDecoratorProps };
