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

function serializeDocumentFragment(fragment: DocumentFragment): string {
  const wrapper = fragment.ownerDocument?.createElement('div') ?? document.createElement('div');

  wrapper.append(...Array.from(fragment.childNodes));

  const html = wrapper.innerHTML;

  // Move children back to fragment.
  fragment.append(...Array.from(wrapper.childNodes));

  return html;
}

/**
 * Splits compiled HTML into root-level block elements.
 *
 * Trailing whitespace text nodes (e.g. `\n` between `</p>` and `<p>`) are
 * attached to the preceding element block so that `textContent` of the
 * reconstructed DOM preserves inter-block newlines.
 */
function splitIntoBlocks(html: string): readonly string[] {
  const parsedDocument = domParser.parseFromString(html, 'text/html');
  const children = Array.from(parsedDocument.body.childNodes);
  const blocks: string[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (!(child instanceof Element)) {
      continue;
    }

    let blockHTML = child.outerHTML;

    // Absorb trailing whitespace text nodes to preserve inter-block newlines.
    while (i + 1 < children.length && children[i + 1]?.nodeType === Node.TEXT_NODE) {
      blockHTML += children[i + 1]?.nodeValue ?? '';
      i++;
    }

    blocks.push(blockHTML);
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

  let previousMarkdown = '';
  let committedBlockCount = 0;

  const frozenBlockHTMLs: string[] = [];

  function oneshotCompile(markdown: string): {
    readonly html: string;
    readonly definitions: readonly MarkdownLinkDefinition[];
  } {
    let processedMarkdown = markdown;

    if (markdownRespectCRLF) {
      processedMarkdown = respectCRLFPre(processedMarkdown);
    }

    const preprocessor = preprocess();
    const parser = parse(micromarkOptions);
    const tokenizerContext = parser.document();
    const chunks = preprocessor(processedMarkdown, undefined, true);
    const events = tokenizerContext.write(chunks);
    const html = compile(micromarkOptions)(postprocess(events));
    const definitions = extractDefinitionsFromEvents(events);

    return Object.freeze({ html, definitions });
  }

  return Object.freeze({
    update(fullMarkdown: string): StreamingRenderResult {
      const isAppendOnly = !!previousMarkdown && fullMarkdown.startsWith(previousMarkdown);

      // If content was edited (not a pure append), invalidate all frozen blocks.
      if (!isAppendOnly) {
        committedBlockCount = 0;
        frozenBlockHTMLs.length = 0;
      }

      previousMarkdown = fullMarkdown;

      if (!fullMarkdown) {
        return Object.freeze({
          activeBlockHTML: '',
          definitions: Object.freeze([]),
          frozenBlockHTMLs: Object.freeze([...frozenBlockHTMLs])
        });
      }

      const { html, definitions } = oneshotCompile(fullMarkdown);

      const blockHTMLs = splitIntoBlocks(html);
      const totalBlocks = blockHTMLs.length;
      const decorate = createDecorate(definitions, externalLinkAlt);

      // If total blocks shrank below our committed count, reset.
      if (totalBlocks - 1 < committedBlockCount) {
        committedBlockCount = 0;
        frozenBlockHTMLs.length = 0;
      }

      // Freeze newly completed blocks (all except the last).
      for (const blockHTML of blockHTMLs.slice(committedBlockCount, Math.max(0, totalBlocks - 1))) {
        const blockFragment = parseDocumentFragmentFromString(blockHTML);

        betterLinkDocumentMod(blockFragment, decorate);
        frozenBlockHTMLs.push(serializeNodeString(blockFragment));
      }

      committedBlockCount = Math.max(0, totalBlocks - 1);

      // Last block is always active (may still be receiving content).
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
