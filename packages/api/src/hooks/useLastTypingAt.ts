import { useSelector } from './internal/WebChatReduxContext';

let showDeprecationNotes = true;

/** @deprecated Please use "useActiveTyping" instead. */
export default function useLastTypingAt(): [{ [userId: string]: number }] {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useLastTypingAt" is deprecated. Please use "useActiveTyping" instead. This hook will be removed on or after 2022-02-16.'
    );

    showDeprecationNotes = false;
  }

  return [useSelector(({ lastTypingAt }) => lastTypingAt)];
}
