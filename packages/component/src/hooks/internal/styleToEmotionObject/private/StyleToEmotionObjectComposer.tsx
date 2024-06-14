import { createContext, createRef, type RefObject, useContext, memo } from 'react';
import createStyleToEmotionObjectComposer from './createStyleToEmotionObjectComposer';

export type StyleToEmotionObjectContextType = RefObject<(...args: any[]) => string>;

const styleToEmotionObjectContext = createContext<StyleToEmotionObjectContextType>(
  new Proxy(createRef(), {
    get() {
      throw new Error('StyleToEmotionObjectContext was used without StyleToEmotionObjectComposer');
    }
  })
);

export function useStyleToEmotionObject() {
  return useContext(styleToEmotionObjectContext).current;
}

export const StyleToEmotionObjectComposer = memo(createStyleToEmotionObjectComposer(styleToEmotionObjectContext));

StyleToEmotionObjectComposer.displayName = 'StyleToEmotionObjectComposer';
