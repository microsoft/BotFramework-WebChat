import { StrictStyleOptions } from 'botframework-webchat-api';

import { FORCED_COLORS_SELECTOR } from './Constants';

export default function createVideoContentStyle({ videoHeight }: StrictStyleOptions) {
  return {
    height: videoHeight,
    width: '100%',

    // Without a video track (e.g. a voice message), Chromium shows the controls of the audio player, which need the same workaround as `AudioContent`.
    [FORCED_COLORS_SELECTOR]: {
      colorScheme: 'light dark'
    }
  };
}
