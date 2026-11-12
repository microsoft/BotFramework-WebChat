import { useSelector } from '@msinternal/botframework-webchat-redux-store';

const selectSendTypingIndicator = ({ sendTypingIndicator }) => sendTypingIndicator;

export default function useSendTypingIndicator(): [boolean] {
  return [useSelector(selectSendTypingIndicator)];
}
