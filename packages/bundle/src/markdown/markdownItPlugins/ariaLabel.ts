import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs-es5';

const MARKDOWN_ATTRS_LEFT_DELIMITER = '⟬';
// Make sure the delimiter is free from any RegExp characters, such as *, ?, etc.
// IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
// eslint-disable-next-line require-unicode-regexp
const MARKDOWN_ATTRS_LEFT_DELIMITER_PATTERN = new RegExp(MARKDOWN_ATTRS_LEFT_DELIMITER, 'g');

const MARKDOWN_ATTRS_RIGHT_DELIMITER = '⟭';
// Make sure the delimiter is free from any RegExp characters, such as *, ?, etc.
// IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
// eslint-disable-next-line require-unicode-regexp
const MARKDOWN_ATTRS_RIGHT_DELIMITER_PATTERN = new RegExp(MARKDOWN_ATTRS_RIGHT_DELIMITER, 'g');

const ariaLabel = (markdown: typeof MarkdownIt): typeof MarkdownIt =>
  markdown.use(markdownItAttrs, {
    // `markdown-it-attrs` is added for accessibility and allow bot developers to specify `aria-label`.
    // We are allowlisting `aria-label` only as it is allowlisted in `sanitize-html`.
    // Other `aria-*` will be sanitized even we allowlisted here.
    allowedAttributes: ['aria-label'],
    leftDelimiter: MARKDOWN_ATTRS_LEFT_DELIMITER,
    rightDelimiter: MARKDOWN_ATTRS_RIGHT_DELIMITER
  });

// TODO: We should fold pre/post back into the plugin.
const pre = (markdown: string): string =>
  // Related to #3165.
  // We only support attributes "aria-label" and should leave other attributes as-is.
  // However, `markdown-it-attrs` remove unrecognized attributes, such as {hello}.
  // Before passing to `markdown-it-attrs`, we will convert known attributes from {aria-label="..."} into ⟬aria-label="..."⟭ (using white tortoise shell brackets).
  // Then, we ask `markdown-it-attrs` to only process the new brackets, so it should only try to process things that we allowlisted.
  // Lastly, we revert tortoise shell brackets back to curly brackets, for unprocessed attributes.
  markdown
    // IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
    // eslint-disable-next-line require-unicode-regexp
    .replace(/\{\s*aria-label()\s*\}/gi, `${MARKDOWN_ATTRS_LEFT_DELIMITER}aria-label${MARKDOWN_ATTRS_RIGHT_DELIMITER}`)
    .replace(
      // IE11 does not support "u" flag and Babel could not remove it. We intentionally omitting the "u" flag here.
      // eslint-disable-next-line require-unicode-regexp
      /\{\s*aria-label=("[^"]*"|[^\s}]*)\s*\}/gi,
      (_, valueInsideQuotes) =>
        `${MARKDOWN_ATTRS_LEFT_DELIMITER}aria-label=${valueInsideQuotes}${MARKDOWN_ATTRS_RIGHT_DELIMITER}`
    );

const post = (html: string): string =>
  // Restore attributes not processed by `markdown-it-attrs`.
  // TODO: [P2] #2511 After we fixed our polyfill story, we should use "String.prototype.replaceAll" instead of RegExp for replace all occurrences.
  html.replace(MARKDOWN_ATTRS_LEFT_DELIMITER_PATTERN, '{').replace(MARKDOWN_ATTRS_RIGHT_DELIMITER_PATTERN, '}');

export default ariaLabel;
export { pre, post };
