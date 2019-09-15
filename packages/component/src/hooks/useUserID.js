import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useUserID() {
  return [
    useContext(WebChatUIContext).userID,
    () => {
      throw new Error('UserID must be set using props.');
    }
  ];
}
