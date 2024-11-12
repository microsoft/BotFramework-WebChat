import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import highlightCodeDocumentMod from '../private/highlightCodeDocumentMod';

export default function createHighlightCodeMiddleware(): HTMLContentTransformMiddleware {
  return () => next => request =>
    next(
      Object.freeze({
        ...request,
        documentFragment: highlightCodeDocumentMod(
          request.documentFragment,
          request.highlightCode,
          request.highlightCodeTheme
        )
      })
    );
}
