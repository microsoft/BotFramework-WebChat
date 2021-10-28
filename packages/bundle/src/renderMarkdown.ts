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

export default function render(
  markdown: string,
  { markdownRespectCRLF }: { markdownRespectCRLF: boolean },
  { externalLinkAlt = '' }: { externalLinkAlt?: string } = {}
): string {
  if (markdownRespectCRLF) {
    markdown = markdown.replace(/\n\r|\r\n/gu, carriageReturn => (carriageReturn === '\n\r' ? '\r\n' : '\n\r'));
  }

  const html = new MarkdownIt({
    breaks: false,
    html: false,
    linkify: true,
    typographer: true,
    xhtmlOut: true
  })
    .use(markdownItAttrs)
    .use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
      // "+index" to prevent object injection attack.
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

  // The signature from "sanitize-html" module is not correct.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
