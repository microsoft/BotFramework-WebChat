import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import codeBlockCopyButtonDocumentMod from '../private/codeBlockCopyButtonDocumentMod';

export default function createCodeBlockCopyButtonMiddleware(): HTMLContentTransformMiddleware {
  return () => next => request =>
    next(
      Object.freeze({
        ...request,
        allowedTags: Object.freeze(
          new Map(request.allowedTags).set(
            request.codeBlockCopyButtonTagName,
            Object.freeze({
              attributes: Object.freeze(
                new Set(['class', 'data-alt-copy', 'data-alt-copied', 'data-testid', 'data-value'])
              )
            })
          )
        ),
        documentFragment: codeBlockCopyButtonDocumentMod(request.documentFragment, {
          codeBlockCopyButtonAltCopied: request.codeBlockCopyButtonAltCopied,
          codeBlockCopyButtonAltCopy: request.codeBlockCopyButtonAltCopy,
          codeBlockCopyButtonClassName: request.codeBlockCopyButtonClassName,
          codeBlockCopyButtonTagName: request.codeBlockCopyButtonTagName
        })
      })
    );
}
