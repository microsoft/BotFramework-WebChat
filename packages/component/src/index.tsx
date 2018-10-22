import BasicWebChat from './BasicWebChat';

import CarouselLayout from './Activity2/CarouselLayout';
import ErrorBox from './ErrorBox';
import SpeakActivity from './Activity2/Speak';
import StackedLayout from './Activity2/StackedLayout';

import concatMiddleware from './Middleware/concatMiddleware';
import Context from './Context';
import createAdaptiveCardsAttachmentMiddleware from './Middleware/Attachment/createAdaptiveCardMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';

const Components = {
  CarouselLayout,
  ErrorBox,
  SpeakActivity,
  StackedLayout
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
