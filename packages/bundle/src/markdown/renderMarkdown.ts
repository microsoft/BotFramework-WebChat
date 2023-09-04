import MarkdownIt from 'markdown-it';
import sanitizeHTML from 'sanitize-html';

import { pre as respectCRLFPre } from './markdownItPlugins/respectCRLF';
import ariaLabel, { post as ariaLabelPost, pre as ariaLabelPre } from './markdownItPlugins/ariaLabel';
import betterLink from './markdownItPlugins/betterLink';
import getURLProtocol from './private/getURLProtocol';
import linkAsButton from './markdownItPlugins/linkAsButton';

const SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedAttributes: {
    a: ['aria-label', 'class', 'href', 'name', 'rel', 'target', 'title'],
    button: ['class', { name: 'type', value: 'button' }, 'value'],
    img: ['alt', 'class', 'src']
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
    'ul'
  ]
});

const MARKDOWN_IT_INIT = Object.freeze({
  breaks: false,
  html: false,
  linkify: true,
  typographer: true,
  xhtmlOut: true
});

type BetterLinkDecoration = Exclude<ReturnType<Parameters<typeof betterLink>[1]>, undefined>;
type RenderInit = { externalLinkAlt?: string; linkDefinitionURLs?: string[] };

export default function render(
  markdown: string,
  { markdownRespectCRLF }: Readonly<{ markdownRespectCRLF: boolean }>,
  { externalLinkAlt = '', linkDefinitionURLs = [] }: Readonly<RenderInit> = Object.freeze({})
): string {
  if (markdownRespectCRLF) {
    markdown = respectCRLFPre(markdown);
  }

  markdown = ariaLabelPre(markdown);

  const markdownIt = new MarkdownIt(MARKDOWN_IT_INIT)
    .use(ariaLabel)
    .use(betterLink, (href: string): BetterLinkDecoration | undefined => {
      const decoration: BetterLinkDecoration = {
        rel: 'noopener noreferrer',
        target: '_blank'
      };

      if (linkDefinitionURLs.includes(href)) {
        decoration.linkClassName = 'webchat__markdown__link-definition webchat__markdown__link-definition--url';
      }

      const protocol = getURLProtocol(href);

      if (protocol === 'http:' || protocol === 'https:') {
        decoration.externalLinkAlt = externalLinkAlt;
        decoration.iconClassName = 'webchat__markdown__external-link-icon';
      }

      return decoration;
    })
    .use(linkAsButton, 'webchat__markdown__link-definition webchat__markdown__link-definition--citation', href =>
      linkDefinitionURLs.includes(href)
    );

  let html = markdownIt.render(markdown);

  html = ariaLabelPost(html);

  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
