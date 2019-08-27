import { useContext } from 'react';
import WebChatContext from '../Context';

export default function useGroupTimestamp() {
  return useContext(WebChatContext).groupTimestamp;
}
