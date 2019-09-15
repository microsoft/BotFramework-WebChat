import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useDisabled() {
  return [
    useContext(WebChatUIContext).disabled,
    () => {
      throw new Error('Disabled must be set using props.');
    }
  ];
}
