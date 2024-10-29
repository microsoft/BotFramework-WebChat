import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import codeBlockCopyButtonDocumentMod from '../private/codeBlockCopyButtonDocumentMod';

export default function createCodeBlockCopyButtonMiddleware(): HTMLContentTransformMiddleware {
  return () => next => request =>
    next(
      Object.freeze({
        ...request,
        documentFragment: codeBlockCopyButtonDocumentMod(request.documentFragment, {
          codeBlockCopyButtonAltCopied: request.codeBlockCopyButtonAltCopied,
          codeBlockCopyButtonAltCopy: request.codeBlockCopyButtonAltCopy,
          codeBlockCopyButtonClassName: request.codeBlockCopyButtonClassName,
          codeBlockCopyButtonTagName: request.codeBlockCopyButtonTagName
        })
      })
    );
}
