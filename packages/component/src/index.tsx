import BasicWebChat from './BasicWebChat';

import Avatar from './Activity2/Avatar';
import Bubble from './Activity2/Bubble';
import CarouselLayout from './Activity2/CarouselLayout';
import ErrorBox from './ErrorBox';
import SendStatus from './Activity2/SendStatus';
import SpeakActivity from './Activity2/Speak';
import StackedLayout from './Activity2/StackedLayout';
import Timestamp from './Activity2/Timestamp';

import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SendTextBox from './SendBox/TextBox';
import SuggestedActions from './SendBox/SuggestedActions';
import UploadAttachmentButton from './SendBox/UploadAttachmentButton';

import concatMiddleware from './Middleware/concatMiddleware';
import Context from './Context';
import createAdaptiveCardsAttachmentMiddleware from './Middleware/Attachment/createAdaptiveCardMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';

const Components = {
  // Components for recomposing transcript
  Avatar,
  Bubble,
  CarouselLayout,
  ErrorBox,
  SendStatus,
  SpeakActivity,
  StackedLayout,
  Timestamp,

  // Components for recomposing send box
  DictationInterims,
  MicrophoneButton,
  SendButton,
  SendTextBox,
  SuggestedActions,
  UploadAttachmentButton,
};

export default BasicWebChat

export {
  Components,
  concatMiddleware,
  Context,
  createAdaptiveCardsAttachmentMiddleware,
  createCoreActivityMiddleware,
  createCoreAttachmentMiddleware,
  createStyleSet
}

try {
  const { document } = global as any;

  if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
    const meta = document.createElement('meta');
    const params = new URLSearchParams({
      version: '4.0.0'
    } as any);

    meta.setAttribute('name', 'botframework-webchat');
    meta.setAttribute('content', params.toString());

    document.head.appendChild(meta);
  }
} catch (err) {}
