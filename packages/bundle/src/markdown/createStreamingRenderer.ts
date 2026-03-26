import katex from 'katex';
import { compile, parse, postprocess, preprocess } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import type { Chunk, Event, Options, TokenizeContext } from 'micromark-util-types';

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
  activeBlockHTML: string;
  definitions: readonly MarkdownLinkDefinition[];
  frozenBlockHTMLs: readonly string[];
}>;

type StreamingRenderer = Readonly<{
  update: (fullMarkdown: string) => StreamingRenderResult;
}>;

// #region DOM parsing and serialization utilities for block-level HTML elements.
// We maintain own utilities here to avoid parser instances recreation and fragment recreation
const domParser = new DOMParser();
function parseDocumentFragmentFromString(html: string): DocumentFragment {
  const parsedDocument = domParser.parseFromString(html, 'text/html');
  const fragment = parsedDocument.createDocumentFragment();

  fragment.append(...parsedDocument.body.childNodes);

  return fragment;
}

const serializer = new XMLSerializer();
function serializeNodeString(node: Node): string {
  return serializer.serializeToString(node).trim();
}

function splitIntoBlocks(html: string): readonly string[] {
  const documentFragment = parseDocumentFragmentFromString(html);
  const blocks: string[] = [];

  for (const child of Array.from(documentFragment.childNodes)) {
    blocks.push(serializeNodeString(child));
  }

  return blocks;
}

