/* eslint no-magic-numbers: ["error", { "ignore": [1] }] */

import iterator from 'markdown-it-for-inline';
import MarkdownIt from 'markdown-it';
import markdownItAttrs from 'markdown-it-attrs-es5';
import sanitizeHTML from 'sanitize-html';
import { hooks } from 'botframework-webchat-component';

const { useLocalizer } = hooks;

const SANITIZE_HTML_OPTIONS = {
  allowedAttributes: {
    a: ['aria-label', 'href', 'name', 'target', 'title', 'role', 'class'],
    img: ['alt', 'src']
  },
  allowedSchemes: ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'],
  allowedTags: [
    'a',
    'b',
    'blockquote',
    'br',
    'caption',
    'code',
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
    'li',
    'nl',
    'ol',
    'p',
    'pre',
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

function isExternal(url) {
  return url.host !== window.location.host;
}

const customMarkdownIt = new MarkdownIt({
  breaks: false,
  html: false,
  linkify: true,
  typographer: true,
  xhtmlOut: true
})
  .use(markdownItAttrs)
  .use(iterator, 'url_new_win', 'link_open', (tokens, index) => {
    // TODO: [P4] This is copied from v3 and looks clunky
    //       We should refactor this code
    const targetAttrIndex = tokens[index].attrIndex('target');

    if (~targetAttrIndex) {
      tokens[index].attrs[targetAttrIndex][1] = '_blank';
    } else {
      tokens[index].attrPush(['target', '_blank']);
      tokens[index].attrPush(['class', 'externalLink']);
    }

    const localize = useLocalizer();
    const internalLinkOpensInNewWindowString = localize('TEXT_LINK_OPENS_NEW_WINDOW_INTERNAL');
    const externalLinkOpensInNewWindowString = localize('TEXT_LINK_OPENS_NEW_WINDOW_EXTERNAL');

    const urlAttrIndex = tokens[index].attrIndex('href');
    if (isExternal(urlAttrIndex)) {
      tokens[index].attrPush(['title', externalLinkOpensInNewWindowString]);
    } else {
      tokens[index].attrPush(['title', internalLinkOpensInNewWindowString]);
    }

    const relAttrIndex = tokens[index].attrIndex('rel');

    if (~relAttrIndex) {
      tokens[index].attrs[relAttrIndex][1] = 'noopener noreferrer';
    } else {
      tokens[index].attrPush(['rel', 'noopener noreferrer']);
    }
  });

export default function render(markdown, { markdownRespectCRLF }) {
  if (markdownRespectCRLF) {
    markdown = markdown.replace(/\n\r|\r\n/gu, carriageReturn => (carriageReturn === '\n\r' ? '\r\n' : '\n\r'));
  }
  const html = customMarkdownIt.render(markdown);

  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
