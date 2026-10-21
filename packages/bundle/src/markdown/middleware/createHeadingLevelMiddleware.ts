import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';

import headingLevelDocumentMod from '../private/headingLevelDocumentMod';

// Web Chat is a component on a page which owns the level-one heading, Markdown headings start at level 2.
const HEADING_LEVEL_OFFSET = 1;

export default function createHeadingLevelMiddleware(): HTMLContentTransformMiddleware {
  // Lowers headings after sanitization, which would remove `aria-level` and `role` from `<div>`.
  return () => next => request => headingLevelDocumentMod(next(request), HEADING_LEVEL_OFFSET);
}
