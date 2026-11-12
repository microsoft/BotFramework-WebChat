import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useMemo } from 'react';
import { object, optional, pipe, readonly, type InferInput } from 'valibot';

import { useWebChatReduxContext, type WebChatReduxStore } from '../../hooks/internal/WebChatReduxContext';
import ConnectionSlices from '../../hooks/internal/domains/ConnectionSlices';
import DomainOperations from '../../hooks/internal/domains/DomainOperations';
import SendBoxSlices from '../../hooks/internal/domains/SendBoxSlices';
import { type Source } from '../../hooks/internal/domains/Source';
import SpeechSlices from '../../hooks/internal/domains/SpeechSlices';
import useSourceValue from '../../hooks/internal/domains/useSourceValue';
import VoiceSlices from '../../hooks/internal/domains/VoiceSlices';

const reduxDomainBridgePropsSchema = pipe(
  object({
    children: optional(reactNode())
  }),
  readonly()
);

type ReduxDomainBridgeProps = InferInput<typeof reduxDomainBridgePropsSchema>;

type ReduxState = ReturnType<WebChatReduxStore['getState']>;

// The slices of the slice contexts.
function selectSlices(state: ReduxState) {
  return {
    connectivityStatus: state.connectivityStatus,
    dictateInterims: state.dictateInterims,
    dictateState: state.dictateState,
    microphoneMuted: state.voice.microphoneMuted,
    notifications: state.notifications,
    referenceGrammarID: state.referenceGrammarID,
    sendBoxAttachments: state.sendBoxAttachments,
    sendBoxValue: state.sendBoxValue,
    sendTypingIndicator: state.sendTypingIndicator,
    shouldSpeakIncomingActivity: state.shouldSpeakIncomingActivity,
    voiceHandlers: state.voice.voiceHandlers,
    voiceState: state.voice.voiceState
  };
}

type Slices = ReturnType<typeof selectSlices>;

function shallowEqual(x: Slices, y: Slices): boolean {
  // eslint-disable-next-line security/detect-object-injection
  return (Object.keys(x) as (keyof Slices)[]).every(key => Object.is(x[key], y[key]));
}

/**
 * Provides the domain contexts over the Redux store: the slice contexts from one subscription to the store (through
 * the batched subscription of `<WebChatReduxProvider>`); each setter dispatches an action to the store.
 */
function ReduxDomainBridge(props: ReduxDomainBridgeProps) {
  const { children } = validateProps(reduxDomainBridgePropsSchema, props);
  const { store, subscribe } = useWebChatReduxContext();

  // One subscription for the slices: the bridge re-renders only when one of them changed (as `useSelector()` of each
  // slice did), so an action that changes another part of the store (e.g. the suggested actions mirrored during render)
  // does not re-render it. Each slice context then propagates only when its slice changed.
  const state = useSourceValue(
    useMemo<Source<Slices>>(
      () => Object.freeze({ get: () => selectSlices(store.getState()), subscribe }),
      [store, subscribe]
    ),
    shallowEqual
  );

  return (
    <DomainOperations dispatch={store.dispatch}>
      <ConnectionSlices
        connectivityStatus={state.connectivityStatus}
        notifications={state.notifications}
        referenceGrammarID={state.referenceGrammarID}
      >
        <SendBoxSlices
          sendBoxAttachments={state.sendBoxAttachments}
          sendBoxValue={state.sendBoxValue}
          sendTypingIndicator={state.sendTypingIndicator}
        >
          <SpeechSlices
            dictateInterims={state.dictateInterims}
            dictateState={state.dictateState}
            shouldSpeakIncomingActivity={state.shouldSpeakIncomingActivity}
          >
            <VoiceSlices
              microphoneMuted={state.microphoneMuted}
              voiceHandlers={state.voiceHandlers}
              voiceState={state.voiceState}
            >
              {children}
            </VoiceSlices>
          </SpeechSlices>
        </SendBoxSlices>
      </ConnectionSlices>
    </DomainOperations>
  );
}

ReduxDomainBridge.displayName = 'ReduxDomainBridge';

export default memo(ReduxDomainBridge);
export { reduxDomainBridgePropsSchema, type ReduxDomainBridgeProps };
