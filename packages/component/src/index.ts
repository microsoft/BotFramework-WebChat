import { concatMiddleware, hooks as apiHooks, localize } from 'botframework-webchat-api';

import ReactWebChat, { ReactWebChatProps } from './ReactWebChat';

import Composer, { ComposerProps } from './Composer';

import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';

import BasicWebChat, { BasicWebChatProps } from './BasicWebChat';
import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicSendBox from './BasicSendBox';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import ErrorBox from './ErrorBox';
import SendStatus, { connectSendStatus } from './ActivityStatus/SendStatus/SendStatus';
import SpeakActivity, { connectSpeakActivity } from './Activity/Speak';
import Timestamp from './ActivityStatus/Timestamp';

import AudioContent from './Attachment/AudioContent';
import FileContent from './Attachment/FileContent';
import HTMLVideoContent from './Attachment/HTMLVideoContent';
import ImageContent from './Attachment/ImageContent';
import TextContent from './Attachment/Text/TextContent';
import VideoContent from './Attachment/VideoContent';
import VimeoContent from './Attachment/VimeoContent';
import YouTubeContent from './Attachment/YouTubeContent';

import DictationInterims, { connectDictationInterims } from './SendBox/DictationInterims';
import MicrophoneButton, { connectMicrophoneButton } from './SendBox/MicrophoneButton';
import SendButton, { connectSendButton } from './SendBox/SendButton';
import SendTextBox from './SendBox/TextBox';
import SuggestedActions, { connectSuggestedActions } from './SendBox/SuggestedActions';
import UploadButton, { connectUploadButton } from './SendBox/UploadButton';

import connectToWebChat from './connectToWebChat';
import Context from './hooks/internal/WebChatUIContext';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Attachment/createMiddleware';
import createStyleSet from './Styles/createStyleSet';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';
import withEmoji from './withEmoji/withEmoji';

import * as componentHooks from './hooks/index';

const hooks = {
  ...apiHooks,
  ...componentHooks
};

const version = process.env.npm_package_version;

const Components = {
  BasicWebChat,
  Composer,

  // Components for restructuring BasicWebChat
  AccessKeySinkSurface,
  BasicConnectivityStatus,
  BasicSendBox,
  BasicToaster,
  BasicTranscript,

  // Components for recomposing activities and attachments
  AudioContent,
  FileContent,
  HTMLVideoContent,
  ImageContent,
  TextContent,
  VideoContent,
  VimeoContent,
  YouTubeContent,

  // Components for recomposing transcript
  Avatar,
  Bubble,
  ErrorBox,
  SendStatus,
  SpeakActivity,
  Timestamp,

  connectSendStatus,
  connectSpeakActivity,

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
  connectSuggestedActions,
  connectUploadButton
};

export default ReactWebChat;

export {
  Components,
  concatMiddleware,
  connectToWebChat,
  Context,
  createCoreActivityMiddleware,
  createCoreActivityStatusMiddleware,
  createCoreAttachmentMiddleware,
  createStyleSet,
  getTabIndex,
  hooks,
  localize,
  version,
  withEmoji
};

export type { BasicWebChatProps, ComposerProps, ReactWebChatProps };
