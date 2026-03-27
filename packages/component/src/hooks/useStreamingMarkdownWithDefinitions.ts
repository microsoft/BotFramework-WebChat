/* eslint-disable complexity */
/* eslint-disable no-magic-numbers */
import { cx } from '@emotion/css';
import { hooks } from 'botframework-webchat-api';
import type { Definition } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
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
  label?: string;
  title?: string;
  url: string;
}>;

type StreamingRenderResult = Readonly<{
  definitions: readonly MarkdownLinkDefinition[];
  fragment: DocumentFragment;
  activeBlockMarker: Comment | null;
}>;

type StreamingRenderer = Readonly<{
  update: (fullMarkdown: string, finalize?: boolean) => StreamingRenderResult;
}>;

const EMPTY_DEFINITIONS: readonly MarkdownLinkDefinition[] = Object.freeze([]);

export default function useStreamingMarkdownWithDefinitions(
  containerRef: Readonly<{ current: HTMLDivElement | null }>,
  markdown: string,
  finalize = false
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
  console.warn('[useStreamingMarkdownWithDefinitions] Streaming support:', hasStreamingSupport);

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

    return streamingRenderer.update(markdown, finalize);
  }, [markdown, finalize, streamingRenderer]);

  const fallbackHTML = useMemo<string | undefined>(() => {
    if (hasStreamingSupport || !renderMarkdown || !markdown) {
      return undefined;
    }

    return renderMarkdown(markdown, styleOptionsRef.current, { externalLinkAlt });
  }, [externalLinkAlt, hasStreamingSupport, markdown, renderMarkdown, styleOptionsRef]);

  const fallbackDefinitions = useMemo(
    () =>
      hasStreamingSupport
        ? EMPTY_DEFINITIONS
        : fromMarkdown(markdown).children.filter((node): node is Definition => node.type === 'definition'),
    [hasStreamingSupport, markdown]
  );

  const definitions = streamingResult?.definitions ?? fallbackDefinitions;

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Saved raw child-node index from the previous parser result.
  // It points to where the active tail started on the previous turn.
  const previousActiveStartIndexRef = useRef(0);

  // Boundary comment inside the live DOM. Everything after it is the mutable tail.
  const activeBoundaryRef = useRef<Comment | null>(null);

  useLayoutEffect(() => {
    if (!streamingResult) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const { activeBlockMarker, fragment } = streamingResult;
    const rawNodes = Array.from(fragment.childNodes);
    const currentMarkerIndex = activeBlockMarker ? rawNodes.indexOf(activeBlockMarker) : -1;
    const currentActiveStartIndex = currentMarkerIndex >= 0 ? currentMarkerIndex : 0;
    const previousActiveStartIndex = previousActiveStartIndexRef.current;

    let wrapper = wrapperRef.current;

    if (!wrapper || !container.contains(wrapper)) {
      wrapper = document.createElement('div');
      container.textContent = '';
      container.appendChild(wrapper);
      wrapperRef.current = wrapper;
      activeBoundaryRef.current = null;
      previousActiveStartIndexRef.current = 0;
    }

    wrapper.className = containerClassName || '';

    let activeBoundary = activeBoundaryRef.current;

    if (!activeBoundary || !wrapper.contains(activeBoundary)) {
      activeBoundary = null;
      activeBoundaryRef.current = null;
    }

    const canIncrement = !!activeBoundary && currentMarkerIndex >= 0 && currentMarkerIndex >= previousActiveStartIndex;

    console.warn(
      '[useStreamingMarkdownWithDefinitions] Incremental update:',
      canIncrement
        ? 'Yes'
        : !activeBoundary
          ? 'No (active boundary lost)'
          : !(currentMarkerIndex >= 0)
            ? 'No (not found in current nodes)'
            : !(currentMarkerIndex >= previousActiveStartIndex)
              ? 'No (current marker index is before previous active start index)'
              : 'No (wtf)',
      '|',
      'Current marker index:',
      currentMarkerIndex,
      '|',
      'Previous active start index:',
      previousActiveStartIndex
    );

    if (!canIncrement) {
      const transformedFragment = transformHTMLContent(fragment);
      wrapper.replaceChildren(transformedFragment);
    } else {
      const activeNodes = Array.from(fragment.childNodes).slice(previousActiveStartIndex);
      const activeFragment = document.createDocumentFragment();
      activeFragment.append(...activeNodes);
      const transformedFragment = transformHTMLContent(activeFragment);

      const range = document.createRange();
      range.setStartBefore(activeBoundary);
      range.setEndAfter(wrapper.lastChild);
      range.deleteContents();

      wrapper.append(transformedFragment);
    }

    previousActiveStartIndexRef.current = currentActiveStartIndex;

    activeBoundaryRef.current = null;
    if (!activeBlockMarker) {
      return;
    }

    let boundary = wrapper.lastChild;
    while (
      boundary &&
      (boundary.nodeType !== Node.COMMENT_NODE || boundary.nodeValue !== activeBlockMarker.nodeValue)
    ) {
      boundary = boundary.previousSibling;
    }

    if (boundary) {
      activeBoundaryRef.current = boundary as Comment;
    }
  }, [containerClassName, containerRef, streamingResult, transformHTMLContent]);

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

    wrapper.className = containerClassName || '';
    wrapper.append(...documentFragment.childNodes);

    container.textContent = '';
    container.appendChild(wrapper);

    wrapperRef.current = wrapper;
    activeBoundaryRef.current = null;
    previousActiveStartIndexRef.current = 0;
  }, [containerClassName, containerRef, fallbackHTML, streamingResult, transformHTMLContent]);

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
    activeBoundaryRef.current = null;
    previousActiveStartIndexRef.current = 0;
  }, [containerRef, fallbackHTML, streamingResult]);

  useLayoutEffect(() => {
    wrapperRef.current = null;
    activeBoundaryRef.current = null;
    previousActiveStartIndexRef.current = 0;
  }, [streamingRenderer]);

  return Object.freeze({ definitions });
}

export { type MarkdownLinkDefinition };
