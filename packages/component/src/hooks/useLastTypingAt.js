import { useSelector } from '../WebChatReduxContext';

let showDeprecationNotes = true;

export default function useLastTypingAt() {
  if (showDeprecationNotes) {
    console.warn(
      'botframework-webchat: "useLastTypingAt" is deprecated. Please use "useActiveTyping" instead. They will be removed on or after 2022-02-16.'
    );

    showDeprecationNotes = false;
  }

  return [useSelector(({ lastTypingAt }) => lastTypingAt)];
}
