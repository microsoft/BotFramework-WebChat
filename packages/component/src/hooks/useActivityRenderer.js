import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useActivityRenderer() {
  return [
    useContext(WebChatUIContext).activityRenderer,
    () => {
      throw new Error('ActivityRenderer must be set using props.');
    }
  ];
}
