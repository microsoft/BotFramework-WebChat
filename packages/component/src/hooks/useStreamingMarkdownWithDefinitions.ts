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
  activeBlockHTML: string;
  definitions: readonly MarkdownLinkDefinition[];
  frozenBlockHTMLs: readonly string[];
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
  // A wrapper div is created inside the container to match the original DOM structure:
  //   div.text-content__markdown > div.render-markdown > block elements
  useLayoutEffect(() => {
    if (!streamingResult) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    const { activeBlockHTML, frozenBlockHTMLs } = streamingResult;

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

    // If frozen block count decreased (definitions changed, etc.), clear and rebuild.
    if (frozenBlockHTMLs.length < committedBlockCountRef.current) {
      wrapper.textContent = '';
      committedBlockCountRef.current = 0;
    }

    // Remove old active block (everything after committed blocks).
    while (wrapper.children.length > committedBlockCountRef.current) {
      wrapper.lastChild?.remove();
    }

    // Append newly frozen blocks.
    for (const frozenBlockHTML of frozenBlockHTMLs.slice(committedBlockCountRef.current)) {
      const blockFragment = transformHTMLContent(parseDocumentFragmentFromString(frozenBlockHTML));

      wrapper.appendChild(blockFragment);
    }

    committedBlockCountRef.current = frozenBlockHTMLs.length;

    // Append the active block.
    if (activeBlockHTML) {
      const activeFragment = transformHTMLContent(parseDocumentFragmentFromString(activeBlockHTML));

      wrapper.appendChild(activeFragment);
    }
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
