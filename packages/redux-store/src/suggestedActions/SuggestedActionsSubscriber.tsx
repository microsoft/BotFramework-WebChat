import { type DirectLineCardAction, type WebChatActivity } from 'botframework-webchat-core';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { Fragment, memo, useContext, useEffect } from 'react';
import { custom, function_, is, object, optional, pipe, readonly, type InferInput } from 'valibot';

import SuggestedActionsStateContext from './private/SuggestedActionsStateContext';

type SuggestedActionsListener = (
  suggestedActions: readonly DirectLineCardAction[],
  originActivity: WebChatActivity | undefined
) => void;

const suggestedActionsSubscriberPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    /** Subscribes to the suggested actions set by the incoming activities; returns the function that unsubscribes. */
    subscribe: custom<(listener: SuggestedActionsListener) => () => void>(value => is(function_(), value))
  }),
  readonly()
);

type SuggestedActionsSubscriberProps = InferInput<typeof suggestedActionsSubscriberPropsSchema>;

/**
 * Sets the suggested actions of `<SuggestedActionsComposer>` from the incoming activities, without a Redux store: what
 * `<ReduxSuggestedActionsMirror>` does with the `SET_SUGGESTED_ACTIONS` actions.
 */
function SuggestedActionsSubscriber(props: SuggestedActionsSubscriberProps) {
  const { children, subscribe } = validateProps(suggestedActionsSubscriberPropsSchema, props);
  const { setOriginActivity, setSuggestedActionsRaw } = useContext(SuggestedActionsStateContext);

  useEffect(
    () =>
      subscribe((suggestedActions, originActivity) => {
        setOriginActivity(originActivity);
        setSuggestedActionsRaw(Object.freeze(Array.from(suggestedActions)));
      }),
    [setOriginActivity, setSuggestedActionsRaw, subscribe]
  );

  return <Fragment>{children}</Fragment>;
}

SuggestedActionsSubscriber.displayName = 'SuggestedActionsSubscriber';

export default memo(SuggestedActionsSubscriber);
export { suggestedActionsSubscriberPropsSchema, type SuggestedActionsListener, type SuggestedActionsSubscriberProps };
