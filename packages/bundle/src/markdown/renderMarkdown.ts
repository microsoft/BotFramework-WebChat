import MarkdownIt from 'markdown-it';
import sanitizeHTML from 'sanitize-html';

import { pre as respectCRLFPre } from './markdownItPlugins/respectCRLF';
import ariaLabel, { post as ariaLabelPost, pre as ariaLabelPre } from './markdownItPlugins/ariaLabel';
import betterLink from './markdownItPlugins/betterLink';
import getURLProtocol from './private/getURLProtocol';

const SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedAttributes: {
    a: ['aria-label', 'class', 'href', 'name', 'rel', 'target'],
    // TODO: Fix this.
    // button: ['class', { name: 'type', value: 'button' }, 'value'],
    button: ['aria-label', 'class', 'type', 'value'],
    img: ['alt', 'class', 'src'],
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

type LinkDescriptor = {
  /**
   * True, if the link is a pure identifier pointing to a link definition, such as [1] or [1][1].
   * In contrast, false, if it is [1](https://.../).
   */
  isPureIdentifier: boolean;
  href: string;
  title?: string;
  type: 'citation' | 'link' | 'unknown';
};

type BetterLinkDecoration = Exclude<ReturnType<Parameters<typeof betterLink>[1]>, undefined>;
type RenderInit = { externalLinkAlt?: string; linkDescriptors?: Array<LinkDescriptor> };

export default function render(
  markdown: string,
  { markdownRespectCRLF }: Readonly<{ markdownRespectCRLF: boolean }>,
  { externalLinkAlt = '', linkDescriptors = [] }: Readonly<RenderInit> = Object.freeze({})
): string {
  if (markdownRespectCRLF) {
    markdown = respectCRLFPre(markdown);
  }

  markdown = ariaLabelPre(markdown);

  const markdownIt = new MarkdownIt(MARKDOWN_IT_INIT)
    .use(ariaLabel)
    .use(betterLink, (href: string, textContent: string): BetterLinkDecoration | undefined => {
      const decoration: BetterLinkDecoration = {
        rel: 'noopener noreferrer',
        target: '_blank'
      };

      const linkClasses: Set<string> = new Set();
      const linkAriaLabelSegments: string[] = [];
      const descriptor = linkDescriptors.find(descriptor => descriptor.href === href);

      linkAriaLabelSegments.push(textContent);

      if (descriptor) {
        linkAriaLabelSegments.push(descriptor.title);

        if (descriptor.isPureIdentifier) {
          linkClasses.add('webchat__render-markdown__pure-identifier');
        }

        if (descriptor.type === 'citation') {
          decoration.asButton = true;

          linkClasses.add('webchat__render-markdown__citation');
        }
      }

      decoration.linkClassName = Array.from(linkClasses).join(' ');

      const protocol = getURLProtocol(href);

      if (protocol === 'http:' || protocol === 'https:') {
        decoration.iconAlt = externalLinkAlt;
        decoration.iconClassName = 'webchat__render-markdown__external-link-icon';

        linkAriaLabelSegments.push(externalLinkAlt);
      }

      decoration.linkAriaLabel = linkAriaLabelSegments.join(' ');

      return decoration;
    });

  let html = markdownIt.render(markdown);

  html = ariaLabelPost(html);

  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
