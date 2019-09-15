import { useContext } from 'react';
import WebChatUIContext from '../WebChatUIContext';

export default function useStyleSet() {
  return [
    useContext(WebChatUIContext).styleSet,
    () => {
      throw new Error('StyleSet must be set using props.');
    }
  ];
}
