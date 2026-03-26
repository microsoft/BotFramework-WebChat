import katex from 'katex';
import { compile, parse, postprocess, preprocess } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import type { Options } from 'micromark-util-types';

import { math, mathHtml } from './mathExtension';
import betterLinkDocumentMod from './private/betterLinkDocumentMod';
import extractDefinitionsFromEvents, { type MarkdownLinkDefinition } from './private/extractDefinitionsFromEvents';
import { pre as respectCRLFPre } from './private/respectCRLF';
import { createDecorate } from './private/createDecorate';

type StreamingRenderInit = Readonly<{
  externalLinkAlt: string;
}>;

type StreamingRenderOptions = Readonly<{
  markdownRenderHTML?: boolean | undefined;
  markdownRespectCRLF: boolean;
}>;

type StreamingRenderResult = Readonly<{
  definitions: readonly MarkdownLinkDefinition[];
  fragment: DocumentFragment;
  numFrozenBlocks: number;
}>;

type StreamingRenderer = Readonly<{
  update: (fullMarkdown: string) => StreamingRenderResult;
}>;

export default function createStreamingRenderer(
  { markdownRenderHTML, markdownRespectCRLF }: StreamingRenderOptions,
  { externalLinkAlt }: StreamingRenderInit
): StreamingRenderer {
  const micromarkOptions: Options = {
    allowDangerousHtml: markdownRenderHTML ?? true,
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
  };

  let previousMarkdown = '';
  let previousNumFrozenBlocks = 0;

  return Object.freeze({
    update(fullMarkdown: string): StreamingRenderResult {
      const isAppendOnly = !!previousMarkdown && fullMarkdown.startsWith(previousMarkdown);

      // If content was edited (not a pure append), invalidate frozen blocks.
      if (!isAppendOnly) {
        previousNumFrozenBlocks = 0;
      }

      previousMarkdown = fullMarkdown;

      if (!fullMarkdown) {
        return Object.freeze({
          definitions: Object.freeze([]),
          fragment: document.createDocumentFragment(),
          numFrozenBlocks: 0
        });
      }

      let processedMarkdown = fullMarkdown;

      if (markdownRespectCRLF) {
        processedMarkdown = respectCRLFPre(processedMarkdown);
      }

      const preprocessor = preprocess();
      const parser = parse(micromarkOptions);
      const tokenizerContext = parser.document();
      const chunks = preprocessor(processedMarkdown, undefined, true);
      const events = tokenizerContext.write(chunks);
      const rawHTML = compile(micromarkOptions)(postprocess(events));
      const definitions = extractDefinitionsFromEvents(events);

      // Apply betterLinkDocumentMod to the full HTML.
      const domParser = new DOMParser();
      const parsedDocument = domParser.parseFromString(rawHTML, 'text/html');
      const fragment = parsedDocument.createDocumentFragment();

      fragment.append(...parsedDocument.body.childNodes);

      const decorate = createDecorate(definitions, externalLinkAlt);

      betterLinkDocumentMod(fragment, decorate);

      const totalBlocks = fragment.children.length;

      // All blocks except the last are frozen (they won't change with future appends).
      const numFrozenBlocks = isAppendOnly
        ? Math.max(previousNumFrozenBlocks, Math.max(0, totalBlocks - 1))
        : Math.max(0, totalBlocks - 1);

      previousNumFrozenBlocks = numFrozenBlocks;

      return Object.freeze({
        definitions,
        fragment,
        numFrozenBlocks
      });
    }
  });
}

export { type MarkdownLinkDefinition, type StreamingRenderer, type StreamingRenderOptions, type StreamingRenderResult };
