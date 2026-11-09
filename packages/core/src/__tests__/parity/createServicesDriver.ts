// The services of the default providers (no Redux), on the clock of the script: the notifications cell, the connection
// service, the incoming service, and the activities store.
import { createActivitiesStore } from '@msinternal/botframework-webchat-core-activities';

import createConnectionService from '../../services/createConnectionService';
import createIncomingService from '../../services/createIncomingService';
import createNotificationsCell from '../../services/createNotificationsCell';
import type { CreateDriver, Observation } from './runParityScript';

const createServicesDriver: CreateDriver = ({ faults, onChange, onSuggestedActions, ponyfill }) => {
  const activitiesStore = createActivitiesStore({ ponyfill });
  const notifications = createNotificationsCell({ ponyfill });
  const connection = createConnectionService({ notifications, ponyfill });
  const incoming = createIncomingService({
    activitiesStore: {
      getSnapshot: activitiesStore.getSnapshot,
      receiveActivity: activity => {
        if (faults.receiveThrowsFor === activity.id) {
          throw new Error(`receive ${faults.receiveThrowsFor}`);
        }

        activitiesStore.receiveActivity(activity);
      }
    },
    connection,
    ponyfill
  });

  const unsubscribeSuggestedActions = incoming.onSuggestedActions(onSuggestedActions);

  const observe = (): Observation => ({
    activities: activitiesStore.getSnapshot().sortedActivities,
    connectivityStatus: connection.connectivityStatus.get(),
    notifications: notifications.notifications.get(),
    referenceGrammarID: connection.referenceGrammarID.get()
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

  return Object.freeze({
    connect: init => connection.connect(init),
    disconnect: () => connection.disconnect(),
    dispose: () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
      unsubscribeSuggestedActions();
      connection.dispose();
    },
    observe
  });
};

export default createServicesDriver;
