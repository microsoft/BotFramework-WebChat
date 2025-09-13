import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';
import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import sanitizeHTML from 'sanitize-html';

const BASE_SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedSchemes: ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'],
  // Bug of https://github.com/apostrophecms/sanitize-html/issues/633.
  // They should not remove `alt=""` even though it is empty.
  nonBooleanAttributes: []
});

export default function createSanitizeMiddleware(): HTMLContentTransformMiddleware {
  return () => () => request => {
    const { documentFragment } = request;

    const htmlAfterBetterLink = serializeDocumentFragmentIntoString(documentFragment);

    const htmlAfterSanitization = sanitizeHTML(htmlAfterBetterLink, {
      ...BASE_SANITIZE_HTML_OPTIONS,
      allowedAttributes: Object.fromEntries(
        Array.from(request.allowedTags.entries()).map(
          ([tag, { attributes }]) => [tag, Array.from(attributes)] satisfies [string, string[]]
        )
      ) satisfies Record<string, string[]>,
      allowedTags: Array.from(request.allowedTags.keys() satisfies Iterator<string>) satisfies string[]
    });

    return parseDocumentFragmentFromString(htmlAfterSanitization);
  };
}
