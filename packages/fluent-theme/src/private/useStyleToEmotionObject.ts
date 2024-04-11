import createEmotion, { type Emotion } from '@emotion/css/create-instance';
// TODO: [P0] Use `math-random`. Today, it requires "crypto" today, maybe missing "conditions" or what.
// import random from 'math-random';
import { useMemo } from 'react';

const { random } = Math;

const emotionPool: Record<string, Emotion> = {};
const nonce = '';

/* eslint no-magic-numbers: ["error", { "ignore": [0, 2, 5, 26, 65] }] */

function createCSSKey() {
  return random()
    .toString(26)
    .substr(2, 5)
    .replace(/\d/gu, (value: string) => String.fromCharCode(value.charCodeAt(0) + 65));
}

export default function useStyleToEmotionObject() {
  return useMemo(() => {
    // Emotion doesn't hash with nonce. We need to provide the pooling mechanism.
    // 1. If 2 instances use different nonce, they should result in different hash;
    // 2. If 2 instances are being mounted, pooling will make sure we render only 1 set of <style> tags, instead of 2.
    const emotion =
      // Prefix "id-" to prevent object injection attack.
      emotionPool[`id-${nonce}`] ||
      (emotionPool[`id-${nonce}`] = createEmotion({ key: `webchat--css-${createCSSKey()}`, nonce }));

    return (style: TemplateStringsArray) => emotion.css(style);
  }, []);
}
