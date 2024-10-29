import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString
} from 'botframework-webchat-component/internal';
import sanitizeHTML from 'sanitize-html';

const BASE_SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedAttributes: {
    a: ['aria-label', 'class', 'href', 'name', 'rel', 'target'],
    button: ['aria-label', 'class', 'type', 'value'],
    img: ['alt', 'aria-label', 'class', 'src', 'title'],
    pre: ['class'],
    span: ['aria-label']
  },
  allowedSchemes: ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'],
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'button',
    'caption',
    'code',
    'del',
    'div',
    'em',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'ins',
    'li',
    'nl',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strike',
    'strong',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'ul',

    // Followings are for MathML elements, from https://developer.mozilla.org/en-US/docs/Web/MathML.
    'annotation-xml',
    'annotation',
    'math',
    'merror',
    'mfrac',
    'mi',
    'mmultiscripts',
    'mn',
    'mo',
    'mover',
    'mpadded',
    'mphantom',
    'mprescripts',
    'mroot',
    'mrow',
    'ms',
    'mspace',
    'msqrt',
    'mstyle',
    'msub',
    'msubsup',
    'msup',
    'mtable',
    'mtd',
    'mtext',
    'mtr',
    'munder',
    'munderover',
    'semantics'
  ],
  // Bug of https://github.com/apostrophecms/sanitize-html/issues/633.
  // They should not remove `alt=""` even though it is empty.
  nonBooleanAttributes: []
});

export default function createSanitizeMiddleware() {
  return () => () => request => {
    const { codeBlockCopyButtonTagName, documentFragment } = request;
    const sanitizeHTMLOptions = {
      ...BASE_SANITIZE_HTML_OPTIONS,
      allowedAttributes: {
        ...BASE_SANITIZE_HTML_OPTIONS.allowedAttributes,
        [codeBlockCopyButtonTagName]: ['class', 'data-alt-copy', 'data-alt-copied', 'data-testid', 'data-value']
      },
      allowedTags: [...BASE_SANITIZE_HTML_OPTIONS.allowedTags, codeBlockCopyButtonTagName]
    };

    const htmlAfterBetterLink = serializeDocumentFragmentIntoString(documentFragment);

    const htmlAfterSanitization = sanitizeHTML(htmlAfterBetterLink, sanitizeHTMLOptions);

    return parseDocumentFragmentFromString(htmlAfterSanitization);
  };
}
