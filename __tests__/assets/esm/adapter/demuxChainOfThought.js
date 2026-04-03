/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 */

import { getActivityLivestreamingMetadata } from 'botframework-webchat-core';
import { asyncGeneratorWithLastValue } from 'iter-fest';

import findAllCopilotStudioThoughtEntity from './findAllCopilotStudioThoughtEntity.js';
import LivestreamSessionManager from './LivestreamSessionManager.js';

function* transform(options, livestreamSessionManager, activity) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const livestreamingMetadata = getActivityLivestreamingMetadata(activity);
  const thoughts = findAllCopilotStudioThoughtEntity(activity);

  // If the activity has no "thought" entity and its livestream session ID is not known as part of a chain of thought,
  // then, the activity is not a chain of thought, return it as-is.
  // Notes: the conclusion does not have "thought" entity, thus, we are checking against livestream session ID instead of thought.chainOfThoughtId.
  if (!thoughts.length && !(livestreamingMetadata && livestreamSessionManager.has(livestreamingMetadata.sessionId))) {
    yield activity;

    return;
  }

  for (const thought of thoughts) {
    const thoughtActivity = {
      entities: Object.freeze([
        Object.freeze({
          '@context': 'https://schema.org',
          '@id': '',
          '@type': 'Message',
          type: 'https://schema.org/Message',

          abstract: thought.title,
          isPartOf: Object.freeze({
            '@id': `_:${thought.chainOfThoughtId}`,
            '@type': 'HowTo'
          }),
          // If "Collapsible" keyword is present, the UI should collapse the thought by default. Otherwise, the thought will be expanded by default.
          keywords: options.collapseByDefault ? ['Collapsible'] : [],
          position: thought.sequenceNumber
        })
      ]),
      from: activity.from,
      id: `${thought.chainOfThoughtId}/${thought.sequenceNumber}/${activity.id}`,
      text: thought.text,
      timestamp: activity.timestamp ?? new Date().toISOString(),
      type: 'message'
    };

    if (livestreamingMetadata) {
      // Resequence the single chain-of-thought livestream, so every thought is of their own livestream.
      yield* livestreamSessionManager.sequence(
        `${thought.chainOfThoughtId}/${thought.sequenceNumber}`,
        thoughtActivity,
        livestreamingMetadata.type === 'final activity'
      );
    } else {
      yield thoughtActivity;
    }
  }

  // Is this an empty thought carrier activity?
  if (!activity.text && thoughts.length) {
    // Special case: if this is a thought carrier activity and the activity is empty, don't pass it.
    //               If we pass this empty carrier, it will reserve a spot in the chat history that is probably not the correct position in the history.
    return;
  }

  const soleActivity = Object.freeze({
    ...activity,
    entities: Object.freeze((activity.entities ?? []).filter(({ type }) => type !== 'thought')),
    timestamp: activity.timestamp ?? new Date().toISOString()
  });

  if (livestreamingMetadata) {
    yield* livestreamSessionManager.sequence(
      livestreamingMetadata.sessionId,
      soleActivity,
      livestreamingMetadata.type === 'final activity'
    );
  } else {
    yield soleActivity;
  }
}

/**
 * @returns {AsyncIterableIterator<Activity>}
 */
export async function* forIterator(options, activities) {
  const livestreamSessionManager = new LivestreamSessionManager();

  for await (const activity of activities) {
    yield* transform(options, livestreamSessionManager, activity);
  }

  yield* livestreamSessionManager.concludeAll();
}

/**
 * This patch will demux thoughts from a single activity into multiple activities.
 *
 * Web Chat use the multiple activities format.
 *
 * @param turnGenerator
 * @returns A patched `TurnGenerator` which all chain-of-thought activities are demuxed.
 */
function demuxChainOfThought(options, turnGenerator) {
  const patchTurnGenerator = currentTurnGenerator =>
    (async function* () {
      const turnGeneratorWithLastValue = asyncGeneratorWithLastValue(currentTurnGenerator);

      yield* forIterator(options, turnGeneratorWithLastValue);

      return (...args) => patchTurnGenerator(turnGeneratorWithLastValue.lastValue()(...args));
    })();

  return patchTurnGenerator(turnGenerator);
}

export default demuxChainOfThought;
