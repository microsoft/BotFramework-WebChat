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
  'thematicBreak',
  'math'
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
  let previousFragment: DocumentFragment | null = null;
  let previousMarkdown = '';
  const emptyDefinitions: readonly MarkdownLinkDefinition[] = Object.freeze([]);

  function parseEvents(source: string): Event[] {
    return postprocess(
      parse(micromarkOptions)
        .document()
        .write(preprocess()(source, undefined, true))
    );
  }

  return Object.freeze({
    next(chunk: string): StreamingRenderResult {
      return this.update(previousMarkdown + chunk);
    },
    update(fullMarkdown: string, finalize = false): StreamingRenderResult {
      const isAppendOnly = !!previousMarkdown && fullMarkdown.startsWith(previousMarkdown) && !finalize;

      if (!isAppendOnly) {
        activeBlockStartOffset = 0;
        previousFragment = null;
      }

      previousMarkdown = fullMarkdown;

      // empty input
      if (!fullMarkdown) {
        previousMarkdown = '';
        activeBlockStartOffset = 0;
        previousFragment = null;

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

      if (isAppendOnly && activeBlockStartOffset > 0) {
        // Partial parse: only re-parse from the last committed block boundary.
        const tailEvents = parseEvents(processedMarkdown.slice(activeBlockStartOffset));
        const tailBlocks = findTopLevelBlocks(tailEvents);
        const tailHTML = compile(micromarkOptions)(tailEvents);

        let remainingHTML: string;

        if (tailBlocks.length <= 1) {
          // Fast path: the active block grew but no new blocks appeared.
          remainingHTML = tailHTML;
        } else {
          // New block boundary appeared in the tail — update cache incrementally.
          const newActiveOffsetInTail = tailBlocks[tailBlocks.length - 1].startOffset;
          const committedTailEvents = tailEvents.filter(([, token]) => token.start.offset < newActiveOffsetInTail);
          const committedTailHTML = compile(micromarkOptions)(committedTailEvents);

          activeBlockStartOffset += newActiveOffsetInTail;

          const committedTailDoc = domParser.parseFromString(committedTailHTML, 'text/html');
          const committedTailFrag = committedTailDoc.createDocumentFragment();

          committedTailFrag.append(...Array.from(committedTailDoc.body.childNodes));
          betterLinkDocumentMod(committedTailFrag, createDecorate(emptyDefinitions, externalLinkAlt));

          if (previousFragment) {
            previousFragment.append(...Array.from(committedTailFrag.childNodes));
          } else {
            previousFragment = committedTailFrag;
          }

          remainingHTML = tailHTML.slice(committedTailHTML.length);
        }

        const remainingDoc = domParser.parseFromString(remainingHTML, 'text/html');
        const remainingFragment = remainingDoc.createDocumentFragment();

        remainingFragment.append(...Array.from(remainingDoc.body.childNodes));
        betterLinkDocumentMod(remainingFragment, createDecorate(emptyDefinitions, externalLinkAlt));

        const fragment = document.createDocumentFragment();

        fragment.append(previousFragment.cloneNode(true), remainingFragment);

        let activeBlockMarker: Comment | null = null;
        const lastElement = fragment.lastElementChild;

        if (lastElement) {
          activeBlockMarker = document.createComment(`webchat-html-stream-active-boundary-${id}`);
          fragment.insertBefore(activeBlockMarker, lastElement);
        }

        return Object.freeze({
          activeBlockMarker,
          definitions: emptyDefinitions,
          fragment
        });
      }

      // Full reparse path.
      const fullEvents = parseEvents(processedMarkdown);
      const rawHTML = compile(micromarkOptions)(fullEvents);
      const parsedDocument = domParser.parseFromString(rawHTML, 'text/html');
      const fragment = parsedDocument.createDocumentFragment();

      fragment.append(...Array.from(parsedDocument.body.childNodes));

      if (finalize) {
        const definitions = extractDefinitionsFromEvents(fullEvents);
        betterLinkDocumentMod(fragment, createDecorate(definitions, externalLinkAlt));

        return Object.freeze({
          activeBlockMarker: null,
          definitions,
          fragment
        });
      }

      // Non-finalize full reparse: split committed and remaining at block boundary.
      const blocks = findTopLevelBlocks(fullEvents);

      if (blocks.length >= 2) {
        activeBlockStartOffset = blocks[blocks.length - 1].startOffset;

        const range = document.createRange();
        range.setStartBefore(fragment.firstChild);
        range.setEndBefore(fragment.lastElementChild);
        previousFragment = range.extractContents();

        const decorate = createDecorate(emptyDefinitions, externalLinkAlt);

        betterLinkDocumentMod(previousFragment, decorate);

        // fragment now contains only the remaining (active) nodes.
        betterLinkDocumentMod(fragment, decorate);

        const outputFragment = document.createDocumentFragment();
        const activeBlockMarker = document.createComment(`webchat-html-stream-active-boundary-${id}`);

        outputFragment.append(previousFragment.cloneNode(true), activeBlockMarker, fragment);

        return Object.freeze({
          activeBlockMarker,
          definitions: emptyDefinitions,
          fragment: outputFragment
        });
      }

      // Single block — mod everything.
      activeBlockStartOffset = 0;
      previousFragment = null;

      betterLinkDocumentMod(fragment, createDecorate(emptyDefinitions, externalLinkAlt));

      let activeBlockMarker: Comment | null = null;
      const lastElement = fragment.lastElementChild;

      if (lastElement) {
        activeBlockMarker = parsedDocument.createComment(`webchat-html-stream-active-boundary-${id}`);
        fragment.insertBefore(activeBlockMarker, lastElement);
      }

      return Object.freeze({
        activeBlockMarker,
        definitions: emptyDefinitions,
        fragment
      });
    }
  });
}

export { type MarkdownLinkDefinition, type StreamingRenderer, type StreamingRenderOptions, type StreamingRenderResult };
