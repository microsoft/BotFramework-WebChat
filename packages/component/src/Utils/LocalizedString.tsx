import {
  betterLinkDocumentMod,
  parseDocumentFragmentFromString,
  serializeDocumentFragmentIntoString,
  stripParagraphContainer,
  type BetterLinkDocumentModDecoration
} from '@msinternal/botframework-webchat-component-better-link';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useLocalizer } from 'botframework-webchat-api/hook.js';
import { onErrorResumeNext } from 'botframework-webchat-core';
import { micromark } from 'micromark';
import React, { memo, useMemo } from 'react';
import {
  array,
  intersect,
  is,
  number,
  object,
  optional,
  pipe,
  readonly,
  string,
  tupleWithRest,
  union,
  type InferInput,
  type InferOutput
} from 'valibot';

const allowedSchemes = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];

const pluralPropsSchema = pipe(
  object({
    stringIds: object({
      zero: optional(string()),
      one: optional(string()),
      two: optional(string()),
      few: optional(string()),
      many: optional(string()),
      other: string()
    }),
    values: pipe(tupleWithRest([number()], union([string()])), readonly())
  }),
  readonly()
);

const singularPropsSchema = pipe(
  object({
    stringIds: string(),
    values: optional(pipe(array(string()), readonly()))
  }),
  readonly()
);

const localizedStringPropsSchema = intersect([
  pipe(
    object({
      className: optional(string()),
      linkClassName: optional(string())
    }),
    readonly()
  ),
  union([pluralPropsSchema, singularPropsSchema])
]);

type LocalizedStringProps = InferInput<typeof localizedStringPropsSchema>;
type PluralProps = InferOutput<typeof pluralPropsSchema>;

function isPlural(props: InferOutput<typeof localizedStringPropsSchema>): props is PluralProps {
  return is(pluralPropsSchema, props);
}

const LocalizedString = (props: LocalizedStringProps) => {
  const { className, linkClassName } = validateProps(localizedStringPropsSchema, props);

  const localizePlural = useLocalizer({ plural: true });
  const localizeSingular = useLocalizer();

  // TODO: Add test.
  const externalLinkAlt = localizeSingular('MARKDOWN_EXTERNAL_LINK_ALT');

  const html = useMemo(() => {
    let localized: string;

    if (isPlural(props)) {
      const { stringIds, values } = props;

      localized = localizePlural(stringIds, ...values);
    } else {
      const { stringIds, values } = props;

      localized = localizeSingular(stringIds, ...(values || []));
    }

    const documentFragment = parseDocumentFragmentFromString(micromark(localized));

    betterLinkDocumentMod(documentFragment, (href, textContent) => {
      const decoration: BetterLinkDocumentModDecoration = {
        rel: 'noopener noreferrer',
        target: '_blank',
        wrapZeroWidthSpace: true
      };

      const classNames = new Set<string>([linkClassName]);
      const protocol = onErrorResumeNext<string>(() => new URL(href).protocol);

      // For links that would be sanitized out, let's turn them into a button so we could handle them later.
      if (!allowedSchemes.map(scheme => `${scheme}:`).includes(protocol)) {
        // TODO: Add test.
        decoration.asButton = true;
      } else if (protocol === 'http:' || protocol === 'https:') {
        // TODO: Add test.
        decoration.ariaLabel = value => [value || textContent, externalLinkAlt].filter(Boolean).join(' ');
        decoration.iconClassName = 'render-markdown__external-link-icon';
      }

      decoration.className = Array.from(classNames).join(' ');

      // However, "title" may be narrated by screen reader:
      // - Edge
      //   - <a> will narrate "aria-label" but not "title"
      //   - <button> will narrate both "aria-label" and "title"
      // - NVDA
      //   - <a> will narrate both "aria-label" and "title"
      //   - <button> will narrate both "aria-label" and "title"

      // Title makes it very difficult to control narrations by the screen reader. Thus, we are disabling it in favor of "aria-label".
      // This will not affect our accessibility compliance but UX. We could use a non-native tooltip or other forms of visual hint.

      decoration.title = false;

      return decoration;
    });

    return Object.freeze({ __html: stripParagraphContainer(serializeDocumentFragmentIntoString(documentFragment)) });
  }, [externalLinkAlt, linkClassName, localizePlural, localizeSingular, props]);

  // eslint-disable-next-line react/no-danger
  return <span className={className} dangerouslySetInnerHTML={html} />;
};

export default memo(LocalizedString);
export { localizedStringPropsSchema, type LocalizedStringProps };
