/* eslint-disable complexity */
import type { Identifier } from '../../node/NodeIdentifier.ts';
import type { DirectLineActivity } from './DirectLineActivity.ts';
import getLivestreamingMetadata, { type LivestreamingMetadata } from './getLivestreamingMetadata.ts';
import getLogicalTimestamp from './getLogicalTimestamp.ts';
import getPartGrouping, { type PartGrouping } from './getPartGrouping.ts';
import insertSorted from './insertSorted.ts';

// This is a port of `upsert.ts` and `deleteActivityByLocalId.ts` of `botframework-webchat-core`, except:
//
// - Activities are keyed by `@id` of their node
// - Instead of assigning position to activities, sorted result is returned and placed in `dateCreated` by the caller
//
// Honoring timestamp or not:
//
// - Update activity
//    - (Should honor) every changes
// - Echo back activity
//    - (Should honor) timestamp of echo back of outgoing message
// - Livestream activity
//    - (Should not honor) timestamp of revisions of livestream as it could "flash" them to the bottom
//       - Should not update session timestamp
//    - How:
//       - If it's 1 or Nth revision, copy the timestamp from upserting activity into session
//       - Otherwise, it's 2...N-1, don't copy the timestamp into session
// - HowTo part grouping
//    - (Should not honor) timestamp change via livestream as it could "flash" them to the bottom
//       - Not honoring by copying the timestamp from livestream session
//    - How: copy the timestamp from the upserting part (livestream or update) into part grouping
//
// Simplifying/concluding all rules:
//
// - Always copy timestamp, except when it's a livestream of 2...N-1 revision
// - Part grouping timestamp is copied from upserting entry (either livestream session or activity)
//
// Question: Why insertion sort works but not quick sort?
// Short answer: Arrival order matters.
// Long answer:
// - Update activity: when replacing an activity, data from their previous revision matters
// - Duplicate timestamps: activities without timestamp can't be sort deterministically with quick sort

type SortableActivity = {
  readonly howToGrouping: PartGrouping | undefined;
  readonly livestreamingMetadata: LivestreamingMetadata | undefined;
  readonly localTimestamp: number | undefined;
  readonly logicalTimestamp: number | undefined;
};

type ActivityEntry = {
  readonly id: Identifier;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'activity';
};

type HowToGroupingEntry = {
  readonly howToGroupingId: string;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'how to grouping';
};

type LivestreamSessionEntry = {
  readonly livestreamSessionId: string;
  readonly logicalTimestamp: number | undefined;
  readonly type: 'livestream session';
};

type HowToGroupingPartEntry = (ActivityEntry | LivestreamSessionEntry) & { readonly position: number | undefined };

type HowToGrouping = {
  readonly logicalTimestamp: number | undefined;
  readonly partList: readonly HowToGroupingPartEntry[];
};

type LivestreamSessionActivityEntry = ActivityEntry & { readonly sequenceNumber: number };

type LivestreamSession = {
  readonly activities: readonly LivestreamSessionActivityEntry[];
  readonly finalized: boolean;
  readonly logicalTimestamp: number | undefined;
};

type SortedChatHistoryEntry = ActivityEntry | HowToGroupingEntry | LivestreamSessionEntry;

type SortState = {
  readonly activityMap: ReadonlyMap<Identifier, SortableActivity>;
  readonly howToGroupingMap: ReadonlyMap<string, HowToGrouping>;
  readonly livestreamSessionMap: ReadonlyMap<string, LivestreamSession>;
  readonly sortedChatHistoryList: readonly SortedChatHistoryEntry[];
};

type SortedActivity = {
  readonly id: Identifier;
  /** Logical timestamp of the entry in chat history, i.e. activity, livestream session, or HowTo grouping. */
  readonly logicalTimestamp: number | undefined;
};

const INITIAL_SORT_STATE: SortState = Object.freeze({
  activityMap: Object.freeze(new Map()),
  howToGroupingMap: Object.freeze(new Map()),
  livestreamSessionMap: Object.freeze(new Map()),
  sortedChatHistoryList: Object.freeze([])
});

function compareSequenceNumber(
  { sequenceNumber: x }: LivestreamSessionActivityEntry,
  { sequenceNumber: y }: LivestreamSessionActivityEntry
): number {
  return x - y;
}

function comparePosition(
  { position: x }: HowToGroupingPartEntry,
  { position: y }: HowToGroupingPartEntry
): number {
  // eslint-disable-next-line no-magic-numbers
  return typeof x === 'undefined' || typeof y === 'undefined' ? -1 : x - y;
}

