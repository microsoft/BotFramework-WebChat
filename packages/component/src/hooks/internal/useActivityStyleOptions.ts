import { hooks, type StrictStyleOptions } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';
import { useMemo } from 'react';

const { useStyleOptions } = hooks;

/**
 * Returns the style options of an activity: the per-activity `channelData.webChat.styleOptions` over `styleOptions`.
 */
export default function useActivityStyleOptions(
  activity?: WebChatActivity | undefined
): readonly [Readonly<StrictStyleOptions>] {
  const [styleOptions] = useStyleOptions();

  return useMemo<readonly [Readonly<StrictStyleOptions>]>(
    () =>
      Object.freeze([
        Object.freeze({
          ...styleOptions,
          ...activity?.channelData?.webChat?.styleOptions
        })
      ]),
    [activity?.channelData?.webChat?.styleOptions, styleOptions]
  );
}
