// The services of the default providers (no Redux), on the clock of the script: the notifications cell, the connection
// service, the incoming service, the outgoing service, and the activities store. The operations take the payloads of
// the action creators, as the api passes them.
import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import sendEvent from '../../actions/sendEvent';
import sendFiles from '../../actions/sendFiles';
import sendMessage from '../../actions/sendMessage';
import sendMessageBack from '../../actions/sendMessageBack';
import sendPostBack from '../../actions/sendPostBack';
import createCompatibilityDispatch from '../../services/createCompatibilityDispatch';
import createConnectionService from '../../services/createConnectionService';
import createIncomingService, { type SuggestedActionsEmitter } from '../../services/createIncomingService';
import createNotificationsCell from '../../services/createNotificationsCell';
import createOutgoingService from '../../services/createOutgoingService';
import createSendBoxService from '../../services/createSendBoxService';
import createSpeechService from '../../services/createSpeechService';
import createVoiceService from '../../services/createVoiceService';
import createEmitter from '../../services/private/createEmitter';
import createSagaQueue from '../../services/private/createSagaQueue';
import setSendBoxAttachments from '../../actions/setSendBoxAttachments';
import setSendTypingIndicator from '../../actions/setSendTypingIndicator';
import submitSendBox from '../../actions/submitSendBox';
import type { Source } from '../../services/types';
import { describeVoiceHandlers, type CreateDriver, type Observation, type Operations } from './runParityScript';

const EMPTY_ARRAY = Object.freeze([]);

