import { cx } from '@emotion/css';
import { hooks } from 'botframework-webchat-api';
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { useRefFrom } from 'use-ref-from';

import { useTransformHTMLContent } from '../providers/HTMLContentTransformCOR/index';
import parseDocumentFragmentFromString from '../Utils/parseDocumentFragmentFromString';
import useWebChatUIContext from './internal/useWebChatUIContext';

import styles from './RenderMarkdown.module.css';

const { useLocalizer, useStyleOptions } = hooks;

type MarkdownLinkDefinition = Readonly<{
  identifier: string;
  label: string;
  title: string;
  url: string;
}>;

type StreamingRenderResult = Readonly<{
  definitions: readonly MarkdownLinkDefinition[];
  fragment: DocumentFragment;
  numFrozenBlocks: number;
}>;

type StreamingRenderer = Readonly<{
  update: (fullMarkdown: string) => StreamingRenderResult;
}>;

const EMPTY_DEFINITIONS: readonly MarkdownLinkDefinition[] = Object.freeze([]);

export default function useStreamingMarkdownWithDefinitions(
  containerRef: Readonly<{ current: HTMLDivElement | null }>,
  markdown: string
): { readonly definitions: readonly MarkdownLinkDefinition[] } {
  const { renderMarkdown } = useWebChatUIContext();
  const [styleOptions] = useStyleOptions();
  const localize = useLocalizer();
  const transformHTMLContent = useTransformHTMLContent();
  const styleOptionsRef = useRefFrom(styleOptions);

  const classNames = useStyles(styles);

  const externalLinkAlt = localize('MARKDOWN_EXTERNAL_LINK_ALT');

  const containerClassName = useMemo(
    () =>
      cx(classNames['render-markdown'], {
        [classNames['render-markdown--message-activity']]: true
      }),
    [classNames]
  );

  const hasStreamingSupport = !!renderMarkdown?.createStreamingRenderer;

  // Create the streaming renderer instance once per renderMarkdown identity.
  const streamingRenderer = useMemo<StreamingRenderer | undefined>(() => {
    if (renderMarkdown?.createStreamingRenderer) {
      return renderMarkdown.createStreamingRenderer(styleOptionsRef.current, { externalLinkAlt });
    }

    return undefined;
  }, [externalLinkAlt, renderMarkdown, styleOptionsRef]);

  const streamingResult = useMemo<StreamingRenderResult | undefined>(() => {
    if (!streamingRenderer || !markdown) {
      return undefined;
    }

    return streamingRenderer.update(markdown);
  }, [markdown, streamingRenderer]);

  // Fallback path: render via legacy renderMarkdown → full HTML string.
  const fallbackHTML = useMemo<string | undefined>(() => {
    if (hasStreamingSupport || !renderMarkdown || !markdown) {
      return undefined;
    }

    return renderMarkdown(markdown, styleOptionsRef.current, { externalLinkAlt });
  }, [externalLinkAlt, hasStreamingSupport, markdown, renderMarkdown, styleOptionsRef]);

  const definitions = streamingResult?.definitions ?? EMPTY_DEFINITIONS;

  // Track DOM state for incremental updates.
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const committedBlockCountRef = useRef(0);

  // Streaming DOM management in useLayoutEffect.
  // The full HTML is sanitized as one unit (preserving inter-block whitespace),
  // then split into frozen blocks (already committed to DOM) and an active block
  // (last element, which may still be receiving content).
  useLayoutEffect(() => {
    if (!streamingResult) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const { fragment, numFrozenBlocks } = streamingResult;

    // Ensure wrapper div exists.
    let wrapper = wrapperRef.current;

    if (!wrapper || !container.contains(wrapper)) {
      wrapper = document.createElement('div');
      containerClassName && wrapper.classList.add(...containerClassName.split(' ').filter(Boolean));
      container.textContent = '';
      container.appendChild(wrapper);
      wrapperRef.current = wrapper;
      committedBlockCountRef.current = 0;
    }

    // Sanitize/transform the fragment as one unit so inter-block whitespace is preserved.
    const fullFragment = transformHTMLContent(fragment);

    // Count element children in the sanitized fragment.
    const elementChildren: Element[] = [];

    for (const child of fullFragment.childNodes) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        elementChildren.push(child as Element);
      }
    }

    // If frozen block count decreased, we need to rebuild.
    if (numFrozenBlocks < committedBlockCountRef.current) {
      wrapper.textContent = '';
      committedBlockCountRef.current = 0;
    }

    // Determine how many element blocks we can keep in the DOM.
    // committed blocks are already in the wrapper and don't change.
    const keepCount = Math.min(committedBlockCountRef.current, numFrozenBlocks);

    // Remove everything after the kept blocks (active block + trailing text nodes from previous render).
    // We track by counting Element children to skip text nodes between them.
    let elementsSeen = 0;
    let cutoffNode: ChildNode | null = null;

    for (const child of Array.from(wrapper.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        elementsSeen++;
      }

      if (elementsSeen > keepCount) {
        cutoffNode = child;
        break;
      }
    }

    // Remove from the cutoff point onward.
    if (cutoffNode) {
      while (wrapper.lastChild && wrapper.lastChild !== cutoffNode) {
        wrapper.lastChild.remove();
      }

      cutoffNode.remove();
    }

    // Consume the corresponding nodes from the sanitized fragment (we skip committed ones).
    let fragmentElementsSeen = 0;

    while (fullFragment.firstChild) {
      if (fullFragment.firstChild.nodeType === Node.ELEMENT_NODE) {
        fragmentElementsSeen++;
      }

      // Skip nodes belonging to already committed blocks.
      if (fragmentElementsSeen <= keepCount) {
        fullFragment.firstChild.remove();
        continue;
      }

      break;
    }

    // Append the remaining fragment (new frozen blocks + active block + whitespace) to wrapper.
    wrapper.appendChild(fullFragment);

    committedBlockCountRef.current = numFrozenBlocks;
  }, [containerClassName, containerRef, streamingResult, transformHTMLContent]);

  // Fallback DOM management: full replacement, matching the original dangerouslySetInnerHTML behavior.
  useLayoutEffect(() => {
    if (streamingResult || fallbackHTML === undefined) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const documentFragment = transformHTMLContent(parseDocumentFragmentFromString(fallbackHTML));
    const wrapper = document.createElement('div');

    containerClassName && wrapper.classList.add(...containerClassName.split(' ').filter(Boolean));
    wrapper.append(...documentFragment.childNodes);

    container.textContent = '';
    container.appendChild(wrapper);
    wrapperRef.current = wrapper;
  }, [containerClassName, containerRef, fallbackHTML, streamingResult, transformHTMLContent]);

  // Clear container when there is no content at all.
  useLayoutEffect(() => {
    if (streamingResult || fallbackHTML !== undefined) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.textContent = '';
    wrapperRef.current = null;
    committedBlockCountRef.current = 0;
  }, [containerRef, fallbackHTML, streamingResult]);

  // Reset committed blocks when streaming renderer changes.
  useLayoutEffect(() => {
    committedBlockCountRef.current = 0;
    wrapperRef.current = null;
  }, [streamingRenderer]);

  return Object.freeze({ definitions });
}

export { type MarkdownLinkDefinition };
