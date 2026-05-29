/* eslint react/no-danger: "off" */

import {
  betterLinkDocumentMod,
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  stripParagraphContainer
} from '@msinternal/botframework-webchat-component-better-link';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyleOptions } from 'botframework-webchat-api/hook.js';
import { micromark } from 'micromark';
import React, { useCallback, useMemo } from 'react';
import {
  args,
  array,
  function_,
  instance,
  object,
  optional,
  parse,
  pipe,
  readonly,
  string,
  tuple,
  union,
  type InferInput
} from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import createCustomEvent from './createCustomEvent';

const referenceEventSchema = union([instance(Event), object({ data: string() })]);

const inlineMarkdownPropsSchema = pipe(
  object({
    markdown: string(),
    onReference: pipe(function_(), args(tuple([referenceEventSchema]))),
    references: optional(array(string()))
  }),
  readonly()
);

type InlineMarkdownProps = InferInput<typeof inlineMarkdownPropsSchema>;

const InlineMarkdown = (props: InlineMarkdownProps) => {
  const { markdown, onReference, references } = validateProps(inlineMarkdownPropsSchema, props);

  const [{ accent }] = useStyleOptions();
  const styleToClassName = useStyleToEmotionObject();

  // We inlined the style here because this style is:
  // 1. Internal to Web Chat
  // 2. Not customizable from developers (other than setting `styleOptions.accent`)
  const className = useMemo(
    () =>
      styleToClassName({
        '& button[data-markdown-href]': {
          appearance: 'none',
          backgroundColor: 'transparent',
          border: 0,
          color: accent,
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          padding: 0
        },
        '@media screen and (forced-colors: active)': {
          '& button[data-markdown-href]': {
            color: 'LinkText',
            textDecoration: 'underline'
          }
        }
      }) + '',
    [accent, styleToClassName]
  );

  const html = useMemo(() => {
    let markdownWithLinkReferenceDefinitions = markdown;

    if (references?.length) {
      markdownWithLinkReferenceDefinitions += '\n\n';
    }

    for (const reference of references || []) {
      markdownWithLinkReferenceDefinitions += `[${reference}]: #${reference}\n`;
    }

    const documentFragment = parseDocumentFragmentFromString(micromark(markdownWithLinkReferenceDefinitions));

    // Turn "<a href="#retry">Retry</a>" into "<button type="button" data-markdown-ref="#retry">Retry</button>"
    betterLinkDocumentMod(documentFragment, href => {
      if (href?.startsWith('#')) {
        return { asButton: true, dataset: { markdownHref: href } };
      }
    });

    return { __html: stripParagraphContainer(serializeDocumentFragmentIntoString(documentFragment)) };
  }, [markdown, references]);

  const handleClick = useCallback(
    event => {
      event.stopPropagation();

      const href = event.target.getAttribute('value') ?? undefined;
      const reference = href?.startsWith('#') ? href.slice(1) : href;

      if (reference) {
        const event = createCustomEvent('reference', { data: reference });

        parse(referenceEventSchema, event);
        onReference?.(event);
      }
    },
    [onReference]
  );

  return <span className={className} dangerouslySetInnerHTML={html} onClick={handleClick} />;
};

export default InlineMarkdown;
export { inlineMarkdownPropsSchema, type InlineMarkdownProps };
