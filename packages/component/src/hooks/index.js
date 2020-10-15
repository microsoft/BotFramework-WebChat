import useDictateAbortable from './useDictateAbortable';
import useFocus from './useFocus';
import useFocusSendBox from './useFocusSendBox';
import useObserveScrollPosition from './useObserveScrollPosition';
import useRenderMarkdownAsHTML from './useRenderMarkdownAsHTML';
import useScrollTo from './useScrollTo';
import useScrollToEnd from './useScrollToEnd';
import useSendFiles from './useSendFiles';
import useStyleSet from './useStyleSet';
import useWebSpeechPonyfill from './useWebSpeechPonyfill';

import { useMicrophoneButtonClick, useMicrophoneButtonDisabled } from '../SendBox/MicrophoneButton';
import { useSendBoxSpeechInterimsVisible } from '../BasicSendBox';
import { useTextBoxSubmit, useTextBoxValue } from '../SendBox/TextBox';
import { useTypingIndicatorVisible } from '../BasicTypingIndicator';

export {
  useDictateAbortable,
  useFocus,
  useFocusSendBox,
  useMicrophoneButtonClick,
  useMicrophoneButtonDisabled,
  useObserveScrollPosition,
  useRenderMarkdownAsHTML,
  useScrollTo,
  useScrollToEnd,
  useSendBoxSpeechInterimsVisible,
  // We are overwriting the `useSendFiles` hook from bf-wc-api and adding thumbnailing support.
  useSendFiles,
  useStyleSet,
  useTextBoxSubmit,
  useTextBoxValue,
  useTypingIndicatorVisible,
  useWebSpeechPonyfill
};
