import {
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  type HighlightCodeFn
} from 'botframework-webchat-component/internal';
import katex from 'katex';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';

import createStreamingRenderer, {
  type StreamingNextOptions,
  type StreamingNextResult,
  type StreamingRenderer,
  type StreamingRenderOptions
} from './createStreamingRenderer';
import { math, mathHtml } from './mathExtension';
import betterLinkDocumentMod from './private/betterLinkDocumentMod';
import iterateLinkDefinitions from './private/iterateLinkDefinitions';
import { pre as respectCRLFPre } from './private/respectCRLF';
import { createDecorate } from './private/createDecorate';

type RenderInit = Readonly<{
  codeBlockCopyButtonTagName: string;
  externalLinkAlt: string;
  highlightCode: HighlightCodeFn;
}>;

export default function render(
  markdown: string,
  { markdownRespectCRLF, markdownRenderHTML }: Readonly<{ markdownRespectCRLF: boolean; markdownRenderHTML?: boolean }>,
  { externalLinkAlt }: RenderInit
): string {
  const linkDefinitions = Array.from(iterateLinkDefinitions(markdown));

  if (markdownRespectCRLF) {
    markdown = respectCRLFPre(markdown);
  }

  const decorate = createDecorate(linkDefinitions, externalLinkAlt);

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

  return serializeDocumentFragmentIntoString(documentFragmentAfterMarkdown).trim();
}

render.createStreamingRenderer = createStreamingRenderer;

export { type StreamingNextOptions, type StreamingNextResult, type StreamingRenderer, type StreamingRenderOptions };
