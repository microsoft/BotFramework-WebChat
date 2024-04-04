import useDictateAbortable from './useDictateAbortable';
import useFocus from './useFocus';
import useFocusSendBox from './useFocusSendBox';
import useObserveScrollPosition from './useObserveScrollPosition';
import useObserveTranscriptFocus from './useObserveTranscriptFocus';
import useRenderMarkdownAsHTML from './useRenderMarkdownAsHTML';
import useScrollDown from './useScrollDown';
import useScrollTo from './useScrollTo';
import useScrollToEnd from './useScrollToEnd';
import useScrollUp from './useScrollUp';
import useSendFiles from './useSendFiles';
import useSendMessage from './useSendMessage';
import useStyleSet from './useStyleSet';
import useWebSpeechPonyfill from './useWebSpeechPonyfill';

import { useSendBoxSpeechInterimsVisible } from '../BasicSendBox';
import { useTypingIndicatorVisible } from '../BasicTypingIndicator';
import { useMicrophoneButtonClick, useMicrophoneButtonDisabled } from '../SendBox/MicrophoneButton';
import { useTextBoxSubmit, useTextBoxValue } from '../SendBox/TextBox';

export {
  useDictateAbortable,
  useFocus,
  /** @deprecated Please use `useFocus('sendBox')` instead. */
  useFocusSendBox,
  useMicrophoneButtonClick,
  useMicrophoneButtonDisabled,
  useObserveScrollPosition,
  useObserveTranscriptFocus,
  useRenderMarkdownAsHTML,
  useScrollDown,
  useScrollTo,
  useScrollToEnd,
  useScrollUp,
  useSendBoxSpeechInterimsVisible,
  // We are overwriting the `useSendFiles` hook from bf-wc-api and adding thumbnailing support.
  useSendFiles,
  // We are overwriting the `useSendMessage` hook from bf-wc-api and adding thumbnailing support.
  useSendMessage,
  useStyleSet,
  useTextBoxSubmit,
  useTextBoxValue,
  useTypingIndicatorVisible,
  useWebSpeechPonyfill
};
