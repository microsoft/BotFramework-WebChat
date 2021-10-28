import { ScrollToEndButtonMiddleware } from 'botframework-webchat-api';

import ScrollToEndButton from './ScrollToEndButton';

export default function createScrollToEndButtonMiddleware(): ScrollToEndButtonMiddleware[] {
  return [
    () =>
      () =>
      ({ atEnd, styleOptions: { scrollToEndButtonBehavior }, unread }) =>
        !scrollToEndButtonBehavior
          ? // Don't show the button when it is set to false.
            false
          : scrollToEndButtonBehavior === 'any'
          ? // Show when the scroll view is not at the end, regardless of number of unread activities.
            !atEnd && ScrollToEndButton
          : // Show when the scroll view is not at the end of the transcript, and there are new/unread activities.
            !atEnd && unread && ScrollToEndButton
  ];
}
