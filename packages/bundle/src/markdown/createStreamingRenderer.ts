/* eslint-disable no-magic-numbers */
import katex from 'katex';
import { compile, parse, postprocess, preprocess } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import type { Event, Options } from 'micromark-util-types';

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

// Top-level block token types emitted by micromark.
// An exit event at depth 0 for one of these types marks a committed block boundary.
const TOP_LEVEL_BLOCK_TYPES: ReadonlySet<string> = new Set([
  'atxHeading',
  'blockQuote',
  'codeFenced',
  'codeIndented',
  'content',
  'htmlFlow',
  'listOrdered',
  'listUnordered',
  'setextHeading',
  'table',
  'thematicBreak'
]);

type BlockBoundary = {
  readonly endOffset: number;
  readonly startOffset: number;
  readonly type: string;
};

function findTopLevelBlocks(events: ReadonlyArray<Event>): readonly BlockBoundary[] {
  const blocks: Array<{ endOffset: number; startOffset: number; type: string }> = [];
  let depth = 0;

  for (const [action, token] of events) {
    if (!TOP_LEVEL_BLOCK_TYPES.has(token.type)) {
      continue;
    }

    if (action === 'enter') {
      if (!depth) {
        blocks.push({ endOffset: -1, startOffset: token.start.offset, type: token.type });
      }

      depth++;
    } else {
      depth--;

      if (!depth && blocks.length) {
        blocks[blocks.length - 1].endOffset = token.end.offset;
      }
    }
  }

  return blocks;
}

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

  const domParser = new DOMParser();
  const id = Math.random().toString(36).slice(2);

  let activeBlockStartOffset = 0;
  let committedHTML = '';
  let definitions: readonly MarkdownLinkDefinition[] = Object.freeze([]);
  let previousMarkdown = '';

  function parseEvents(source: string): Event[] {
    return postprocess(
      parse(micromarkOptions)
        .document()
        .write(preprocess()(source, undefined, true))
    );
  }

  function rebuildCache(events: ReadonlyArray<Event>): void {
    const blocks = findTopLevelBlocks(events);

    if (blocks.length < 2) {
      activeBlockStartOffset = 0;
      committedHTML = '';

      return;
    }

    activeBlockStartOffset = blocks[blocks.length - 1].startOffset;

    const committedEvents = events.filter(([, token]) => token.start.offset < activeBlockStartOffset);

    committedHTML = compile(micromarkOptions)(committedEvents);
  }

  return Object.freeze({
    update(fullMarkdown: string, finalize = false): StreamingRenderResult {
      const isAppendOnly = !!previousMarkdown && fullMarkdown.startsWith(previousMarkdown) && !finalize;

      if (!isAppendOnly) {
        activeBlockStartOffset = 0;
        committedHTML = '';
      }

      previousMarkdown = fullMarkdown;

      if (!fullMarkdown) {
        previousMarkdown = '';
        activeBlockStartOffset = 0;
        committedHTML = '';

        return Object.freeze({
          activeBlockMarker: null,
          definitions: Object.freeze([]),
          fragment: document.createDocumentFragment()
        });
      }

      let processedMarkdown = fullMarkdown;

      if (markdownRespectCRLF) {
        processedMarkdown = respectCRLFPre(processedMarkdown);
      }

      let rawHTML: string;
      let fullEvents: Event[] | undefined;

      if (isAppendOnly && activeBlockStartOffset > 0) {
        // Partial parse: only re-parse from the last committed block boundary.
        const tailEvents = parseEvents(processedMarkdown.slice(activeBlockStartOffset));
        const tailBlocks = findTopLevelBlocks(tailEvents);

        if (tailBlocks.length <= 1) {
          // Fast path: the active block grew but no new blocks appeared.
          rawHTML = committedHTML + compile(micromarkOptions)(tailEvents);
        } else {
          // New block boundary appeared in the tail — update cache incrementally.
          const newActiveOffsetInTail = tailBlocks[tailBlocks.length - 1].startOffset;

          const tailHTML = compile(micromarkOptions)(tailEvents);

          rawHTML = committedHTML + tailHTML;

          // Extend committedHTML with the newly committed portion of the tail.
          const committedTailEvents = tailEvents.filter(([, token]) => token.start.offset < newActiveOffsetInTail);

          committedHTML += compile(micromarkOptions)(committedTailEvents);
          activeBlockStartOffset += newActiveOffsetInTail;
        }
      } else {
        fullEvents = parseEvents(processedMarkdown);
        rawHTML = compile(micromarkOptions)(fullEvents);

        if (!finalize) {
          rebuildCache(fullEvents);
        }
      }

      const parsedDocument = domParser.parseFromString(rawHTML, 'text/html');
      const fragment = parsedDocument.createDocumentFragment();

      fragment.append(...Array.from(parsedDocument.body.childNodes));

      if (finalize && fullEvents) {
        definitions = extractDefinitionsFromEvents(fullEvents);
      }

      const decorate = createDecorate(definitions, externalLinkAlt);
      betterLinkDocumentMod(fragment, decorate);

      let activeBlockMarker: Comment | null = null;

      if (!finalize) {
        const lastElement = fragment.lastElementChild;

        if (lastElement) {
          activeBlockMarker = parsedDocument.createComment(`webchat-html-stream-active-boundary-${id}`);
          fragment.insertBefore(activeBlockMarker, lastElement);
        }
      }

      return Object.freeze({
        activeBlockMarker,
        definitions,
        fragment
      });
    }
  });
}

export { type MarkdownLinkDefinition, type StreamingRenderer, type StreamingRenderOptions, type StreamingRenderResult };
