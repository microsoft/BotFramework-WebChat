/* eslint-disable no-magic-numbers */
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
  activeBlockMarker: Comment | null;
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
  let previousHTML = '';
  const domParser = new DOMParser();

  const id = Math.random().toString(36).slice(2);

  let definitions: readonly MarkdownLinkDefinition[] = Object.freeze([]);

  return Object.freeze({
    update(fullMarkdown: string, finalize = false): StreamingRenderResult {
      const isAppendOnly = !!previousMarkdown && fullMarkdown.startsWith(previousMarkdown) && !finalize;

      if (!isAppendOnly) {
        previousHTML = '';
      }

      previousMarkdown = fullMarkdown;

      if (!fullMarkdown) {
        previousMarkdown = '';
        previousHTML = '';

        return Object.freeze({
          definitions: Object.freeze([]),
          fragment: document.createDocumentFragment(),
          activeBlockMarker: null
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
      const isAppendHtml = (!!previousHTML && rawHTML.startsWith(previousHTML)) || (true && !finalize);
      previousHTML = rawHTML;

      // Apply betterLinkDocumentMod to the full HTML.
      const parsedDocument = domParser.parseFromString(rawHTML, 'text/html');
      const fragment = parsedDocument.createDocumentFragment();

      fragment.append(...Array.from(parsedDocument.body.childNodes));

      if (finalize) {
        definitions = extractDefinitionsFromEvents(events);
      }

      const decorate = createDecorate(definitions, externalLinkAlt);
      betterLinkDocumentMod(fragment, decorate);

      // Insert marker before the last top-level element indicating active block.
      let activeBlockMarker = null;
      if (isAppendHtml) {
        const lastElement = fragment.lastElementChild;

        if (lastElement) {
          activeBlockMarker = parsedDocument.createComment(`webchat-html-stream-active-boundary-${id}`);
          fragment.insertBefore(activeBlockMarker, lastElement);
        }
      }

      return Object.freeze({
        definitions,
        fragment,
        activeBlockMarker
      });
    }
  });
}

export { type MarkdownLinkDefinition, type StreamingRenderer, type StreamingRenderOptions, type StreamingRenderResult };
