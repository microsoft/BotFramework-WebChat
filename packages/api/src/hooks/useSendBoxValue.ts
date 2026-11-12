import { useSelector } from '@msinternal/botframework-webchat-redux-store';

import useWebChatAPIContext from './internal/useWebChatAPIContext';

const selectSendBoxValue = ({ sendBoxValue }) => sendBoxValue;

export default function useSendBoxValue(): [string, (value: string) => void] {
  return [useSelector(selectSendBoxValue), useWebChatAPIContext().setSendBox];
}
