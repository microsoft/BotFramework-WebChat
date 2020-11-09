import { useContext } from 'react';

import WebChatAPIContext from './WebChatAPIContext';

export default function useWebChatAPIContext() {
  const context = useContext(WebChatAPIContext);

  if (!context) {
    throw new Error('This hook can only be used on a component that is a descendant of <Composer>');
  }

  return context;
}
