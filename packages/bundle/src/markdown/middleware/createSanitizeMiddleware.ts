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

    // preserve top level comment nodes
    for (const node of documentFragment.querySelectorAll('webchat-preserve-comment')) {
      node.remove();
    }
    for (const node of documentFragment.childNodes) {
      if (node.nodeType === Node.COMMENT_NODE) {
        const comment = document.createElement('webchat-preserve-comment');
        comment.textContent = node.nodeValue;
        node.replaceWith(comment);
      }
    }

    const htmlAfterBetterLink = serializeDocumentFragmentIntoString(documentFragment);

    const htmlAfterSanitization = sanitizeHTML(htmlAfterBetterLink, {
      ...BASE_SANITIZE_HTML_OPTIONS,
      allowedAttributes: Object.fromEntries(
        Array.from(request.allowedTags.entries()).map(
          ([tag, { attributes }]) => [tag, Array.from(attributes)] satisfies [string, string[]]
        )
      ) satisfies Record<string, string[]>,
      allowedTags: ['webchat-preserve-comment'].concat(
        Array.from(request.allowedTags.keys() satisfies Iterator<string>) satisfies string[]
      )
    });

    const parsed = parseDocumentFragmentFromString(htmlAfterSanitization);

    for (const node of parsed.querySelectorAll('webchat-preserve-comment')) {
      const comment = document.createComment(node.textContent || '');
      node.replaceWith(comment);
    }

    return parsed;
  };
}
