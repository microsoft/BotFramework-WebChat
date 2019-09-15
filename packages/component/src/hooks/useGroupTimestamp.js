import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useGroupTimestamp() {
  return [
    useContext(WebChatUIContext).groupTimestamp,
    () => {
      throw new Error('GroupTimestamp must be set using StyleOptions.');
    }
  ];
}
