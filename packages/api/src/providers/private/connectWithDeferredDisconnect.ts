import { type DirectLineJSBotConnection } from 'botframework-webchat-core';

/**
 * A connection kept for a moment after its providers unmounted.
 *
 * - `owner`: what connects (the `dispatch` of a Redux store, or the engine of the default providers).
 * - `disconnect`: disconnects it.
 * - `release`: after a disconnect, releases the owner if it is not used anymore (nothing for a Redux store, which the
 *   host or `<Composer>` owns; stops the machines of the engine).
 */
type DeferredDisconnect = {
  readonly directLine: DirectLineJSBotConnection;
  readonly disconnect: () => void;
  readonly owner: unknown;
  readonly release: () => void;
  readonly userID: string | undefined;
  readonly username: string | undefined;
};

/**
 * Disconnects scheduled by unmounting, for every provider set (Redux or default), so a change of provider set with the
 * same Direct Line behaves as a change of store.
 *
 * Strict Mode unmounts and mounts again right after the first mount, synchronously. DirectLineJS cannot start again
 * after its start is stopped, so unmounting disconnects in a microtask, and mounting again with the same owner and
 * connection cancels it. Any other mount with the same owner or the same Direct Line disconnects first, in the same
 * order as without deferring.
 *
 * Remove when DirectLineJS can start again after its start is stopped.
 */
const pendingDisconnects = new Set<DeferredDisconnect>();

/**
 * Connects on mount, or keeps the connection of the same owner, Direct Line and user, unmounted a moment ago. Returns
 * the cleanup of the effect, which disconnects in a microtask unless mounted again.
 *
 * For `useEffect()`, with `owner`, `directLine`, `userID` and `username` as dependencies.
 */
export default function connectWithDeferredDisconnect({
  connect,
  directLine,
  disconnect,
  owner,
  release,
  userID,
  username
}: DeferredDisconnect & { readonly connect: () => void }): () => void {
  // Mounted again with the same owner and connection (e.g. Strict Mode): keep the connection.
  const remountedPendingDisconnect = Array.from(pendingDisconnects).find(
    pendingDisconnect =>
      pendingDisconnect.directLine === directLine &&
      pendingDisconnect.owner === owner &&
      pendingDisconnect.userID === userID &&
      pendingDisconnect.username === username
  );

  for (const pendingDisconnect of pendingDisconnects) {
    if (
      pendingDisconnect !== remountedPendingDisconnect &&
      (pendingDisconnect.directLine === directLine || pendingDisconnect.owner === owner)
    ) {
      pendingDisconnects.delete(pendingDisconnect);
      pendingDisconnect.disconnect();
      pendingDisconnect.owner === owner || pendingDisconnect.release();
    }
  }

  remountedPendingDisconnect ? pendingDisconnects.delete(remountedPendingDisconnect) : connect();

  return () => {
    const pendingDisconnect: DeferredDisconnect = Object.freeze({
      directLine,
      disconnect,
      owner,
      release,
      userID,
      username
    });

    pendingDisconnects.add(pendingDisconnect);

    /**
     * @todo TODO: [P3] disconnect() is an async call (pending -> fulfilled), we need to wait, or change it to reconnect()
     */
    queueMicrotask(() => {
      if (pendingDisconnects.delete(pendingDisconnect)) {
        pendingDisconnect.disconnect();
        pendingDisconnect.release();
      }
    });
  };
}

export type { DeferredDisconnect };
