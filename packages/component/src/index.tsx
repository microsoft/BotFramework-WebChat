import BasicWebChat from './BasicWebChat';

import Composer from './Composer';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import CarouselLayout from './Activity/CarouselLayout';
import ErrorBox from './ErrorBox';
import SendStatus, { connectSendStatus } from './Activity/SendStatus';
import SpeakActivity, { connectSpeakActivity } from './Activity/Speak';
import StackedLayout, { connectStackedLayout } from './Activity/StackedLayout';
import Timestamp from './Activity/Timestamp';

import DictationInterims, { connectDictationInterims } from './SendBox/DictationInterims';
import MicrophoneButton, { connectMicrophoneButton } from './SendBox/MicrophoneButton';
import SendButton, { connectSendButton } from './SendBox/SendButton';
import SendTextBox, { connectSendTextBox } from './SendBox/TextBox';
import SuggestedActions, { connectSuggestedActions } from './SendBox/SuggestedActions';
import UploadButton, { connectUploadButton } from './SendBox/UploadButton';

import concatMiddleware from './Middleware/concatMiddleware';
import connectToWebChat from './connectToWebChat';
import Context from './Context';
import createAdaptiveCardsAttachmentMiddleware from './Middleware/Attachment/createAdaptiveCardMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';

declare var VERSION

const version = VERSION

const Components = {
  Composer,

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

export default BasicWebChat

export {
  Components,
  concatMiddleware,
  connectToWebChat,
  Context,
  createAdaptiveCardsAttachmentMiddleware,
  createCoreActivityMiddleware,
  createCoreAttachmentMiddleware,
  createStyleSet,
  version
}
