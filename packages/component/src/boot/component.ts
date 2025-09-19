import Composer, { type ComposerProps } from '../Composer';

// Components for restructuring BasicWebChat
import BasicConnectivityStatus from '../BasicConnectivityStatus';
import BasicToaster from '../BasicToaster';
import BasicTranscript from '../BasicTranscript';
import BasicWebChat, { type BasicWebChatProps } from '../BasicWebChat';
import BasicSendBox from '../SendBox/BasicSendBox';
import BasicSendBoxToolbar from '../SendBoxToolbar/BasicSendBoxToolbar';
import AccessKeySinkSurface from '../Utils/AccessKeySink/Surface';

// Components for recomposing activities and attachments
import AudioContent from '../Attachment/AudioContent';
import FileContent from '../Attachment/FileContent';
import HTMLVideoContent from '../Attachment/HTMLVideoContent';
import ImageContent from '../Attachment/ImageContent';
import TextContent from '../Attachment/Text/TextContent';
import VideoContent from '../Attachment/VideoContent';
import VimeoContent from '../Attachment/VimeoContent';
import YouTubeContent from '../Attachment/YouTubeContent';

// Components for recomposing transcript
import Avatar from '../Activity/Avatar';
import Bubble from '../Activity/Bubble';
import SpeakActivity from '../Activity/Speak';
import SendStatus from '../ActivityStatus/SendStatus/SendStatus';
import Timestamp from '../ActivityStatus/Timestamp';
import ErrorBox from '../ErrorBox';

// Components for recomposing send box
import { AttachmentBar } from '../SendBox/AttachmentBar/index';
import DictationInterims from '../SendBox/DictationInterims';
import MicrophoneButton from '../SendBox/MicrophoneButton';
import SendButton from '../SendBox/SendButton';
import SuggestedActions from '../SendBox/SuggestedActions';
import SendTextBox from '../SendBox/TextBox';
import UploadButton from '../SendBoxToolbar/UploadButton';
import { TextArea } from '../TextArea/index';

// Components for localization
import LocalizedString from '../Utils/LocalizedString';

// Components for theme packs
import ThemeProvider from '../providers/Theme/ThemeProvider';

export {
  AccessKeySinkSurface,
  AttachmentBar,
  AudioContent,
  Avatar,
  BasicConnectivityStatus,
  BasicSendBox,
  BasicSendBoxToolbar,
  BasicToaster,
  BasicTranscript,
  BasicWebChat,
  Bubble,
  Composer,
  DictationInterims,
  ErrorBox,
  FileContent,
  HTMLVideoContent,
  ImageContent,
  LocalizedString,
  MicrophoneButton,
  SendButton,
  SendStatus,
  SendTextBox,
  SpeakActivity,
  SuggestedActions,
  TextArea,
  TextContent,
  ThemeProvider,
  Timestamp,
  UploadButton,
  VideoContent,
  VimeoContent,
  YouTubeContent
};

export type { BasicWebChatProps, ComposerProps };
