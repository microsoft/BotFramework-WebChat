import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';
import { fallback, integer, minValue, number, parse, pipe } from 'valibot';

import headingLevelDocumentMod from '../private/headingLevelDocumentMod';

// Other middleware could pass an invalid offset, falls back to the default offset.
const offsetSchema = fallback(pipe(number(), integer(), minValue(0)), 1);

export default function createHeadingLevelMiddleware(): HTMLContentTransformMiddleware {
  // Lowers headings after sanitization, which would remove `aria-level` and `role` from `<div>`.
  return () => next => request =>
    headingLevelDocumentMod(next(request), parse(offsetSchema, request.markdownHeadingLevelOffset));
}
