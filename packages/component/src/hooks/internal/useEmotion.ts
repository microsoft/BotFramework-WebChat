import createEmotion from '@emotion/css/create-instance';
import { useEffect, useMemo } from 'react';
import createCSSKey from '../../Utils/createCSSKey';

const sharedEmotionInstances = [];

export default function useEmotion(nonce?: string, container?: Node) {
  const emotion = useMemo(() => {
    const sharedEmotion = sharedEmotionInstances.find(
      ({ sheet }) => sheet.nonce === nonce && sheet.container === container
    );
    const emotion = sharedEmotion ?? createEmotion({ container, key: `webchat--css-${createCSSKey()}`, nonce });

    sharedEmotionInstances.push(emotion);

    return emotion;
  }, [container, nonce]);

  useEffect(
    () => () => {
      const index = sharedEmotionInstances.lastIndexOf(emotion);

      // Reduce ref count for the specific emotion instance.
      ~index && sharedEmotionInstances.splice(index, 1);

      if (!sharedEmotionInstances.includes(emotion) && emotion.sheet?.tags) {
        // No more hooks use this emotion object, we can clean up the container for stuff we added.
        for (const child of emotion.sheet.tags) {
          child.remove();
        }
      }
    },
    [emotion]
  );

  return emotion;
}