// #endregion

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

  let committedBlockCount = 0;
  let previousDefinitionCount = 0;

  // Persistent state for incremental tokenization.
  // `parse(options).document()` returns a `TokenizeContext` with `.write()` and `.events`.
  let preprocessor = preprocess();
  let parser = parse(micromarkOptions);
  let tokenizerContext: TokenizeContext = parser.document();

  let previousMarkdown = '';

  const frozenBlockHTMLs: string[] = [];

  function fullReparse(fullMarkdown: string): StreamingRenderResult {
    // Reset all state.
    committedBlockCount = 0;
    previousDefinitionCount = 0;
    previousMarkdown = fullMarkdown;
    frozenBlockHTMLs.length = 0;

    // Reset incremental tokenizer state.
    preprocessor = preprocess();
    parser = parse(micromarkOptions);
    tokenizerContext = parser.document();

    let processedMarkdown = fullMarkdown;

    if (markdownRespectCRLF) {
      processedMarkdown = respectCRLFPre(processedMarkdown);
    }

    // Feed to the persistent tokenizer (for future incremental use).
    const persistChunks = preprocessor(processedMarkdown, undefined, false);

    tokenizerContext.write(persistChunks);

    // One-shot full compile.
    const compileToHTML = compile(micromarkOptions);
    const oneshotPreprocessor = preprocess();
    const oneshotParser = parse(micromarkOptions);
    const oneshotTokenizer = oneshotParser.document();
    const oneshotChunks = oneshotPreprocessor(processedMarkdown, undefined, true);
    const oneshotEvents = oneshotTokenizer.write(oneshotChunks);
    const html = compileToHTML(postprocess(oneshotEvents));

    const definitions = extractDefinitionsFromEvents(oneshotEvents);

    previousDefinitionCount = definitions.length;

    const blockHTMLs = splitIntoBlocks(html);
    const decorate = createDecorate(definitions, externalLinkAlt);

    for (const blockHTML of blockHTMLs.slice(0, blockHTMLs.length - 1)) {
      const blockFragment = parseDocumentFragmentFromString(blockHTML);

      betterLinkDocumentMod(blockFragment, decorate);
      frozenBlockHTMLs.push(serializeNodeString(blockFragment));
    }

    committedBlockCount = Math.max(0, blockHTMLs.length - 1);

    let activeBlockHTML = '';

    if (blockHTMLs.length) {
      const lastBlockHTML = blockHTMLs[blockHTMLs.length - 1];
      const activeFragment = parseDocumentFragmentFromString(lastBlockHTML);

      betterLinkDocumentMod(activeFragment, decorate);
      activeBlockHTML = serializeNodeString(activeFragment);
    }

    return Object.freeze({
      activeBlockHTML,
      definitions,
      frozenBlockHTMLs: Object.freeze([...frozenBlockHTMLs])
    });
  }

  return Object.freeze({
    update(fullMarkdown: string): StreamingRenderResult {
      // Detect if this is a pure append or if earlier content changed.
      if (!previousMarkdown || !fullMarkdown.startsWith(previousMarkdown)) {
        // First call or content changed non-append. Reset and re-parse.
        return fullReparse(fullMarkdown);
      }

      // Feed only the delta to preprocessor → tokenizer (incremental parse).
      const delta = fullMarkdown.slice(previousMarkdown.length);

      previousMarkdown = fullMarkdown;

      if (!delta.length) {
        return Object.freeze({
          activeBlockHTML: '',
          definitions: Object.freeze(extractDefinitionsFromEvents(tokenizerContext.events)),
          frozenBlockHTMLs: Object.freeze([...frozenBlockHTMLs])
        });
      }

      const processedDelta = markdownRespectCRLF ? respectCRLFPre(delta) : delta;

      // Incremental preprocess + tokenize (only the new delta).
      const chunks: Chunk[] = preprocessor(processedDelta, undefined, false);

      tokenizerContext.write(chunks);

      // Extract definitions from accumulated events.
      const definitions = extractDefinitionsFromEvents(tokenizerContext.events);

      // If definitions changed, invalidate frozen blocks.
      if (definitions.length !== previousDefinitionCount) {
        previousDefinitionCount = definitions.length;
        committedBlockCount = 0;
        frozenBlockHTMLs.length = 0;
      }

      // Deep-clone events for postprocess → compile.
      // Shallow array clone is insufficient: subtokenize (called by postprocess) sets
      // `token._tokenizer = undefined` on each content token after expanding it.
      // Since tokens are shared references, that mutation would destroy the persistent
      // tokenizer's ability to re-expand inline content on subsequent updates.
      // Cloning each token object isolates the mutation to this compile pass.
      const eventsClone: Event[] = tokenizerContext.events.map(
        ([action, token, context]) => [action, { ...token }, context] as Event
      );
      const postprocessedEvents = postprocess(eventsClone);
      const compileToHTML = compile(micromarkOptions);
      const fullHTML = compileToHTML(postprocessedEvents);

      // Split HTML into root-level block elements.
      const blockHTMLs = splitIntoBlocks(fullHTML);
      const totalBlocks = blockHTMLs.length;

      // Apply betterLinkDocumentMod to newly frozen and active blocks.
      const decorate = createDecorate(definitions, externalLinkAlt);

      // Newly frozen: blocks [committedBlockCount .. totalBlocks - 2]
      for (const blockHTML of blockHTMLs.slice(committedBlockCount, totalBlocks - 1)) {
        const blockFragment = parseDocumentFragmentFromString(blockHTML);

        betterLinkDocumentMod(blockFragment, decorate);
        frozenBlockHTMLs.push(serializeNodeString(blockFragment));
      }

      committedBlockCount = Math.max(0, totalBlocks - 1);

      // Active block: the last one, always re-transform.
      let activeBlockHTML = '';

      if (totalBlocks > 0) {
        const lastBlockHTML = blockHTMLs[totalBlocks - 1] ?? '';
        const activeFragment = parseDocumentFragmentFromString(lastBlockHTML);

        betterLinkDocumentMod(activeFragment, decorate);
        activeBlockHTML = serializeNodeString(activeFragment);
      }

      return Object.freeze({
        activeBlockHTML,
        definitions,
        frozenBlockHTMLs: Object.freeze([...frozenBlockHTMLs])
      });
    }
  });
}

export { type MarkdownLinkDefinition, type StreamingRenderer, type StreamingRenderOptions, type StreamingRenderResult };
