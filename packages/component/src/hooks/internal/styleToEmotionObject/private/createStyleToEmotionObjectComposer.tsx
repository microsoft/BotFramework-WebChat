import React, { type ReactNode, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';
import useEmotion from '../../useEmotion';
import { type StyleToEmotionObjectContextType } from './StyleToEmotionObjectComposer';
import { hooks } from 'botframework-webchat-api';

const { useStyleOptions } = hooks;

const createStyleToEmotionObjectComposer =
  ({ Provider }: React.Context<StyleToEmotionObjectContextType>) =>
  ({ children, nonce }: Readonly<{ children: ReactNode; nonce: string }>) => {
    const [{ stylesRoot }] = useStyleOptions();

    const emotion = useEmotion(nonce, stylesRoot);
    const styleToEmotionObject = useCallback(style => emotion.css(style), [emotion]);

    const styleToEmotionObjectRef = useRefFrom(styleToEmotionObject);

    return <Provider value={styleToEmotionObjectRef}>{styleToEmotionObject && children}</Provider>;
  };

export default createStyleToEmotionObjectComposer;
