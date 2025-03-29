import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import registrationDocumentMod from '../private/registrationDocumentMod';

export default function createRegistrationMiddleware(): HTMLContentTransformMiddleware {
  return () => next => request =>
    next(
      Object.freeze({
        ...request,
        allowedTags: Object.freeze(
          new Map(request.allowedTags).set(
            request.registrationTagName,
            Object.freeze({
              attributes: Object.freeze(new Set(['from']))
            })
          )
        ),
        documentFragment: registrationDocumentMod(
          request.documentFragment,
          request.registrationTagName,
          'module-registration'
        )
      })
    );
}
