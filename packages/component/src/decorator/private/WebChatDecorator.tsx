/* eslint-disable prefer-arrow-callback */
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import {
  createActivityBorderMiddleware,
  DecoratorComposer,
  type DecoratorMiddleware
} from 'botframework-webchat-api/decorator';
import React, { Fragment, memo } from 'react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import DecoratorStylesheet from '../stylesheet/DecoratorStylesheet';
import BorderFlair from './BorderFlair';
import BorderLoader from './BorderLoader';

const middleware: readonly DecoratorMiddleware[] = Object.freeze([
  createActivityBorderMiddleware(function FluentBorderFlair({ request, Next, ...props }) {
    if (request.modality.has('audio') && request.from === 'bot') {
      return (
        <BorderFlair showFlair={true}>
          <Next {...props} />
        </BorderFlair>
      );
    }
    return <Next {...props} />;
  }),
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
    children: optional(reactNode()),
    nonce: optional(string())
  }),
  readonly()
);

type WebChatDecoratorProps = InferInput<typeof webChatDecoratorPropsSchema>;

function WebChatDecorator(props: WebChatDecoratorProps) {
  const { children, nonce } = validateProps(webChatDecoratorPropsSchema, props);

  return (
    <Fragment>
      <DecoratorStylesheet nonce={nonce} />
      <DecoratorComposer middleware={middleware}>{children}</DecoratorComposer>
    </Fragment>
  );
}

export default memo(WebChatDecorator);
export { webChatDecoratorPropsSchema, type WebChatDecoratorProps };
