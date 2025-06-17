import { type SendBoxAttachment } from 'botframework-webchat-core';
import {
  SET_SEND_BOX,
  SET_SEND_BOX_ATTACHMENTS,
  setRawState,
  setSendBoxActionSchema,
  setSendBoxAttachmentsActionSchema
} from 'botframework-webchat-core/internal';
import { createBitContext } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import ReduxActionSinkComposer, { type ReduxActionHandler } from '../reduxActionSink/ReduxActionSinkComposer';
import SendBoxContext, { type SendBoxContextType } from './private/SendBoxContext';

const sendBoxComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type SendBoxComposerProps = InferInput<typeof sendBoxComposerPropsSchema>;

const { Composer: SendBoxAttachmentsComposer, useState: useSendBoxAttachments } = createBitContext<
  readonly SendBoxAttachment[]
>(Object.freeze([]));

const { Composer: SendBoxTextValueComposer, useState: useSendBoxTextValue } = createBitContext<string>('');

function SendBoxComposer(props: SendBoxComposerProps) {
  const {
    children,
    store,
    store: { dispatch }
  } = validateProps(sendBoxComposerPropsSchema, props);

  const [attachments, setAttachments] = useSendBoxAttachments();
  const [textValue, setTextValue] = useSendBoxTextValue();

  // #region Replicate to Redux store
  const handleAction = useCallback<ReduxActionHandler>(
    action => {
      if (action.type === SET_SEND_BOX_ATTACHMENTS) {
        const result = safeParse(setSendBoxAttachmentsActionSchema, action);

        if (result.success) {
          setAttachments(result.output.payload);
        } else {
          console.warn(
            `botframework-webchat: Received action of type "${action.type}" but its content is not valid, ignoring.`,
            { result }
          );
        }
      } else if (action.type === SET_SEND_BOX) {
        const result = safeParse(setSendBoxActionSchema, action);

        if (result.success) {
          setTextValue(result.output.payload.text);
        } else {
          console.warn(
            `botframework-webchat: Received action of type "${action.type}" but its content is not valid, ignoring.`,
            { result }
          );
        }
      }
    },
    [setAttachments]
  );

  useMemo(() => {
    dispatch(setRawState('sendBoxAttachments', attachments));
  }, [attachments, dispatch]);

  useMemo(() => {
    dispatch(setRawState('sendBoxValue', textValue));
  }, [dispatch, textValue]);
  // #endregion

  const context = useMemo<SendBoxContextType>(
    () => ({
      useSendBoxAttachments,
      useSendBoxValue: useSendBoxTextValue
    }),
    [useSendBoxAttachments, useSendBoxTextValue]
  );

  return (
    <ReduxActionSinkComposer onAction={handleAction} store={store}>
      <SendBoxContext.Provider value={context}>{children}</SendBoxContext.Provider>
    </ReduxActionSinkComposer>
  );
}

export default wrapWith(SendBoxAttachmentsComposer)(wrapWith(SendBoxTextValueComposer)(memo(SendBoxComposer)));
