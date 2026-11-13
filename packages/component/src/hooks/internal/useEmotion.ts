import createEmotion from '@emotion/css/create-instance';
import { useLayoutEffect, useMemo } from 'react';
import createCSSKey from '../../Utils/createCSSKey';

const sharedEmotionInstances = [];

export default function useEmotion(nonce?: string, container?: Node) {
  const emotion = useMemo(
    () =>
      sharedEmotionInstances.find(({ sheet }) => sheet.nonce === nonce && sheet.container === container) ??
      createEmotion({ container, key: `webchat--css-${createCSSKey()}`, nonce }),
    [container, nonce]
  );

  // Ref count in the effect, not in render: a hidden <Activity> (React 19.2+) and Strict Mode run the cleanup, then the
  // effect again, without rendering again.
  // Layout effect: restores the styles before paint, and before <InjectStyleElements> appends its own, as on mount.
  useLayoutEffect(() => {
    const { cache, sheet } = emotion;

    // The last release removed the style elements, but the class names are still in use: insert their rules again.
    if (!sharedEmotionInstances.includes(emotion) && sheet.tags.some(tag => !tag.isConnected)) {
      sheet.flush();

      for (const [className, styles] of Object.entries(cache.registered)) {
        cache.insert(`.${className}`, { name: className, styles }, sheet, false);
      }
    }

    sharedEmotionInstances.push(emotion);

    return () => {
      const index = sharedEmotionInstances.lastIndexOf(emotion);

      // Reduce ref count for the specific emotion instance.
      ~index && sharedEmotionInstances.splice(index, 1);

      if (!sharedEmotionInstances.includes(emotion) && emotion.sheet?.tags) {
        // No more hooks use this emotion object, we can clean up the container for stuff we added.
        for (const child of emotion.sheet.tags) {
          child.remove();
        }
      }
    };
  }, [emotion]);

  return emotion;
}
