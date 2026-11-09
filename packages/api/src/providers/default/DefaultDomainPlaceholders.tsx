import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { type SendBoxAttachment, type VoiceHandler } from 'botframework-webchat-core';
import React, { memo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import ChatOperationsContext, {
  type ChatOperationsContextType
} from '../../hooks/internal/domains/ChatOperationsContext';
import SendBoxContext, { type SendBoxContextType } from '../../hooks/internal/domains/SendBoxContext';
import { type Source } from '../../hooks/internal/domains/Source';
import SpeechContext, { type SpeechContextType } from '../../hooks/internal/domains/SpeechContext';
import VoiceContext, { type VoiceContextType } from '../../hooks/internal/domains/VoiceContext';
import warnPlaceholderOnce from './private/warnPlaceholderOnce';

const defaultDomainPlaceholdersPropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type DefaultDomainPlaceholdersProps = InferInput<typeof defaultDomainPlaceholdersPropsSchema>;

function noop() {
  // Nothing to unsubscribe.
}

// A value that never changes.
function createStaticSource<T>(value: T): Source<T> {
  return Object.freeze({ get: () => value, subscribe: () => noop });
}

// An operation of a domain that is not built yet: does nothing, warns once in development.
function placeholder(name: string): (...args: unknown[]) => undefined {
  return () => {
    warnPlaceholderOnce(name);

    return undefined;
  };
}

// The initial values of the Redux store (`createReducer()` of core), so the UI renders as before the first action.
const CHAT_OPERATIONS: ChatOperationsContextType = Object.freeze({
  clearSuggestedActions: placeholder('clearSuggestedActions'),
  dispatch: placeholder('dispatch'),
  markActivity: placeholder('markActivity'),
  postActivity: placeholder('postActivity'),
  sendEvent: placeholder('sendEvent'),
  sendFiles: placeholder('sendFiles'),
  sendMessage: placeholder('sendMessage'),
  sendMessageBack: placeholder('sendMessageBack'),
  sendPostBack: placeholder('sendPostBack'),
  setSendTimeout: placeholder('setSendTimeout')
});

const SEND_BOX: SendBoxContextType = Object.freeze({
  attachments: createStaticSource<readonly SendBoxAttachment[]>(Object.freeze([])),
  emitTypingIndicator: placeholder('emitTypingIndicator'),
  sendTypingIndicator: createStaticSource(false),
  setAttachments: placeholder('setSendBoxAttachments'),
  setValue: placeholder('setSendBox'),
  submit: placeholder('submitSendBox'),
  value: createStaticSource('')
});

const SPEECH: SpeechContextType = Object.freeze({
  dictateInterims: createStaticSource<string[]>(Object.freeze([]) as string[]),
  // `IDLE` of `DictateState`.
  dictateState: createStaticSource(0),
  setDictateInterims: placeholder('setDictateInterims'),
  setDictateState: placeholder('setDictateState'),
  shouldSpeakIncomingActivity: createStaticSource(false),
  startDictate: placeholder('startDictate'),
  startSpeakingActivity: placeholder('startSpeakingActivity'),
  stopDictate: placeholder('stopDictate'),
  stopSpeakingActivity: placeholder('stopSpeakingActivity')
});

const VOICE: VoiceContextType = Object.freeze({
  microphoneMuted: createStaticSource(false),
  postVoiceActivity: placeholder('postVoiceActivity'),
  registerVoiceHandler: (_voiceHandler: VoiceHandler) => {
    warnPlaceholderOnce('registerVoiceHandler');

    return noop;
  },
  setMuted: placeholder('setMuted'),
  setVoiceState: placeholder('setVoiceState'),
  startVoice: placeholder('startVoice'),
  stopVoice: placeholder('stopVoice'),
  voiceHandlers: createStaticSource<ReadonlyMap<string, VoiceHandler>>(new Map()),
  voiceState: createStaticSource('idle' as const)
});

/**
 * Placeholders for the domains that the default providers do not own yet (outgoing activities, send box, speech and
 * voice): static values, and operations that do nothing and warn once in
 * development. Each domain replaces its placeholder when it is built.
 */
function DefaultDomainPlaceholders(props: DefaultDomainPlaceholdersProps) {
  const { children } = validateProps(defaultDomainPlaceholdersPropsSchema, props);

  return (
    <ChatOperationsContext.Provider value={CHAT_OPERATIONS}>
      <SendBoxContext.Provider value={SEND_BOX}>
        <SpeechContext.Provider value={SPEECH}>
          <VoiceContext.Provider value={VOICE}>{children}</VoiceContext.Provider>
        </SpeechContext.Provider>
      </SendBoxContext.Provider>
    </ChatOperationsContext.Provider>
  );
}

DefaultDomainPlaceholders.displayName = 'DefaultDomainPlaceholders';

export default memo(DefaultDomainPlaceholders);
export { defaultDomainPlaceholdersPropsSchema, type DefaultDomainPlaceholdersProps };
