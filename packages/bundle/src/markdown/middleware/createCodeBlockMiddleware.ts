import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import codeBlockDocumentMod from '../private/codeBlockDocumentMod';

export default function createCodeBlockMiddleware(): HTMLContentTransformMiddleware {
  return () => next => request =>
    next(
      Object.freeze({
        ...request,
        allowedTags: Object.freeze(
          new Map(request.allowedTags).set(
            request.codeBlockTagName,
            Object.freeze({
              attributes: Object.freeze(new Set(['class', 'theme', 'language']))
            })
          )
        ),
        documentFragment: codeBlockDocumentMod(request.documentFragment, request.codeBlockTagName)
      })
    );
}
