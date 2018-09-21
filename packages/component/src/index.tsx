import BasicWebChat from './BasicWebChat';

import concatMiddleware from './Middleware/concatMiddleware';
import Context from './Context';
import createAdaptiveCardsAttachmentMiddleware from './Middleware/Attachment/createAdaptiveCardMiddleware';
import createCoreActivityMiddleware from './Middleware/Activity/createCoreMiddleware';
import createCoreAttachmentMiddleware from './Middleware/Attachment/createCoreMiddleware';
import createStyleSet from './Styles/createStyleSet';
import ErrorBox from './ErrorBox';

export default BasicWebChat

export {
  concatMiddleware,
  Context,
  createAdaptiveCardsAttachmentMiddleware,
  createCoreActivityMiddleware,
  createCoreAttachmentMiddleware,
  createStyleSet,
  ErrorBox
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
