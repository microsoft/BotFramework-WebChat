import { useContext } from 'react';

import WebChatUIContext from '../../WebChatUIContext';

export default function useWebChatUIContext() {
  const context = useContext(WebChatUIContext);

  if (!context) {
    throw new Error('This hook can only be used on component that is decendants of <Composer>');
  }

  return context;
}
