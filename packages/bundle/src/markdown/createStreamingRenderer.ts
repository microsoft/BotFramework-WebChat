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

type StreamingNextOptions = Readonly<{
  container: HTMLElement;
  containerClassName?: string | undefined;
  transformFragment?: ((fragment: DocumentFragment) => DocumentFragment) | undefined;
}>;

type StreamingNextResult = Readonly<{
  definitions: readonly MarkdownLinkDefinition[];
}>;

type StreamingRenderer = Readonly<{
  finalize: (options: StreamingNextOptions) => StreamingNextResult;
  next: (chunk: string, options: StreamingNextOptions) => void;
  reset: () => void;
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

  // Parser state.
  let activeBlockStartOffset = 0;
  let previousMarkdown = '';
  const emptyDefinitions: readonly MarkdownLinkDefinition[] = Object.freeze([]);

  // DOM reconciliation state.
  let wrapperDiv: HTMLDivElement | null = null;
  let activeSentinel: Comment | null = null;

  function parseEvents(source: string): Event[] {
    return postprocess(
      parse(micromarkOptions)
        .document()
        .write(preprocess()(source, undefined, true))
    );
  }

  function applyTransform(
    fragment: DocumentFragment,
    transformFragment: ((fragment: DocumentFragment) => DocumentFragment) | undefined
  ): DocumentFragment {
    return transformFragment ? transformFragment(fragment) : fragment;
  }

  function ensureWrapper(container: HTMLElement, containerClassName: string | undefined): HTMLDivElement {
    if (wrapperDiv && container.contains(wrapperDiv)) {
      wrapperDiv.className = containerClassName || '';

      return wrapperDiv;
    }

    const wrapper = document.createElement('div');

    wrapper.className = containerClassName || '';
    container.textContent = '';
    container.appendChild(wrapper);
    wrapperDiv = wrapper;
    activeSentinel = null;

    return wrapper;
  }

  function renderNext(chunk: string, options: StreamingNextOptions): void {
    previousMarkdown += chunk;

    if (!previousMarkdown) {
      activeBlockStartOffset = 0;
      activeSentinel = null;

      const wrapper = ensureWrapper(options.container, options.containerClassName);

      wrapper.replaceChildren();

      return;
    }

    let processedMarkdown = previousMarkdown;

    if (markdownRespectCRLF) {
      processedMarkdown = respectCRLFPre(processedMarkdown);
    }

    // Incremental path: re-parse only from the last committed block boundary.
    // Guard: if sentinel was lost (e.g. container changed), fall back to full reparse.
    if (activeBlockStartOffset > 0) {
      const wrapper = ensureWrapper(options.container, options.containerClassName);

      if (activeSentinel && wrapper.contains(activeSentinel)) {
        const tailEvents = parseEvents(processedMarkdown.slice(activeBlockStartOffset));
        const tailBlocks = findTopLevelBlocks(tailEvents);
        const tailHTML = compile(micromarkOptions)(tailEvents);

        if (tailBlocks.length <= 1) {
          // Fast path: active block grew, no new committed blocks.
          // Replace only the active zone (after sentinel).
          const activeDoc = domParser.parseFromString(tailHTML.trim(), 'text/html');
          const activeFragment = activeDoc.createDocumentFragment();

          activeFragment.append(...Array.from(activeDoc.body.childNodes));
          betterLinkDocumentMod(activeFragment, createDecorate(emptyDefinitions, externalLinkAlt));

          const activeRange = document.createRange();

          activeRange.setStartAfter(activeSentinel);
          activeRange.setEndAfter(wrapper.lastChild!);
          activeRange.deleteContents();

          wrapper.append(applyTransform(activeFragment, options.transformFragment));
        } else {
          // New block boundary in tail: commit newly-finished blocks, replace active.
          const newActiveOffsetInTail = tailBlocks[tailBlocks.length - 1].startOffset;
          const committedTailEvents = tailEvents.filter(([, token]) => token.start.offset < newActiveOffsetInTail);
          const committedTailHTML = compile(micromarkOptions)(committedTailEvents);

          activeBlockStartOffset += newActiveOffsetInTail;

          const committedDoc = domParser.parseFromString(committedTailHTML, 'text/html');
          const committedFragment = committedDoc.createDocumentFragment();

          committedFragment.append(...Array.from(committedDoc.body.childNodes));
          betterLinkDocumentMod(committedFragment, createDecorate(emptyDefinitions, externalLinkAlt));

          const remainingHTML = tailHTML.slice(committedTailHTML.length);
          const activeDoc = domParser.parseFromString(remainingHTML.trim(), 'text/html');
          const activeFragment = activeDoc.createDocumentFragment();

          activeFragment.append(...Array.from(activeDoc.body.childNodes));
          betterLinkDocumentMod(activeFragment, createDecorate(emptyDefinitions, externalLinkAlt));

          // Remove old sentinel and active zone.
          const tailRange = document.createRange();

          tailRange.setStartBefore(activeSentinel);
          tailRange.setEndAfter(wrapper.lastChild!);
          tailRange.deleteContents();

          // Append newly committed, new sentinel, active.
          activeSentinel = document.createComment('');

          wrapper.append(
            applyTransform(committedFragment, options.transformFragment),
            activeSentinel,
            applyTransform(activeFragment, options.transformFragment)
          );
        }

        return;
      }

      // Sentinel lost — reset and fall through to full reparse.
      activeBlockStartOffset = 0;
      activeSentinel = null;
    }

    // Full reparse path.
    const fullEvents = parseEvents(processedMarkdown);
    const rawHTML = compile(micromarkOptions)(fullEvents);
    const blocks = findTopLevelBlocks(fullEvents);

    if (blocks.length >= 2) {
      const lastBlock = blocks[blocks.length - 1];

      activeBlockStartOffset = lastBlock.startOffset;

      // Compile the active (last block) portion first — it is always a single
      // block and therefore cheap.  Then derive the committed HTML by slicing
      // the already-compiled full output so that inter-block whitespace
      // (produced by lineEnding events the compiler only flushes mid-stream)
      // is preserved in the committed fragment.
      const activeEvents = fullEvents.filter(([, token]) => token.start.offset >= lastBlock.startOffset);
      const activeHTML = compile(micromarkOptions)(activeEvents);
      const committedHTML = rawHTML.slice(0, rawHTML.length - activeHTML.length);

      const committedDoc = domParser.parseFromString(committedHTML, 'text/html');
      const committedFragment = committedDoc.createDocumentFragment();

      committedFragment.append(...Array.from(committedDoc.body.childNodes));

      const activeDoc = domParser.parseFromString(activeHTML.trim(), 'text/html');
      const activeFragment = activeDoc.createDocumentFragment();

      activeFragment.append(...Array.from(activeDoc.body.childNodes));

      const decorate = createDecorate(emptyDefinitions, externalLinkAlt);

      betterLinkDocumentMod(committedFragment, decorate);
      betterLinkDocumentMod(activeFragment, decorate);

      const wrapper = ensureWrapper(options.container, options.containerClassName);

      activeSentinel = document.createComment('');

      wrapper.replaceChildren(
        applyTransform(committedFragment, options.transformFragment),
        activeSentinel,
        applyTransform(activeFragment, options.transformFragment)
      );

      return;
    }

    // Single block — full replace, no sentinel.
    activeBlockStartOffset = 0;
    activeSentinel = null;

    const parsedDocument = domParser.parseFromString(rawHTML.trim(), 'text/html');
    const fragment = parsedDocument.createDocumentFragment();

    fragment.append(...Array.from(parsedDocument.body.childNodes));

    betterLinkDocumentMod(fragment, createDecorate(emptyDefinitions, externalLinkAlt));

    const wrapper = ensureWrapper(options.container, options.containerClassName);

    wrapper.replaceChildren(applyTransform(fragment, options.transformFragment));
  }

  return Object.freeze({
    finalize(options: StreamingNextOptions): StreamingNextResult {
      if (!previousMarkdown) {
        const wrapper = ensureWrapper(options.container, options.containerClassName);

        wrapper.replaceChildren();

        return Object.freeze({ definitions: Object.freeze([]) });
      }

      let processedMarkdown = previousMarkdown;

      if (markdownRespectCRLF) {
        processedMarkdown = respectCRLFPre(processedMarkdown);
      }

      const fullEvents = parseEvents(processedMarkdown);
      const rawHTML = compile(micromarkOptions)(fullEvents);
      const parsedDocument = domParser.parseFromString(rawHTML.trim(), 'text/html');
      const fragment = parsedDocument.createDocumentFragment();

      fragment.append(...Array.from(parsedDocument.body.childNodes));

      const definitions = extractDefinitionsFromEvents(fullEvents);

      betterLinkDocumentMod(fragment, createDecorate(definitions, externalLinkAlt));

      activeBlockStartOffset = 0;
      activeSentinel = null;

      // Full replace on finalize — no incremental path needed.
      const wrapper = ensureWrapper(options.container, options.containerClassName);
      const transformedFragment = applyTransform(fragment, options.transformFragment);

      wrapper.replaceChildren(transformedFragment);

      return Object.freeze({ definitions });
    },

    next(chunk: string, options: StreamingNextOptions): void {
      renderNext(chunk, options);
    },

    reset(): void {
      previousMarkdown = '';
      activeBlockStartOffset = 0;
      activeSentinel = null;
      wrapperDiv = null;
    }
  });
}

export {
  type MarkdownLinkDefinition,
  type StreamingNextOptions,
  type StreamingNextResult,
  type StreamingRenderer,
  type StreamingRenderOptions
};
