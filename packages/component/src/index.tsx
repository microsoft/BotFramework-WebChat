import BasicWebChat from './BasicWebChat';

import Composer from './Composer';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import CarouselLayout from './Activity/CarouselLayout';
import ErrorBox from './ErrorBox';
import Localize, { localize } from './Localization/Localize';
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
  version
};
