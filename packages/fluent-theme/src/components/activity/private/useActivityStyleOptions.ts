import { type StrictStyleOptions, hooks } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat/internal';
import { useMemo } from 'react';

const { useStyleOptions } = hooks;

export default function useActivityStyleOptions(activity?: WebChatActivity | undefined) {
  const [styleOptions] = useStyleOptions();
  return useMemo<readonly [Readonly<StrictStyleOptions>]>(
    () =>
      Object.freeze([
        {
          ...styleOptions,
          ...activity?.channelData?.webChat?.styleOptions
        }
      ]),
    [activity?.channelData?.webChat?.styleOptions, styleOptions]
  );
}
