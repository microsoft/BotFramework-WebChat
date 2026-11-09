// The services of the default providers (no Redux), on the clock of the script: the notifications cell, the connection
// service, the incoming service, the outgoing service, and the activities store. The operations take the payloads of
// the action creators, as the api passes them.
import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import sendEvent from '../../actions/sendEvent';
import sendFiles from '../../actions/sendFiles';
import sendMessage from '../../actions/sendMessage';
import sendMessageBack from '../../actions/sendMessageBack';
import sendPostBack from '../../actions/sendPostBack';
import createConnectionService from '../../services/createConnectionService';
import createIncomingService, { type SuggestedActionsEmitter } from '../../services/createIncomingService';
import createNotificationsCell from '../../services/createNotificationsCell';
import createOutgoingService from '../../services/createOutgoingService';
import createEmitter from '../../services/private/createEmitter';
import type { CreateDriver, Observation, Operations } from './runParityScript';

const EMPTY_ARRAY = Object.freeze([]);

// The send box comes in the next commit, the raw actions of card action middleware with the api.
const notYet = (name: string) => () => {
  throw new Error(`The services driver cannot ${name}() yet.`);
};

const createServicesDriver: CreateDriver = ({ faults, onChange, onSuggestedActions, ponyfill }) => {
  const activitiesStore = createActivitiesStore({ ponyfill });
  const notifications = createNotificationsCell({ ponyfill });
  const connection = createConnectionService({ notifications, ponyfill });
  const suggestedActions: SuggestedActionsEmitter = createEmitter();
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
    suggestedActions
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
    suggestedActions
  });

  const unsubscribeSuggestedActions = suggestedActions.subscribe(onSuggestedActions);

  const observe = (): Observation => ({
    activities: activitiesStore.getSnapshot().sortedActivities,
    connectivityStatus: connection.connectivityStatus.get(),
    notifications: notifications.notifications.get(),
    referenceGrammarID: connection.referenceGrammarID.get(),
    sendBoxAttachments: EMPTY_ARRAY,
    sendBoxValue: '',
    sendTypingIndicator: false
  });

  // Records first: a listener that throws stops the listeners after it.
  const unsubscribes = [
    activitiesStore.subscribe(() => onChange('activities', observe().activities)),
    connection.connectivityStatus.subscribe(() => onChange('connectivityStatus', connection.connectivityStatus.get())),
    notifications.notifications.subscribe(() => onChange('notifications', notifications.notifications.get())),
    connection.referenceGrammarID.subscribe(() => onChange('referenceGrammarID', connection.referenceGrammarID.get())),
    connection.connectivityStatus.subscribe(() => {
      const connectivityStatus = connection.connectivityStatus.get();

      if (connectivityStatus === faults.statusListenerThrowsOn) {
        throw new Error(`listener on ${connectivityStatus}`);
      }
    })
  ];

  // As the api: the action creators validate and build the payloads.
  const ops: Operations = Object.freeze({
    clearSuggestedActions: () => suggestedActions.emit(EMPTY_ARRAY, undefined),
    emitTypingIndicator: () => outgoing.emitTypingIndicator(),
    markActivity: ({ id }, name, value) => activitiesStore.markActivity(id, name, value),
    postActivity: (activity, method) => outgoing.postActivity(activity, method),
    sendEvent: (name, value) => outgoing.sendEvent(sendEvent(name, value).payload),
    sendFiles: files => outgoing.sendFiles(sendFiles(files).payload),
    sendMessage: (text, method, init) => outgoing.sendMessage(sendMessage(text, method, init).payload),
    sendMessageBack: (value, text, displayText, init) =>
      outgoing.sendMessageBack(sendMessageBack(value, text, displayText, init).payload),
    sendPostBack: (value, init) => outgoing.sendPostBack(sendPostBack(value, init).payload),
    setLanguage: language => outgoing.setLocale(language),
    setSendBox: notYet('setSendBox'),
    setSendBoxAttachments: notYet('setSendBoxAttachments'),
    setSendTimeout: sendTimeout => outgoing.setSendTimeout(sendTimeout),
    setSendTypingIndicator: notYet('setSendTypingIndicator'),
    submitSendBox: notYet('submitSendBox')
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
    rawDispatch: notYet('rawDispatch')
  });
};

export default createServicesDriver;
