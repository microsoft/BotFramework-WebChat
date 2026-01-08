import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  type HighlightCodeFn
} from 'botframework-webchat-component/internal';
import { onErrorResumeNext } from 'botframework-webchat-core';
import katex from 'katex';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { sanitizeUri } from 'micromark-util-sanitize-uri';

import { math, mathHtml } from './mathExtension';
import betterLinkDocumentMod, { BetterLinkDocumentModDecoration } from './private/betterLinkDocumentMod';
import iterateLinkDefinitions from './private/iterateLinkDefinitions';
import { pre as respectCRLFPre } from './private/respectCRLF';

type RenderInit = Readonly<{
  codeBlockCopyButtonTagName: string;
  externalLinkAlt: string;
  highlightCode: HighlightCodeFn;
}>;

const ALLOWED_SCHEMES = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];

export default function render(
  markdown: string,
  { markdownRespectCRLF, markdownRenderHTML }: Readonly<{ markdownRespectCRLF: boolean; markdownRenderHTML?: boolean }>,
  { externalLinkAlt }: RenderInit
): string {
  const linkDefinitions = Array.from(iterateLinkDefinitions(markdown)).map(definition =>
    Object.freeze({
      ...definition,
      markupUrl: sanitizeUri(definition.url),
      parsedUrl: onErrorResumeNext(() => new URL(definition.url))
    })
  );

  if (markdownRespectCRLF) {
    markdown = respectCRLFPre(markdown);
  }

  const decorate = (href: string, textContent: string): BetterLinkDocumentModDecoration => {
    const decoration: BetterLinkDocumentModDecoration = {
      rel: 'noopener noreferrer',
      target: '_blank',
      wrapZeroWidthSpace: true
    };

    const ariaLabelSegments: string[] = [textContent];
    const classes: Set<string> = new Set();
    const linkDefinition = linkDefinitions.find(({ url, markupUrl }) => url === href || (href && markupUrl === href));
    const protocol = onErrorResumeNext(() => new URL(href).protocol);

    if (linkDefinition) {
      ariaLabelSegments.push(linkDefinition.title || linkDefinition?.parsedUrl?.host || linkDefinition.url);

      // linkDefinition.identifier is uppercase, while linkDefinition.label is as-is.
      linkDefinition.label === textContent && classes.add('render-markdown__pure-identifier');
    }

    // Let javascript: fell through. Our sanitizer will catch and remove it from <a href>.
    // Otherwise, it will be turn into <button value="javascript:"> and won't able to catch it.

    // False-positive.
    // eslint-disable-next-line no-script-url
    if (protocol !== 'javascript:') {
      // For links that would be sanitized out, let's turn them into a button so we could handle them later.
      if (!ALLOWED_SCHEMES.map(scheme => `${scheme}:`).includes(protocol)) {
        decoration.asButton = true;

        classes.add('render-markdown__citation');
      } else if (protocol === 'http:' || protocol === 'https:') {
        decoration.iconAlt = externalLinkAlt;
        decoration.iconClassName = 'render-markdown__external-link-icon';

        ariaLabelSegments.push(externalLinkAlt);
      }
    }

    // The first segment is textContent. Putting textContent is aria-label is useless.
    if (ariaLabelSegments.length > 1) {
      // If "aria-label" is already applied, do not overwrite it.
      decoration.ariaLabel = (value: string) => value || ariaLabelSegments.join(' ');
    }

    decoration.className = Array.from(classes).join(' ');

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
  };

  const htmlAfterMarkdown = micromark(markdown, {
    allowDangerousHtml: markdownRenderHTML ?? true,
    // We need to handle links like cite:1 or other URL handlers.
    // And we will remove dangerous protocol during sanitization.
    allowDangerousProtocol: true,
    extensions: [gfm(), math()],
    htmlExtensions: [
      gfmHtml(),
      mathHtml({
        renderMath: (content, isDisplay) =>
          katex.renderToString(content, {
            displayMode: isDisplay,
            output: 'mathml'
          })
      })
    ]
  });

  // TODO: [P1] In some future, we should apply "better link" and "sanitization" outside of the Markdown engine.
  //       Particularly, apply them at `useRenderMarkdownAsHTML` instead of inside the default `renderMarkdown`.
  //       If web devs want to bring their own Markdown engine, they don't need to rebuild "better link" and sanitization themselves.

  const documentFragmentAfterMarkdown = parseDocumentFragmentFromString(htmlAfterMarkdown);

  betterLinkDocumentMod(documentFragmentAfterMarkdown, decorate);

  return serializeDocumentFragmentIntoString(documentFragmentAfterMarkdown);
}
