/* eslint-disable security/detect-object-injection */

/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 */

import LivestreamSession from './LivestreamSession.js';

const ActiveLivestreamSymbol = Symbol();

export default class LivestreamSessionManager {
  constructor() {
    this[ActiveLivestreamSymbol] = new Map();
  }

  *concludeAll() {
    for (const [sessionId, session] of this[ActiveLivestreamSymbol]) {
      if (!session.isConcluded) {
        const { previousActivity } = session;
        const entitiesWithoutStreamInfo = (previousActivity?.entities ?? []).filter(
          ({ type }) => type !== 'streaminfo'
        );

        yield Object.freeze({
          ...previousActivity,
          channelData: Object.freeze({
            ...previousActivity?.channelData,
            chunkType: undefined,
            streamId: sessionId,
            streamSequence: undefined,
            streamType: 'final'
          }),
          entities: Object.freeze([...entitiesWithoutStreamInfo]),
          id: `${sessionId}/final`,
          text: previousActivity?.text,
          type: 'message'
        });
      }
    }
  }

  has(livestreamSessionId) {
    return this[ActiveLivestreamSymbol].has(livestreamSessionId);
  }

  *sequence(livestreamSessionId, activity, isFinal = false) {
    let livestreamSession = this[ActiveLivestreamSymbol].get(livestreamSessionId);

    if (!livestreamSession) {
      livestreamSession = new LivestreamSession(livestreamSessionId);

      this[ActiveLivestreamSymbol].set(livestreamSessionId, livestreamSession);
    }

    if (livestreamSession.isConcluded) {
      return;
    }

    const streamSequence = livestreamSession.getNextLivestreamSequence(isFinal);
    const entitiesWithoutStreamInfo = (activity.entities ?? []).filter(({ type }) => type !== 'streaminfo');

    // We assume the chat adapter will do delta decompression.
    livestreamSession.previousActivity = activity;

    yield Object.freeze({
      ...activity,
      channelData: Object.freeze({
        ...activity.channelData,
        chunkType: undefined,
        streamId: streamSequence === 1 ? undefined : livestreamSessionId,
        streamSequence: streamSequence === Infinity ? undefined : streamSequence,
        streamType: streamSequence === Infinity ? 'final' : 'streaming'
      }),
      entities: Object.freeze([...entitiesWithoutStreamInfo]),
      id: streamSequence === 1 ? livestreamSessionId : activity.id,
      text: livestreamSession.previousActivity.text,
      type: streamSequence === Infinity ? 'message' : 'typing'
    });
  }
}
