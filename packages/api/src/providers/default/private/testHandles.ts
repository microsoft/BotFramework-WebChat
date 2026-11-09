import { type DirectLineJSBotConnection, type WebChatActivity } from 'botframework-webchat-core';

/**
 * For tests only: what the default providers connected to a Direct Line show, without a Redux store, and a way to do what
 * the html2 helpers do through the store in Redux mode (e.g. the emulator posts with a `POST_ACTIVITY`). The html2 helpers
 * use it in default mode, as they use the Redux store in Redux mode.
 */
type TestHandle = {
  /** As `SET_NOTIFICATION` and `DISMISS_NOTIFICATION` dispatched to the Redux store. */
  readonly dismissNotification: (id: string) => void;
  /** As `store.dispatch()` of the actions that send activities (the `dispatch()` of card action middleware). */
  readonly dispatch: (action: unknown) => unknown;
  readonly getActivities: () => readonly WebChatActivity[];
  readonly getConnectivityStatus: () => string;
  /** `DictateState`, as the `dictateState` of the Redux store. */
  readonly getDictateState: () => number;
  /** As `language` of the Redux store. */
  readonly getLanguage: () => string;
  /** As `voice.microphoneMuted` of the Redux store. */
  readonly getMicrophoneMuted: () => boolean;
  readonly getSendBoxValue: () => string;
  /** As `suggestedActions` of the Redux store. */
  readonly getSuggestedActions: () => readonly unknown[];
  /** As `voice.voiceState` of the Redux store. */
  readonly getVoiceState: () => string;
  readonly postActivity: (activity: WebChatActivity, method?: string) => void;
  /** As `INCOMING_ACTIVITY` dispatched to the Redux store: into the activities, as is (not through Direct Line). */
  readonly receiveActivity: (activity: WebChatActivity) => void;
  readonly setNotification: (notification: {
    readonly alt?: string | undefined;
    readonly data?: unknown;
    readonly id: string;
    readonly level: string;
    readonly message?: string | undefined;
  }) => void;
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
