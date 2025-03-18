import { useTransformHTMLContent } from '../providers/HTMLContentTransformCOR/index';
import useShouldReduceMotion from '../providers/ReducedMotion/useShouldReduceMotion';
import useDictateAbortable from './useDictateAbortable';
import useFocus from './useFocus';
import useMakeThumbnail from './useMakeThumbnail';
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

import { useTypingIndicatorVisible } from '../BasicTypingIndicator';
import { useSendBoxSpeechInterimsVisible } from '../SendBox/BasicSendBox';
import { useMicrophoneButtonClick, useMicrophoneButtonDisabled } from '../SendBox/MicrophoneButton';
import { useTextBoxSubmit, useTextBoxValue } from '../SendBox/TextBox';
import { useRegisterFocusSendBox, type SendBoxFocusOptions } from './sendBoxFocus';

export { type SendBoxFocusOptions };

export {
  useDictateAbortable,
  useFocus,
  useMakeThumbnail,
  useMicrophoneButtonClick,
  useMicrophoneButtonDisabled,
  useObserveScrollPosition,
  useObserveTranscriptFocus,
  useRegisterFocusSendBox,
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
  useShouldReduceMotion,
  useStyleSet,
  useTextBoxSubmit,
  useTextBoxValue,
  useTransformHTMLContent,
  useTypingIndicatorVisible,
  useWebSpeechPonyfill
};
