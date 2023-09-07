import MarkdownIt from 'markdown-it';
import sanitizeHTML from 'sanitize-html';

import { pre as respectCRLFPre } from './markdownItPlugins/respectCRLF';
import ariaLabel, { post as ariaLabelPost, pre as ariaLabelPre } from './markdownItPlugins/ariaLabel';
import betterLink from './markdownItPlugins/betterLink';
import getURLProtocol from './private/getURLProtocol';
import iterateLinkDefinitions from './private/iterateLinkDefinitions';

const SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedAttributes: {
    a: ['aria-label', 'class', 'href', 'name', 'rel', 'target'],
    // TODO: Fix this.
    // button: ['class', { name: 'type', value: 'button' }, 'value'],
    button: ['aria-label', 'class', 'type', 'value'],
    img: ['alt', 'class', 'src', 'title'],
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

type BetterLinkDecoration = Exclude<ReturnType<Parameters<typeof betterLink>[1]>, undefined>;
type RenderInit = { externalLinkAlt?: string };

export default function render(
  markdown: string,
  { markdownRespectCRLF }: Readonly<{ markdownRespectCRLF: boolean }>,
  { externalLinkAlt = '' }: Readonly<RenderInit> = Object.freeze({})
): string {
  const linkDefinitions = Array.from(iterateLinkDefinitions(markdown));

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

      const ariaLabelSegments: string[] = [textContent];
      const classes: Set<string> = new Set();
      const linkDefinition = linkDefinitions.find(({ url }) => url === href);
      const protocol = getURLProtocol(href);

      if (linkDefinition) {
        ariaLabelSegments.push(linkDefinition.title);

        linkDefinition.identifier === textContent && classes.add('webchat__render-markdown__pure-identifier');
      }

      if (protocol === 'cite:') {
        decoration.asButton = true;

        classes.add('webchat__render-markdown__citation');
      } else if (protocol === 'http:' || protocol === 'https:') {
        decoration.iconAlt = externalLinkAlt;
        decoration.iconClassName = 'webchat__render-markdown__external-link-icon';

        ariaLabelSegments.push(externalLinkAlt);
      }

      decoration.ariaLabel = ariaLabelSegments.join(' ');
      decoration.className = Array.from(classes).join(' ');

      // By default, Markdown-It will set "title" to the link title in link definition.

      // However, "title" may be narrated by screen reader:
      // - Edge
      //   - <a> will narrate "aria-label" but not "title"
      //   - <button> will narrate both "aria-label" and "title"
      // - NVDA
      //   - <a> will narrate both "aria-label" and "title"
      //   - <button> will narrate both "aria-label" and "title"

      // Title makes it very difficult to control narrations by the screen reader. Thus, we are disabling it in favor of "aria-label".
      // This will not affect our accessibility compliance but UX. We could use a non-native tooltip or other forms of visual hint.

      decoration.title = '';

      return decoration;
    });

  let html = markdownIt.render(markdown);

  html = ariaLabelPost(html);

  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
