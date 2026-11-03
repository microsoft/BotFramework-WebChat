/* eslint-env browser */
/*!
 * Copyright (C) Microsoft Corporation. All rights reserved.
 */

import { getActivityLivestreamingMetadata } from 'botframework-webchat-core';

/**
 * Creates a `TransformStream` that coalesces interim livestream activities.
 *
 * All activities from one network chunk arrive as a burst of microtasks.
 * Buffering interims until the next macrotask (`setTimeout(32)`) collapses
 * the burst into a single latest-per-session activity.
 *
 * Non-interim activities (first-in-session, informative, contentless, final)
 * pass through immediately.
 */
export default function createStreamCoalescer() {
  const knownSessions = new Set();
  const pendingInterim = new Map();

  let controller;
  let flushScheduled = false;
  let flushTimer;

  function flushPending() {
    if (!flushScheduled) {
      return;
    }

    flushScheduled = false;
    clearTimeout(flushTimer);

    for (const activity of pendingInterim.values()) {
      controller.enqueue(activity);
    }

    pendingInterim.clear();
  }

  function scheduleFlush() {
    if (flushScheduled) {
      return;
    }

    flushScheduled = true;

    flushTimer = setTimeout(flushPending, 32);
  }

  return new TransformStream({
    start(ctrl) {
      controller = ctrl;
    },

    transform(activity) {
      const meta = getActivityLivestreamingMetadata(activity);

      // Non-livestream activity passes through.
      if (!meta) {
        controller.enqueue(activity);
        return;
      }

      const { sessionId, type } = meta;

      // Final activity passes through and clears session state.
      if (type === 'final activity') {
        pendingInterim.delete(sessionId);
        knownSessions.delete(sessionId);
        controller.enqueue(activity);
        return;
      }

      // First activity in a session passes through to establish the session downstream.
      if (!knownSessions.has(sessionId)) {
        knownSessions.add(sessionId);
        controller.enqueue(activity);
        return;
      }

      // Informative / contentless pass through (low volume, distinct UI slot).
      if (type !== 'interim activity') {
        controller.enqueue(activity);
        return;
      }

      // Interim activity: buffer the latest per session, flush on next macrotask.
      pendingInterim.set(sessionId, activity);
      scheduleFlush();
    },

    flush() {
      clearTimeout(flushTimer);
      flushScheduled = false;

      for (const activity of pendingInterim.values()) {
        controller.enqueue(activity);
      }

      pendingInterim.clear();
    }
  });
}
