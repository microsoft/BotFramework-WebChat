import React, { ReactNode, RefObject, createContext, createRef, useContext, useMemo } from 'react';
import createEmotion from '@emotion/css/create-instance';
import { useRefFrom } from 'use-ref-from';
import { hooks } from 'botframework-webchat-api';
import createCSSKey from '../../Utils/createCSSKey';
import { useStylesRoot } from './useStylesRoot';

const { usePonyfill } = hooks;

const styleToEmotionObjectContext = createContext<RefObject<(...args: any[]) => string>>(createRef());

const emotionPool = {};

export const StyleToEmotionObjectProvider = ({ children, nonce }: Readonly<{ children: ReactNode; nonce: string }>) => {
  const [ponyfill] = usePonyfill();
  const stylesRoot = useStylesRoot();

  const styleToEmotionObject = useMemo(() => {
    if (!stylesRoot) {
      return;
    }
    // Cleanup cached emotion if container changed
    if (emotionPool[`id-${nonce}`] && emotionPool[`id-${nonce}`]?.sheet?.container !== stylesRoot) {
      const {
        sheet: { container, tags }
      } = emotionPool[`id-${nonce}`];
      emotionPool[`id-${nonce}`] = undefined;
      ponyfill.requestIdleCallback(() => {
        for (const child of tags) {
          container.removeChild(child);
        }
      });
    }
    // Emotion doesn't hash with nonce. We need to provide the pooling mechanism.
    // 1. If 2 instances use different nonce, they should result in different hash;
    // 2. If 2 instances are being mounted, pooling will make sure we render only 1 set of <style> tags, instead of 2.
    const emotion =
      // Prefix "id-" to prevent object injection attack.
      emotionPool[`id-${nonce}`] ||
      (emotionPool[`id-${nonce}`] = createEmotion({
        key: `webchat--css-${createCSSKey()}`,
        nonce,
        container: stylesRoot
      }));
    return style => emotion.css(style);
  }, [nonce, ponyfill, stylesRoot]);

  const styleToEmotionObjectRef = useRefFrom(styleToEmotionObject);

  return (
    <styleToEmotionObjectContext.Provider value={styleToEmotionObjectRef}>
      {styleToEmotionObject && children}
    </styleToEmotionObjectContext.Provider>
  );
};

export function useStyleToEmotionObject() {
  return useContext(styleToEmotionObjectContext).current;
}
