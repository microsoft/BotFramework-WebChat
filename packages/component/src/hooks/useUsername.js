import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useUsername() {
  return [
    useContext(WebChatUIContext).username,
    () => {
      throw new Error('Username must be set using props.');
    }
  ];
}
