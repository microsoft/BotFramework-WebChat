import { hooks } from 'botframework-webchat-api';
import { useMemo } from 'react';

import type { DirectLineActivity } from 'botframework-webchat-core';

import intersectionOf from '../../Utils/intersectionOf';
import removeInline from '../../Utils/removeInline';
import useActivitiesWithRenderer from './useActivitiesWithRenderer';

import type { ActivityWithRenderer } from './useActivitiesWithRenderer';

const { useGroupActivities } = hooks;

function validateAllEntriesTagged(entries: ActivityWithRenderer[], bins: ActivityWithRenderer[][]): boolean {
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

function useActivityTreeWithRenderer(): [ActivityWithRenderer[][][]] {
  const [entries] = useActivitiesWithRenderer();
  const groupActivities = useGroupActivities();

  // We bin activities in 2 different ways:
  // - `activitiesBySender` is a 2D array containing activities with same sender
  // - `activitiesByStatus` is a 2D array containing activities with same status
  // Both arrays should contains all activities.

  const { entriesBySender, entriesByStatus } = useMemo<{
    entriesBySender: DirectLineActivity[][];
    entriesByStatus: DirectLineActivity[][];
  }>(() => {
    const visibleActivities = entries.map(({ activity }) => activity);

    const {
      sender: activitiesBySender,
      status: activitiesByStatus
    }: {
      sender: DirectLineActivity[][];
      status: DirectLineActivity[][];
    } = groupActivities({
      activities: visibleActivities
    });

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

  const activityTree = useMemo<ActivityWithRenderer[][][]>(() => {
    const entriesPendingGrouping = [...entries];
    const activityTree: ActivityWithRenderer[][][] = [];

    while (entriesPendingGrouping.length) {
      const entriesWithSameSender = entriesBySender.find(bin => bin.includes(entriesPendingGrouping[0]));
      const senderTree: ActivityWithRenderer[][] = [];

      activityTree.push(senderTree);

      entriesWithSameSender.forEach(entry => {
        const entriesWithSameStatus = entriesByStatus.find(bin => bin.includes(entry));

        const entriesWithSameSenderAndStatus = intersectionOf(
          entriesPendingGrouping,
          entriesWithSameSender,
          entriesWithSameStatus
        );

        if (entriesWithSameSenderAndStatus.length) {
          senderTree.push(entriesWithSameSenderAndStatus);
          removeInline(entriesPendingGrouping, ...entriesWithSameSenderAndStatus);
        }
      });
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

    return activityTree;
  }, [entriesBySender, entriesByStatus, entries]);

  return [activityTree];
}

export type { ActivityWithRenderer };

export default useActivityTreeWithRenderer;
