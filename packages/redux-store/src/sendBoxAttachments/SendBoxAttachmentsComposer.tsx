import { type SendBoxAttachment } from 'botframework-webchat-core';
import {
  SET_SEND_BOX_ATTACHMENTS,
  setRawState,
  setSendBoxAttachmentsActionSchema
} from 'botframework-webchat-core/internal';
import { createBitContext } from 'botframework-webchat-react-context';
import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import React, { memo, useCallback, useMemo } from 'react';
import { wrapWith } from 'react-wrap-with';
import { object, optional, pipe, readonly, safeParse, type InferInput } from 'valibot';

import reduxStoreSchema from '../private/reduxStoreSchema';
import ReduxActionSinkComposer, { type ReduxActionHandler } from '../reduxActionSink/ReduxActionSinkComposer';
import SendBoxAttachmentsContext, { type SendBoxAttachmentsContextType } from './private/SendBoxAttachmentsContext';

const sendBoxAttachmentsComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    store: reduxStoreSchema
  }),
  readonly()
);

type SendBoxAttachmentsComposerProps = InferInput<typeof sendBoxAttachmentsComposerPropsSchema>;

const { Composer: AttachmentsConposer, useState: useSendBoxAttachments } = createBitContext<
  readonly SendBoxAttachment[]
>(Object.freeze([]));

function SendBoxAttachmentsComposer(props: SendBoxAttachmentsComposerProps) {
  const {
    children,
    store,
    store: { dispatch }
  } = validateProps(sendBoxAttachmentsComposerPropsSchema, props);

  const [attachments, setAttachments] = useSendBoxAttachments();

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
      }
    },
    [setAttachments]
  );

  useMemo(() => {
    dispatch(setRawState('sendBoxAttachments', attachments));
  }, [attachments, dispatch]);
  // #endregion

  const context = useMemo<SendBoxAttachmentsContextType>(
    () => ({
      useSendBoxAttachments
    }),
    [useSendBoxAttachments]
  );

  return (
    <ReduxActionSinkComposer onAction={handleAction} store={store}>
      <SendBoxAttachmentsContext.Provider value={context}>{children}</SendBoxAttachmentsContext.Provider>
    </ReduxActionSinkComposer>
  );
}

export default wrapWith(AttachmentsConposer)(memo(SendBoxAttachmentsComposer));