const createServicesDriver: CreateDriver = ({ faults, onChange, onSuggestedActions, ponyfill }) => {
  const activitiesStore = createActivitiesStore({ ponyfill });
  // One queue for the services, as redux-saga has one for the sagas.
  const queue = createSagaQueue();
  const notifications = createNotificationsCell({ ponyfill });
  const connection = createConnectionService({ notifications, ponyfill });
  const suggestedActions: SuggestedActionsEmitter = createEmitter();
  const voice = createVoiceService();
  const incoming = createIncomingService({
    activitiesStore: {
      getSnapshot: activitiesStore.getSnapshot,
      receiveActivity: activity => {
        if (faults.receiveThrowsFor && faults.receiveThrowsFor === activity.id) {
          throw new Error(`receive ${faults.receiveThrowsFor}`);
        }

        activitiesStore.receiveActivity(activity);
      }
    },
    connection,
    ponyfill,
    queue,
    suggestedActions,
    voice: voice.port
  });
  const outgoing = createOutgoingService({
    activitiesStore: {
      postActivityFulfilled: (clientActivityID, activity) => {
        if (faults.fulfilledThrowsFor && faults.fulfilledThrowsFor === (activity as any).text) {
          throw new Error(`fulfilled ${faults.fulfilledThrowsFor}`);
        }

        activitiesStore.postActivityFulfilled(clientActivityID, activity);
      },
      postActivityImpeded: activitiesStore.postActivityImpeded,
      postActivityPending: activity => {
        if (faults.pendingThrowsFor && faults.pendingThrowsFor === (activity as any).text) {
          throw new Error(`pending ${faults.pendingThrowsFor}`);
        }

        activitiesStore.postActivityPending(activity);
      },
      postActivityRejected: activitiesStore.postActivityRejected
    },
    connection,
    incoming,
    ponyfill,
    queue,
    suggestedActions
  });
  const sendBox = createSendBoxService({
    connection,
    createSendMessagePayload: (text, method, init) => sendMessage(text, method, init).payload,
    outgoing,
    ponyfill,
    queue
  });
  // Started when online after the send box, as the speech sagas after the typing indicator saga.
  const speech = createSpeechService({ activitiesStore, connection, incoming, queue });

  const unsubscribeSuggestedActions = suggestedActions.subscribe(onSuggestedActions);

  const observe = (): Observation => ({
    activities: activitiesStore.getSnapshot().sortedActivities,
    connectivityStatus: connection.connectivityStatus.get(),
    dictateInterims: speech.dictateInterims.get(),
    dictateState: speech.dictateState.get(),
    microphoneMuted: voice.microphoneMuted.get(),
    notifications: notifications.notifications.get(),
    referenceGrammarID: connection.referenceGrammarID.get(),
    sendBoxAttachments: sendBox.attachments.get(),
    sendBoxValue: sendBox.value.get(),
    sendTypingIndicator: sendBox.sendTypingIndicator.get(),
    shouldSpeakIncomingActivity: speech.shouldSpeakIncomingActivity.get(),
    voiceHandlers: describeVoiceHandlers(voice.voiceHandlers.get()),
    voiceState: voice.voiceState.get()
  });

  // A source of the voice: notified on every operation, recorded when its value changes.
  const onChangeOf = <T>(
    key: keyof Observation,
    source: Source<T>,
    describe: (value: T) => unknown = value => value
  ) => {
    let last = source.get();

    return source.subscribe(() => {
      const next = source.get();

      Object.is(next, last) || onChange(key, describe(next));
      last = next;
    });
  };

  // Records first: a listener that throws stops the listeners after it.
  const unsubscribes = [
    activitiesStore.subscribe(() => onChange('activities', observe().activities)),
    connection.connectivityStatus.subscribe(() => onChange('connectivityStatus', connection.connectivityStatus.get())),
    notifications.notifications.subscribe(() => onChange('notifications', notifications.notifications.get())),
    connection.referenceGrammarID.subscribe(() => onChange('referenceGrammarID', connection.referenceGrammarID.get())),
    sendBox.attachments.subscribe(() => onChange('sendBoxAttachments', sendBox.attachments.get())),
    sendBox.value.subscribe(() => onChange('sendBoxValue', sendBox.value.get())),
    sendBox.sendTypingIndicator.subscribe(() => onChange('sendTypingIndicator', sendBox.sendTypingIndicator.get())),
    speech.dictateInterims.subscribe(() => onChange('dictateInterims', speech.dictateInterims.get())),
    speech.dictateState.subscribe(() => onChange('dictateState', speech.dictateState.get())),
    speech.shouldSpeakIncomingActivity.subscribe(() =>
      onChange('shouldSpeakIncomingActivity', speech.shouldSpeakIncomingActivity.get())
    ),
    // In the order the Redux driver compares them.
    onChangeOf('microphoneMuted', voice.microphoneMuted),
    onChangeOf('voiceHandlers', voice.voiceHandlers, describeVoiceHandlers),
    onChangeOf('voiceState', voice.voiceState),
    connection.connectivityStatus.subscribe(() => {
      const connectivityStatus = connection.connectivityStatus.get();

      if (connectivityStatus === faults.statusListenerThrowsOn) {
        throw new Error(`listener on ${connectivityStatus}`);
      }
    })
  ];

  let numVoiceHandlers = 0;

  // As the api: the action creators validate and build the payloads.
  const ops: Operations = Object.freeze({
    clearSuggestedActions: () => suggestedActions.emit(EMPTY_ARRAY, undefined),
    emitTypingIndicator: () => outgoing.emitTypingIndicator(),
    // Every mark goes through speech, as MARK_ACTIVITY goes through its saga.
    markActivity: (activity, name, value) => speech.markActivity(activity, name, value),
    postActivity: (activity, method) => outgoing.postActivity(activity, method),
    postVoiceActivity: activity => outgoing.postVoiceActivity(activity),
    // As the api: a new ID for each handler.
    registerVoiceHandler: voiceHandler => voice.registerVoiceHandler(`v${++numVoiceHandlers}`, voiceHandler),
    sendEvent: (name, value) => outgoing.sendEvent(sendEvent(name, value).payload),
    sendFiles: files => outgoing.sendFiles(sendFiles(files).payload),
    sendMessage: (text, method, init) => outgoing.sendMessage(sendMessage(text, method, init).payload),
    sendMessageBack: (value, text, displayText, init) =>
      outgoing.sendMessageBack(sendMessageBack(value, text, displayText, init).payload),
    sendPostBack: (value, init) => outgoing.sendPostBack(sendPostBack(value, init).payload),
    setDictateInterims: dictateInterims => speech.setDictateInterims(dictateInterims),
    setDictateState: dictateState => speech.setDictateState(dictateState),
    setLanguage: language => outgoing.setLocale(language),
    setMuted: muted => voice.setMuted(muted),
    setSendBox: text => sendBox.setValue(text),
    setSendBoxAttachments: attachments =>
      sendBox.setAttachments(setSendBoxAttachments(attachments).payload.attachments),
    setSendTimeout: sendTimeout => outgoing.setSendTimeout(sendTimeout),
    // As the api (`<DefaultSessionEffects>`) and the action creator: a boolean.
    setSendTypingIndicator: value =>
      sendBox.setSendTypingIndicator(setSendTypingIndicator(value).payload.sendTypingIndicator),
    setVoiceState: voiceState => voice.setVoiceState(voiceState as Parameters<typeof voice.setVoiceState>[0]),
    startDictate: () => speech.startDictate(),
    startSpeakingActivity: () => speech.startSpeakingActivity(),
    startVoice: () => voice.startVoice(),
    stopDictate: () => speech.stopDictate(),
    stopSpeakingActivity: () => speech.stopSpeakingActivity(),
    stopVoice: () => voice.stopVoice(),
    submitSendBox: (method, init) =>
      sendBox.submit(submitSendBox(method, init && { channelData: init.channelData }).payload)
  });

  return Object.freeze({
    connect: init => connection.connect(init),
    disconnect: () => connection.disconnect(),
    dispose: () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      unsubscribeSuggestedActions();
      connection.dispose();
    },
    observe,
    ops,
    rawDispatch: createCompatibilityDispatch({ outgoing })
  });
};

export default createServicesDriver;