function computePartListTimestamp(partList: readonly HowToGroupingPartEntry[]): number | undefined {
  return partList.reduce<number | undefined>(
    (max, { logicalTimestamp }) =>
      typeof logicalTimestamp === 'undefined' ? max : Math.max(max ?? -Infinity, logicalTimestamp),
    undefined
  );
}

function toSortableActivity(activity: DirectLineActivity): SortableActivity {
  const localTimestamp =
    typeof activity.localTimestamp === 'string' ? new Date(activity.localTimestamp).getTime() : undefined;

  return Object.freeze({
    howToGrouping: getPartGrouping(activity, 'HowTo'),
    livestreamingMetadata: getLivestreamingMetadata(activity),
    localTimestamp: Number.isNaN(localTimestamp) ? undefined : localTimestamp,
    logicalTimestamp: getLogicalTimestamp(activity)
  });
}

/**
 * Deletes an activity, returns the same state if the activity does not exist.
 */
function deleteSortedActivity(state: SortState, id: Identifier): SortState {
  if (!state.activityMap.has(id)) {
    return state;
  }

  const nextActivityMap = new Map(state.activityMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);
  let nextSortedChatHistoryList = [...state.sortedChatHistoryList];

  nextActivityMap.delete(id);

  for (const [howToGroupingId, entry] of nextHowToGroupingMap) {
    const partIndex = entry.partList.findIndex(part => part.type === 'activity' && part.id === id);

    if (~partIndex) {
      const nextPartList = [...entry.partList];

      nextPartList.splice(partIndex, 1);

      if (nextPartList.length) {
        nextHowToGroupingMap.set(
          howToGroupingId,
          Object.freeze({
            logicalTimestamp: computePartListTimestamp(nextPartList),
            partList: Object.freeze(nextPartList)
          })
        );
      } else {
        nextHowToGroupingMap.delete(howToGroupingId);

        nextSortedChatHistoryList = nextSortedChatHistoryList.filter(
          entry => !(entry.type === 'how to grouping' && entry.howToGroupingId === howToGroupingId)
        );
      }
    }
  }

  for (const [livestreamSessionId, session] of nextLivestreamSessionMap) {
    const activityIndex = session.activities.findIndex(activity => activity.id === id);

    if (~activityIndex) {
      const nextActivities = [...session.activities];

      nextActivities.splice(activityIndex, 1);

      if (nextActivities.length) {
        // eslint-disable-next-line no-magic-numbers
        const lastActivity = nextActivities.at(-1);
        const finalActivity = lastActivity?.sequenceNumber === Infinity ? lastActivity : undefined;
        const logicalTimestamp = finalActivity ? finalActivity.logicalTimestamp : nextActivities[0]?.logicalTimestamp;

        nextLivestreamSessionMap.set(
          livestreamSessionId,
          Object.freeze({ activities: Object.freeze(nextActivities), finalized: !!finalActivity, logicalTimestamp })
        );

        for (const [howToGroupingId, entry] of nextHowToGroupingMap) {
          if (
            entry.partList.some(
              part => part.type === 'livestream session' && part.livestreamSessionId === livestreamSessionId
            )
          ) {
            const nextPartList = entry.partList.map(part =>
              part.type === 'livestream session' && part.livestreamSessionId === livestreamSessionId
                ? Object.freeze({ ...part, logicalTimestamp })
                : part
            );

            nextHowToGroupingMap.set(
              howToGroupingId,
              Object.freeze({
                logicalTimestamp: computePartListTimestamp(nextPartList),
                partList: Object.freeze(nextPartList)
              })
            );
          }
        }
      } else {
        nextLivestreamSessionMap.delete(livestreamSessionId);

        nextSortedChatHistoryList = nextSortedChatHistoryList.filter(
          entry => !(entry.type === 'livestream session' && entry.livestreamSessionId === livestreamSessionId)
        );

        for (const [howToGroupingId, entry] of nextHowToGroupingMap) {
          const nextPartList = entry.partList.filter(
            part => !(part.type === 'livestream session' && part.livestreamSessionId === livestreamSessionId)
          );

          if (nextPartList.length !== entry.partList.length) {
            if (nextPartList.length) {
              nextHowToGroupingMap.set(
                howToGroupingId,
                Object.freeze({
                  logicalTimestamp: computePartListTimestamp(nextPartList),
                  partList: Object.freeze(nextPartList)
                })
              );
            } else {
              nextHowToGroupingMap.delete(howToGroupingId);

              nextSortedChatHistoryList = nextSortedChatHistoryList.filter(
                entry => !(entry.type === 'how to grouping' && entry.howToGroupingId === howToGroupingId)
              );
            }
          }
        }
      }
    }
  }

  return Object.freeze({
    activityMap: Object.freeze(nextActivityMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedChatHistoryList: Object.freeze(
      nextSortedChatHistoryList
        .filter(entry => !(entry.type === 'activity' && entry.id === id))
        // Timestamps of groupings and sessions could be changed after deletion, they are used for future insertions.
        .map(entry =>
          entry.type === 'how to grouping'
            ? Object.freeze({
                ...entry,
                logicalTimestamp: nextHowToGroupingMap.get(entry.howToGroupingId)?.logicalTimestamp
              })
            : entry.type === 'livestream session'
              ? Object.freeze({
                  ...entry,
                  logicalTimestamp: nextLivestreamSessionMap.get(entry.livestreamSessionId)?.logicalTimestamp
                })
              : entry
        )
    )
  });
}

/**
 * Inserts or updates an activity, returns the same state if the activity is ignored, e.g. the activity is a revision
 * of a concluded livestream session.
 */
function upsertSortedActivity(state: SortState, id: Identifier, activity: SortableActivity): SortState {
  const existingActivity = state.activityMap.get(id);
  const { howToGrouping, livestreamingMetadata, logicalTimestamp } = activity;

  // An update can leave, join, or move between HowTo groupings.
  // Remove the previous revision first, otherwise it stays in its previous grouping and is shown twice.
  // Livestream revisions are excluded: their grouping belongs to the session, deleting one revision would break it.
  if (
    !livestreamingMetadata &&
    existingActivity &&
    existingActivity.howToGrouping?.groupingId !== howToGrouping?.groupingId
  ) {
    return upsertSortedActivity(deleteSortedActivity(state, id), id, activity);
  }

  const nextActivityMap = new Map(state.activityMap);
  const nextHowToGroupingMap = new Map(state.howToGroupingMap);
  const nextLivestreamSessionMap = new Map(state.livestreamSessionMap);

  nextActivityMap.set(id, activity);

  let sortedChatHistoryEntry: SortedChatHistoryEntry = Object.freeze({ id, logicalTimestamp, type: 'activity' });

  // #region Livestreaming

  if (livestreamingMetadata) {
    const { sessionId } = livestreamingMetadata;
    const session = nextLivestreamSessionMap.get(sessionId);

    if (session?.finalized) {
      // TODO: [P1] Revisit this and see how we should process activity after the livestream is finalized.
      console.warn(
        `botframework-webchat: Cannot update livestreaming session ${sessionId} because it has been concluded`
      );

      return state;
    }

    const finalized = livestreamingMetadata.type === 'final activity';

    const nextSession: LivestreamSession = Object.freeze({
      activities: Object.freeze(
        insertSorted<LivestreamSessionActivityEntry>(
          // Remove the previous entry of a re-sent revision, otherwise it is shown twice.
          session ? session.activities.filter(entry => entry.id !== id) : [],
          Object.freeze({ id, logicalTimestamp, sequenceNumber: livestreamingMetadata.sequenceNumber, type: 'activity' }),
          compareSequenceNumber
        )
      ),
      finalized,
      // Update timestamp if the upserting activity is the first or last in the livestream session.
      // We don't update timestamp for 2...N-1, because it would cause too much flickering.
      logicalTimestamp: finalized || !session ? logicalTimestamp : session.logicalTimestamp
    });

    nextLivestreamSessionMap.set(sessionId, nextSession);

    sortedChatHistoryEntry = Object.freeze({
      livestreamSessionId: sessionId,
      logicalTimestamp: nextSession.logicalTimestamp,
      type: 'livestream session'
    });
  }

  // #endregion

  // #region HowTo grouping

  if (howToGrouping) {
    const { groupingId: howToGroupingId, position } = howToGrouping;
    const partList = nextHowToGroupingMap.get(howToGroupingId)?.partList ?? [];
    const existingPartEntryIndex = livestreamingMetadata
      ? partList.findIndex(
          entry => entry.type === 'livestream session' && entry.livestreamSessionId === livestreamingMetadata.sessionId
        )
      : partList.findIndex(entry => entry.type === 'activity' && entry.id === id);

    const nextPartEntry: HowToGroupingPartEntry = Object.freeze({ ...sortedChatHistoryEntry, position }) as
      | (ActivityEntry & { readonly position: number | undefined })
      | (LivestreamSessionEntry & { readonly position: number | undefined });

    let nextPartList = [...partList];

    // If the upserting activity is position-less and an earlier revision is in the grouping, update the existing entry
    // instead of splice/insert.
    if (~existingPartEntryIndex && typeof position === 'undefined') {
      nextPartList.splice(existingPartEntryIndex, 1, nextPartEntry);
    } else {
      // The upserting activity has position, or it never exist in the grouping.
      ~existingPartEntryIndex && nextPartList.splice(existingPartEntryIndex, 1);

      nextPartList = insertSorted(nextPartList, nextPartEntry, comparePosition);
    }

    const nextHowToGrouping: HowToGrouping = Object.freeze({
      logicalTimestamp: computePartListTimestamp(nextPartList),
      partList: Object.freeze(nextPartList)
    });

    nextHowToGroupingMap.set(howToGroupingId, nextHowToGrouping);

    sortedChatHistoryEntry = Object.freeze({
      howToGroupingId,
      logicalTimestamp: nextHowToGrouping.logicalTimestamp,
      type: 'how to grouping'
    });
  }

  // #endregion

  // #region Sorted chat history

  const entry = sortedChatHistoryEntry;

  const nextSortedChatHistoryList = insertSorted(
    state.sortedChatHistoryList.filter(existingEntry =>
      entry.type === 'how to grouping'
        ? !(existingEntry.type === 'how to grouping' && existingEntry.howToGroupingId === entry.howToGroupingId)
        : entry.type === 'livestream session'
          ? !(
              existingEntry.type === 'livestream session' &&
              existingEntry.livestreamSessionId === entry.livestreamSessionId
            )
          : !(existingEntry.type === 'activity' && existingEntry.id === id)
    ),
    entry,
    (x, y) => {
      // Compare logical timestamp if both have it.
      // Otherwise, compare local timestamp if both have it.
      // Otherwise, -1.
      if (typeof x.logicalTimestamp !== 'undefined' && typeof y.logicalTimestamp !== 'undefined') {
        return x.logicalTimestamp - y.logicalTimestamp;
      }

      if (x.type === 'activity' && y.type === 'activity') {
        const xLocalTimestamp = nextActivityMap.get(x.id)?.localTimestamp;
        const yLocalTimestamp = nextActivityMap.get(y.id)?.localTimestamp;

        if (typeof xLocalTimestamp !== 'undefined' && typeof yLocalTimestamp !== 'undefined') {
          return xLocalTimestamp - yLocalTimestamp;
        }
      }

      // eslint-disable-next-line no-magic-numbers
      return -1;
    }
  );

  // #endregion

  return Object.freeze({
    activityMap: Object.freeze(nextActivityMap),
    howToGroupingMap: Object.freeze(nextHowToGroupingMap),
    livestreamSessionMap: Object.freeze(nextLivestreamSessionMap),
    sortedChatHistoryList: Object.freeze(nextSortedChatHistoryList)
  });
}

function* yieldSessionActivities(
  session: LivestreamSession,
  logicalTimestamp: number | undefined
): Generator<SortedActivity> {
  if (session.finalized) {
    // After finalization, only yield the final revision, intermediate revisions are pruned.
    // eslint-disable-next-line no-magic-numbers
    const lastActivity = session.activities.at(-1);

    lastActivity && (yield Object.freeze({ id: lastActivity.id, logicalTimestamp }));
  } else {
    for (const { id } of session.activities) {
      yield Object.freeze({ id, logicalTimestamp });
    }
  }
}

/**
 * Gets activities in sorted order. Intermediate revisions of concluded livestream sessions are pruned.
 *
 * The logical timestamp of each activity is the timestamp of its entry in chat history, i.e. activity, livestream
 * session, or HowTo grouping.
 */
function* getSortedActivities(state: SortState): Generator<SortedActivity> {
  const { activityMap, howToGroupingMap, livestreamSessionMap } = state;

  for (const entry of state.sortedChatHistoryList) {
    if (entry.type === 'activity') {
      yield Object.freeze({ id: entry.id, logicalTimestamp: activityMap.get(entry.id)?.logicalTimestamp });
    } else if (entry.type === 'how to grouping') {
      const howToGrouping = howToGroupingMap.get(entry.howToGroupingId);

      for (const part of howToGrouping?.partList ?? []) {
        if (part.type === 'activity') {
          yield Object.freeze({ id: part.id, logicalTimestamp: howToGrouping?.logicalTimestamp });
        } else {
          const session = livestreamSessionMap.get(part.livestreamSessionId);

          session && (yield* yieldSessionActivities(session, howToGrouping?.logicalTimestamp));
        }
      }
    } else {
      const session = livestreamSessionMap.get(entry.livestreamSessionId);

      session && (yield* yieldSessionActivities(session, session.logicalTimestamp));
    }
  }
}

export {
  deleteSortedActivity,
  getSortedActivities,
  INITIAL_SORT_STATE,
  toSortableActivity,
  upsertSortedActivity,
  type SortableActivity,
  type SortedActivity,
  type SortState
};
