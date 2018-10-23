import BasicWebChat from './BasicWebChat';

import Composer from './Composer';

import Avatar from './Activity/Avatar';
import Bubble from './Activity/Bubble';
import CarouselLayout from './Activity/CarouselLayout';
import ErrorBox from './ErrorBox';
import SendStatus from './Activity/SendStatus';
import SpeakActivity from './Activity/Speak';
import StackedLayout from './Activity/StackedLayout';
import Timestamp from './Activity/Timestamp';

import DictationInterims from './SendBox/DictationInterims';
import MicrophoneButton from './SendBox/MicrophoneButton';
import SendButton from './SendBox/SendButton';
import SendTextBox from './SendBox/TextBox';
import SuggestedActions from './SendBox/SuggestedActions';
import UploadAttachmentButton from './SendBox/UploadAttachmentButton';

import concatMiddleware from './Middleware/concatMiddleware';
import connectWithContext from './connectWithContext';
import Context from './Context';
import createAdaptiveCardsAttachmentMiddleware from './Middleware/Attachment/createAdaptiveCardMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';

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
  connectWithContext,
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
