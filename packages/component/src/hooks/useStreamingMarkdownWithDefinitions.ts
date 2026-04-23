import { cx } from '@emotion/css';
import { hooks } from 'botframework-webchat-api';
import type { Definition } from 'mdast';
import { fromMarkdown } from 'mdast-util-from-markdown';
import { useLayoutEffect, useMemo, useRef, useState } from 'react';
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

  const previousMarkdownRef = useRef('');

  const streamingRenderer = useMemo<StreamingRenderer | undefined>(() => {
    previousMarkdownRef.current = '';

    if (renderMarkdown?.createStreamingRenderer) {
      return renderMarkdown.createStreamingRenderer(styleOptionsRef.current, { externalLinkAlt });
    }

    return undefined;
  }, [externalLinkAlt, renderMarkdown, styleOptionsRef]);

  const [definitions, setDefinitions] = useState<readonly MarkdownLinkDefinition[]>(EMPTY_DEFINITIONS);

  // Reset definitions and markdown ref when the streaming renderer changes.
  // This must run before the main streaming effect so that a fresh renderer
  // starts clean, but the streaming effect can still set definitions on the same commit.
  useLayoutEffect(() => {
    previousMarkdownRef.current = '';

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDefinitions(EMPTY_DEFINITIONS);
  }, [streamingRenderer]);

  useLayoutEffect(() => {
    if (!streamingRenderer) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!markdown) {
      streamingRenderer.reset();
      previousMarkdownRef.current = '';
      container.textContent = '';

      return;
    }

    const prev = previousMarkdownRef.current;
    const isAppendOnly = !!prev && markdown.startsWith(prev);

    if (!isAppendOnly) {
      streamingRenderer.reset();
    }

    const chunk = isAppendOnly ? markdown.slice(prev.length) : markdown;
    const options: StreamingNextOptions = {
      container,
      containerClassName,
      transformFragment: transformHTMLContent
    };

    previousMarkdownRef.current = markdown;

    if (finalize) {
      if (chunk) {
        streamingRenderer.next(chunk, options);
      }

      const { definitions } = streamingRenderer.finalize(options);

      setDefinitions(definitions);
    } else {
      streamingRenderer.next(chunk, options);
    }
  }, [containerClassName, containerRef, finalize, markdown, streamingRenderer, transformHTMLContent]);

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

  useLayoutEffect(() => {
    if (streamingRenderer || fallbackHTML === undefined) {
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
  }, [containerClassName, containerRef, fallbackHTML, streamingRenderer, transformHTMLContent]);

  useLayoutEffect(() => {
    if (streamingRenderer || fallbackHTML !== undefined) {
      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.textContent = '';
  }, [containerRef, fallbackHTML, streamingRenderer]);

  return Object.freeze({ definitions: definitions ?? fallbackDefinitions });
}

export { type MarkdownLinkDefinition };
