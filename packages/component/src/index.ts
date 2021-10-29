import { concatMiddleware, hooks as apiHooks, Localize, localize } from 'botframework-webchat-api';

import ReactWebChat, { ReactWebChatProps } from './ReactWebChat';

import Composer, { ComposerProps } from './Composer';

import BasicWebChat, { BasicWebChatProps } from './BasicWebChat';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import ErrorBox from './ErrorBox';
import SendStatus, { connectSendStatus } from './Middleware/ActivityStatus/SendStatus/SendStatus';
import SpeakActivity, { connectSpeakActivity } from './Activity/Speak';
import Timestamp from './Middleware/ActivityStatus/Timestamp';

import AudioContent from './Attachment/AudioContent';
import FileContent from './Attachment/FileContent';
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

import connectToWebChat from './connectToWebChat';
import Context from './hooks/internal/WebChatUIContext';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';

import * as componentHooks from './hooks/index';

const hooks = {
  ...apiHooks,
  ...componentHooks
};

const version = process.env.npm_package_version;

const Components = {
  BasicWebChat,
  Composer,
  Localize,

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
  connectSendTextBox,
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
  version
};

export type { BasicWebChatProps, ComposerProps, ReactWebChatProps };
