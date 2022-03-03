/* eslint no-magic-numbers: ["error", { "ignore": [0, 1, 2] }] */

import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs-es5';
import sanitizeHTML from 'sanitize-html';

const SANITIZE_HTML_OPTIONS = {
  allowedAttributes: {
    a: ['aria-label', 'href', 'name', 'rel', 'target', 'title'],
    img: ['alt', 'class', 'src']
  },
  allowedSchemes: ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'],
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
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
    'ul'
  ]
};

// Put a transparent pixel instead of the "open in new window" icon, so developers can easily modify the icon in CSS.
const TRANSPARENT_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// This is used for parsing Markdown for external links.
const internalMarkdownIt = new MarkdownIt();

const MARKDOWN_ATTRS_LEFT_DELIMITER = '⟬';
// Make sure the delimiter is free from any RegExp characters, such as *, ?, etc.
// IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
// eslint-disable-next-line security/detect-non-literal-regexp, require-unicode-regexp
const MARKDOWN_ATTRS_LEFT_DELIMITER_PATTERN = new RegExp(MARKDOWN_ATTRS_LEFT_DELIMITER, 'g');

const MARKDOWN_ATTRS_RIGHT_DELIMITER = '⟭';
// Make sure the delimiter is free from any RegExp characters, such as *, ?, etc.
// IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
// eslint-disable-next-line security/detect-non-literal-regexp, require-unicode-regexp
const MARKDOWN_ATTRS_RIGHT_DELIMITER_PATTERN = new RegExp(MARKDOWN_ATTRS_RIGHT_DELIMITER, 'g');

export default function render(
  markdown: string,
  { markdownRespectCRLF }: { markdownRespectCRLF: boolean },
  { externalLinkAlt = '' }: { externalLinkAlt?: string } = {}
): string {
  if (markdownRespectCRLF) {
    markdown = markdown.replace(/\n\r|\r\n/gu, carriageReturn => (carriageReturn === '\n\r' ? '\r\n' : '\n\r'));
  }

  // Related to #3165.
  // We only support attributes "aria-label" and should leave other attributes as-is.
  // However, `markdown-it-attrs` remove unrecognized attributes, such as {hello}.
  // Before passing to `markdown-it-attrs`, we will convert known attributes from {aria-label="..."} into ⟬aria-label="..."⟭ (using white tortoise shell brackets).
  // Then, we ask `markdown-it-attrs` to only process the new brackets, so it should only try to process things that we allowlisted.
  // Lastly, we revert tortoise shell brackets back to curly brackets, for unprocessed attributes.
  markdown = markdown
    .replace(/\{\s*aria-label()\s*\}/giu, `${MARKDOWN_ATTRS_LEFT_DELIMITER}aria-label${MARKDOWN_ATTRS_RIGHT_DELIMITER}`)
    .replace(
      /\{\s*aria-label=("[^"]*"|[^\s}]*)\s*\}/giu,
      (_, valueInsideQuotes) =>
        `${MARKDOWN_ATTRS_LEFT_DELIMITER}aria-label=${valueInsideQuotes}${MARKDOWN_ATTRS_RIGHT_DELIMITER}`
    );

  let html = new MarkdownIt({
    breaks: false,
    html: false,
    linkify: true,
    typographer: true,
    xhtmlOut: true
  })
    .use(markdownItAttrs, {
      // `markdown-it-attrs` is added for accessibility and allow bot developers to specify `aria-label`.
      // We are allowlisting `aria-label` only as it is allowlisted in `sanitize-html`.
      // Other `aria-*` will be sanitized even we allowlisted here.
      allowedAttributes: ['aria-label'],
      leftDelimiter: MARKDOWN_ATTRS_LEFT_DELIMITER,
      rightDelimiter: MARKDOWN_ATTRS_RIGHT_DELIMITER
    })
    .use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
      const token = tokens[+index];

      token.attrSet('rel', 'noopener noreferrer');
      token.attrSet('target', '_blank');

      const linkOpenToken = tokens.find(({ type }) => type === 'link_open');
      const [, href] = linkOpenToken.attrs.find(([name]) => name === 'href');

      // Adds a new icon if the link is http: or https:.
      // Don't add if it's a phone number, etc.
      if (/^https?:/iu.test(href)) {
        externalLinkAlt && token.attrSet('title', externalLinkAlt);

        const iconTokens = internalMarkdownIt.parseInline(`![${externalLinkAlt}](${TRANSPARENT_GIF})`)[0].children;

        iconTokens[0].attrJoin('class', 'webchat__markdown__external-link-icon');

        tokens.splice(index + 2, 0, ...iconTokens);
      }
    })
    .render(markdown);

  // Restore attributes not processed by `markdown-it-attrs`.
  // TODO: [P2] #2511 After we fixed our polyfill story, we should use "String.prototype.replaceAll" instead of RegExp for replace all occurrences.
  html = html.replace(MARKDOWN_ATTRS_LEFT_DELIMITER_PATTERN, '{').replace(MARKDOWN_ATTRS_RIGHT_DELIMITER_PATTERN, '}');

  // The signature from "sanitize-html" module is not correct.
  // @ts-ignore
  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
