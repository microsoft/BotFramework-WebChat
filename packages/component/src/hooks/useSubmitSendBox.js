import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useSubmitSendbox() {
  return useContext(WebChatContext).submitSendBox;
}
