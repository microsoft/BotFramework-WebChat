import { type DirectLineJSBotConnection, type WebChatActivity } from 'botframework-webchat-core';

/**
 * For tests only, read only: what the default providers connected to a Direct Line show, without a Redux store.
 * The html2 helpers wait on it in default mode, as they wait on the Redux store in Redux mode.
 */
type TestHandle = {
  readonly getActivities: () => readonly WebChatActivity[];
  readonly getConnectivityStatus: () => string;
};

const testHandles = new WeakMap<DirectLineJSBotConnection, TestHandle>();
let latestTestHandle: TestHandle | undefined;

/** Set when the default providers connect to the Direct Line. */
export function setTestHandle(directLine: DirectLineJSBotConnection, testHandle: TestHandle): void {
  testHandles.set(directLine, testHandle);
  latestTestHandle = testHandle;
}

/** Removed when the default providers that connected it are disposed. */
export function deleteTestHandle(directLine: DirectLineJSBotConnection, testHandle: TestHandle): void {
  // Only the handle of the providers that set it: other providers may have connected to it since.
  testHandles.get(directLine) === testHandle && testHandles.delete(directLine);
  latestTestHandle === testHandle && (latestTestHandle = undefined);
}

/**
 * The test handle of the default providers connected to the Direct Line, if any. Without a Direct Line, the handle of
 * the default providers that connected last (most pages render one Web Chat).
 */
export function getTestHandle(directLine?: DirectLineJSBotConnection | undefined): TestHandle | undefined {
  return directLine ? testHandles.get(directLine) : latestTestHandle;
}

export type { TestHandle };
