import { useEffect } from 'react';

import useFocus from './hooks/useFocus';

const PostMessageListener = () => {
  const focus = useFocus();

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return;
      }

      const { type, target } = event.data ?? {};

      if (type === 'WEBCHAT_FOCUS') {
        try {
          await focus(target);
        } catch (error) {
          console.error('WebChat focus error:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [focus]);

  return null;
};

export default PostMessageListener;
