import { useContext } from 'react';

import WebChatUIContext from '../../WebChatUIContext';

export default function useWebChatUIContext() {
  const context = useContext(WebChatUIContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
