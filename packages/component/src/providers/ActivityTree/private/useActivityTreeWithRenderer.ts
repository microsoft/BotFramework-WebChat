import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

import intersectionOf from '../../../Utils/intersectionOf';
import removeInline from '../../../Utils/removeInline';
import type { ActivityWithRenderer, ReadonlyActivityTree } from './types';

const { useGroupActivities } = hooks;

function validateAllEntriesTagged<T>(entries: readonly T[], bins: readonly (readonly T[])[]): boolean {
  return entries.every(entry => bins.some(bin => bin.includes(entry)));
}

// Activity tree is a multidimensional array, while activities is a 1D array.
// - The first dimension of the array contains activities with same sender;
// - The second dimension of the array contains activities with same status.

// [
//   [
//     // Both messages are from bot and is sent as a batch, we will group them as an array.
//     'Bot: Hello!'
//     'Bot: What can I help today?'
//   ],
//   [
//     'User: What is the weather?'
//   ],
//   [
//     'Bot: Let me look it up... hold on.'
//   ],
//   [
//     // This message is in a different group because it is more than a few seconds apart from the previous message.
//     'Bot: Here is the weather forecast.'
//   ]
// ]

function useActivityTreeWithRenderer(entries: readonly ActivityWithRenderer[]): ReadonlyActivityTree {
  const groupActivities = useGroupActivities();

  // We bin activities in 2 different ways:
  // - `activitiesBySender` is a 2D array containing activities with same sender
  // - `activitiesByStatus` is a 2D array containing activities with same status
  // Both arrays should contains all activities.

  const { entriesBySender, entriesByStatus } = useMemo<{
    entriesBySender: readonly (readonly ActivityWithRenderer[])[];
    entriesByStatus: readonly (readonly ActivityWithRenderer[])[];
  }>(() => {
    const visibleActivities = entries.map(({ activity }) => activity);

    const groupActivitiesResult = groupActivities({ activities: visibleActivities });

    const activitiesBySender = groupActivitiesResult?.sender || [];
    const activitiesByStatus = groupActivitiesResult?.status || [];

    const [entriesBySender, entriesByStatus] = [activitiesBySender, activitiesByStatus].map(bins =>
      bins.map(bin => bin.map(activity => entries.find(entry => entry.activity === activity)))
    );

    if (!validateAllEntriesTagged(visibleActivities, activitiesBySender)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "sender" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    if (!validateAllEntriesTagged(visibleActivities, activitiesByStatus)) {
      console.warn(
        'botframework-webchat: Not every activities are grouped in the "status" property. Please fix "groupActivitiesMiddleware" and group every activities.'
      );
    }

    return {
      entriesBySender,
      entriesByStatus
    };
  }, [entries, groupActivities]);

  // Create a tree of activities with 2 dimensions: sender, followed by status.

  const activityTree: ReadonlyActivityTree = useMemo(() => {
    const entriesPendingGrouping = [...entries];
    const activityTree: (readonly (readonly ActivityWithRenderer[])[])[] = [];

    while (entriesPendingGrouping.length) {
      let found: boolean;
      const entriesWithSameSender = entriesBySender.find(bin => bin.includes(entriesPendingGrouping[0]));
      const senderTree: (readonly ActivityWithRenderer[])[] = [];

      entriesWithSameSender?.forEach(entry => {
        const entriesWithSameStatus = entriesByStatus.find(bin => bin.includes(entry));

        const entriesWithSameSenderAndStatus = intersectionOf<ActivityWithRenderer>(
          entriesPendingGrouping,
          entriesWithSameSender,
          entriesWithSameStatus
        );

        if (entriesWithSameSenderAndStatus.length) {
          senderTree.push(Object.freeze(entriesWithSameSenderAndStatus));
          removeInline(entriesPendingGrouping, ...entriesWithSameSenderAndStatus);

          found = true;
        }
      });

      // If the entry is not grouped by the middleware, just put the entry in its own bin.
      found || senderTree.push(Object.freeze([entriesPendingGrouping.shift()]));

      activityTree.push(Object.freeze(senderTree));
    }

    // Assertion: All entries must be assigned to the activityTree.
    if (
      !entries.every(activity =>
        activityTree.some(activitiesWithSameSender =>
          activitiesWithSameSender.some(activitiesWithSameSenderAndStatus =>
            activitiesWithSameSenderAndStatus.includes(activity)
          )
        )
      )
    ) {
      console.warn('botframework-webchat internal: Not all visible activities are grouped in the activityTree.', {
        entries,
        activityTree
      });
    }

    return Object.freeze(activityTree);
  }, [entriesBySender, entriesByStatus, entries]);

  return activityTree;
}

export type { ActivityWithRenderer };

export default useActivityTreeWithRenderer;
