import BasicWebChat from './BasicWebChat';

import Composer from './Composer';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import CarouselLayout from './Activity/CarouselLayout';
import ErrorBox from './ErrorBox';
import Localize, { localize, useLocalize } from './Localization/Localize';
import SendStatus, { connectSendStatus } from './Activity/SendStatus';
import SpeakActivity, { connectSpeakActivity } from './Activity/Speak';
import StackedLayout, { connectStackedLayout } from './Activity/StackedLayout';
import Timestamp from './Activity/Timestamp';

import AudioContent from './Attachment/AudioContent';
import HTMLVideoContent from './Attachment/HTMLVideoContent';
import ImageContent from './Attachment/ImageContent';
import TextContent from './Attachment/TextContent';
import VideoContent from './Attachment/VideoContent';
import VimeoContent from './Attachment/VimeoContent';
import YouTubeContent from './Attachment/YouTubeContent';

import DictationInterims, { connectDictationInterims } from './SendBox/DictationInterims';
import MicrophoneButton, { connectMicrophoneButton } from './SendBox/MicrophoneButton';
import SendButton, { connectSendButton } from './SendBox/SendButton';
import SendTextBox, { connectSendTextBox } from './SendBox/TextBox';
import SuggestedActions, { connectSuggestedActions } from './SendBox/SuggestedActions';
import UploadButton, { connectUploadButton } from './SendBox/UploadButton';

import concatMiddleware from './Middleware/concatMiddleware';
import connectToWebChat from './connectToWebChat';
import Context from './Context';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';
import defaultStyleOptions from './Styles/defaultStyleOptions';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';

import useActivities from './hooks/useActivities';
import useActivityRenderer from './hooks/useActivityRenderer';
import useAttachmentRenderer from './hooks/useAttachmentRenderer';
import useClearSuggestedActions from './hooks/useClearSuggestedActions';
import useClockSkewAdjustment from './hooks/useClockSkewAdjustment';
import useConnectivityStatus from './hooks/useConnectivityStatus';
import useDictateInterims from './hooks/useDictateInterims';
import useDictateState from './hooks/useDictateState';
import useDirectLine from './hooks/useDirectLine';
import useDisabled from './hooks/useDisabled';
import useFocusSendBox from './hooks/useFocusSendBox';
import useGrammars from './hooks/useGrammars';
import useGroupTimestamp from './hooks/useGroupTimestamp';
import useLanguage from './hooks/useLanguage';
import useLastTypingAt from './hooks/useLastTypingAt';
import useMarkActivity from './hooks/useMarkActivity';
import useOnCardAction from './hooks/useOnCardAction';
import usePostActivity from './hooks/usePostActivity';
import useReadyState from './hooks/useReadyState';
import useReferenceGrammarID from './hooks/useReferenceGrammarID';
import useRenderMarkdown from './hooks/useRenderMarkdown';
import useScrollToEnd from './hooks/useScrollToEnd';
import useSelector from './hooks/useSelector';
import useSelectVoice from './hooks/useSelectVoice';
import useSendBoxRef from './hooks/useSendBoxRef';
import useSendBoxValue from './hooks/useSendBoxValue';
import useSendEvent from './hooks/useSendEvent';
import useSendFiles from './hooks/useSendFiles';
import useSendMessage from './hooks/useSendMessage';
import useSendMessageBack from './hooks/useSendMessageBack';
import useSendPostback from './hooks/useSendPostback';
import useSendTimeout from './hooks/useSendTimeout';
import useSendTypingIndicator from './hooks/useSendTypingIndicator';
import useSetDictateInterims from './hooks/useSetDictateInterims';
import useSetDictateState from './hooks/useSetDictateState';
import useSetSendBox from './hooks/useSetSendBox';
import useSetSendTimeout from './hooks/useSetSendTimeout';
import useShouldSpeakIncomingActivity from './hooks/useShouldSpeakIncomingActivity';
import useStartDictate from './hooks/useStartDictate';
import useStartSpeakingActivity from './hooks/useStartSpeakingActivity';
import useStopDictate from './hooks/useStopDictate';
import useStopSpeakingActivity from './hooks/useStopSpeakingActivity';
import useStyleOptions from './hooks/useStyleOptions';
import useStyleSet from './hooks/useStyleSet';
import useSubmitSendBox from './hooks/useSubmitSendBox';
import useSuggestedActions from './hooks/useSuggestedActions';
import useUserID from './hooks/useUserID';
import useUsername from './hooks/useUsername';
import useWebSpeechPonyfill from './hooks/useWebSpeechPonyfill';

const version = process.env.NPM_PACKAGE_VERSION;

const Components = {
  Composer,
  Localize,

  // Components for recomposing activities and attachments
  AudioContent,
  HTMLVideoContent,
  ImageContent,
  TextContent,
  VideoContent,
  VimeoContent,
  YouTubeContent,

  // Components for recomposing transcript
  Avatar,
  Bubble,
  CarouselLayout,
  ErrorBox,
  SendStatus,
  SpeakActivity,
  StackedLayout,
  Timestamp,

  connectSendStatus,
  connectSpeakActivity,
  connectStackedLayout,

  // Components for recomposing send box
  DictationInterims,
  MicrophoneButton,
  SendButton,
  SendTextBox,
  SuggestedActions,
  UploadButton,

  connectDictationInterims,
  connectMicrophoneButton,
  connectSendButton,
  connectSendTextBox,
  connectSuggestedActions,
  connectUploadButton
};

export default BasicWebChat;

export {
  Components,
  concatMiddleware,
  connectToWebChat,
  Context,
  createCoreActivityMiddleware,
  createCoreAttachmentMiddleware,
  createStyleSet,
  defaultStyleOptions,
  getTabIndex,
  localize,
  useActivities,
  useActivityRenderer,
  useAttachmentRenderer,
  useClearSuggestedActions,
  useClockSkewAdjustment,
  useConnectivityStatus,
  useDictateInterims,
  useDictateState,
  useDirectLine,
  useDisabled,
  useFocusSendBox,
  useGrammars,
  useGroupTimestamp,
  useLanguage,
  useLastTypingAt,
  useLocalize,
  useMarkActivity,
  useOnCardAction,
  usePostActivity,
  useReadyState,
  useReferenceGrammarID,
  useRenderMarkdown,
  useScrollToEnd,
  useSelector,
  useSelectVoice,
  useSendBoxRef,
  useSendBoxValue,
  useSendEvent,
  useSendFiles,
  useSendMessage,
  useSendMessageBack,
  useSendPostback,
  useSendTimeout,
  useSendTypingIndicator,
  useSetDictateInterims,
  useSetDictateState,
  useSetSendBox,
  useSetSendTimeout,
  useShouldSpeakIncomingActivity,
  useStartDictate,
  useStartSpeakingActivity,
  useStopDictate,
  useStopSpeakingActivity,
  useStyleOptions,
  useStyleSet,
  useSubmitSendBox,
  useSuggestedActions,
  useUserID,
  useUsername,
  useWebSpeechPonyfill,
  version
};
