import { onErrorResumeNext } from 'botframework-webchat-core';
import MarkdownIt from 'markdown-it';
import sanitizeHTML from 'sanitize-html';

import { pre as respectCRLFPre } from './markdownItPlugins/respectCRLF';
import ariaLabel, { post as ariaLabelPost, pre as ariaLabelPre } from './markdownItPlugins/ariaLabel';
import betterLink from './markdownItPlugins/betterLink';
import iterateLinkDefinitions from './private/iterateLinkDefinitions';

const SANITIZE_HTML_OPTIONS = Object.freeze({
  allowedAttributes: {
    a: ['aria-label', 'class', 'href', 'name', 'rel', 'target'],
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
  ],
  // Bug of https://github.com/apostrophecms/sanitize-html/issues/633.
  // They should not remove `alt=""` even though it is empty.
  nonBooleanAttributes: []
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
      const protocol = onErrorResumeNext(() => new URL(href).protocol);

      if (linkDefinition) {
        ariaLabelSegments.push(
          linkDefinition.title || onErrorResumeNext(() => new URL(linkDefinition.url).host) || linkDefinition.url
        );

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

      // The first segment is textContent. Putting textContent is aria-label is useless.
      if (ariaLabelSegments.length > 1) {
        // If "aria-label" is already applied, do not overwrite it.
        decoration.ariaLabel = (value: string) => value || ariaLabelSegments.join(' ');
      }

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

      decoration.title = false;

      return decoration;
    });

  let html = markdownIt.render(markdown);

  html = ariaLabelPost(html);

  return sanitizeHTML(html, SANITIZE_HTML_OPTIONS);
}
