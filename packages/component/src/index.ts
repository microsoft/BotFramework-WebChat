import { hooks as apiHooks, concatMiddleware, localize } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';

import ReactWebChat, { ReactWebChatProps } from './ReactWebChat';

import Composer, { ComposerProps } from './Composer';

import AccessKeySinkSurface from './Utils/AccessKeySink/Surface';

import BasicConnectivityStatus from './BasicConnectivityStatus';
import BasicToaster from './BasicToaster';
import BasicTranscript from './BasicTranscript';
import BasicWebChat, { BasicWebChatProps } from './BasicWebChat';
import BasicSendBox from './SendBox/BasicSendBox';
import BasicSendBoxToolbar from './SendBoxToolbar/BasicSendBoxToolbar';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import SpeakActivity from './Activity/Speak';
import SendStatus from './ActivityStatus/SendStatus/SendStatus';
import Timestamp from './ActivityStatus/Timestamp';
import ErrorBox from './ErrorBox';

import LocalizedString from './Utils/LocalizedString';

import AudioContent from './Attachment/AudioContent';
import FileContent from './Attachment/FileContent';
import HTMLVideoContent from './Attachment/HTMLVideoContent';
import ImageContent from './Attachment/ImageContent';
import TextContent from './Attachment/Text/TextContent';
import VideoContent from './Attachment/VideoContent';
import VimeoContent from './Attachment/VimeoContent';
import YouTubeContent from './Attachment/YouTubeContent';

import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SuggestedActions from './SendBox/SuggestedActions';
import SendTextBox from './SendBox/TextBox';
import UploadButton from './SendBoxToolbar/UploadButton';

import createCoreAttachmentMiddleware from './Attachment/createMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreActivityStatusMiddleware from './Middleware/ActivityStatus/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';
import getTabIndex from './Utils/TypeFocusSink/getTabIndex';
import Context from './hooks/internal/WebChatUIContext';
import ThemeProvider from './providers/Theme/ThemeProvider';
import withEmoji from './withEmoji/withEmoji';

import * as componentHooks from './hooks/index';

const hooks = {
  ...apiHooks,
  ...componentHooks
};

const buildTool = process.env.build_tool;
const moduleFormat = process.env.module_format;
const version = process.env.npm_package_version;

const buildInfo = { buildTool, moduleFormat, version };

const Components = {
  BasicWebChat,
  Composer,
  ThemeProvider,

  // Components for restructuring BasicWebChat
  AccessKeySinkSurface,
  BasicConnectivityStatus,
  BasicSendBox,
  BasicSendBoxToolbar,
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

  // Components for recomposing send box
  DictationInterims,
  MicrophoneButton,
  SendButton,
  SendTextBox,
  SuggestedActions,
  UploadButton,

  // Components for localization
  LocalizedString
};

export default ReactWebChat;

export {
  Components,
  Context,
  buildInfo,
  concatMiddleware,
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

export type { BasicWebChatProps, ComposerProps, ReactWebChatProps, WebChatActivity };
