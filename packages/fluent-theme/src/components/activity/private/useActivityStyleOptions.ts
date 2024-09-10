import { useMemo } from 'react';
import { hooks, type WebChatActivity } from 'botframework-webchat-component';
import { type StrictStyleOptions } from 'botframework-webchat-api';

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
