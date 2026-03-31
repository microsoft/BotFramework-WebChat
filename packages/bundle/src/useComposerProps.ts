import { AttachmentForScreenReaderMiddleware, AttachmentMiddleware, Polymiddleware } from 'botframework-webchat-api';
import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';
import { useMemo } from 'react';

import createAdaptiveCardsAttachmentForScreenReaderMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import createDefaultHeroCardPolymiddleware from './heroCard/createDefaultHeroCardPolymiddleware';
import createHTMLContentTransformMiddleware from './markdown/createHTMLContentTransformMiddleware';
import defaultRenderMarkdown from './markdown/renderMarkdown';

export default function useComposerProps({
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  htmlContentTransformMiddleware,
  renderMarkdown,
  styleOptions,
  styleSet
}: Readonly<{
  attachmentForScreenReaderMiddleware: readonly AttachmentForScreenReaderMiddleware[] | undefined;
  attachmentMiddleware: readonly AttachmentMiddleware[] | undefined;
  htmlContentTransformMiddleware: readonly HTMLContentTransformMiddleware[];
  renderMarkdown?: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  styleOptions: any;
  styleSet: any;
}>): Readonly<{
  attachmentForScreenReaderMiddleware: AttachmentForScreenReaderMiddleware[];
  attachmentMiddleware: AttachmentMiddleware[];
  extraStyleSet: any;
  htmlContentTransformMiddleware: readonly HTMLContentTransformMiddleware[];
  polymiddleware: readonly Polymiddleware[];
  renderMarkdown: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
}> {
  const patchedAttachmentMiddleware = useMemo(
    () => [...(attachmentMiddleware ?? []), createAdaptiveCardsAttachmentMiddleware()],
    [attachmentMiddleware]
  );

  const patchedAttachmentForScreenReaderMiddleware = useMemo(
    () => [...(attachmentForScreenReaderMiddleware ?? []), createAdaptiveCardsAttachmentForScreenReaderMiddleware()],
    [attachmentForScreenReaderMiddleware]
  );

  // When styleSet is not specified, the styleOptions will be used to create Adaptive Cards styleSet and merged into useStyleSet.
  const extraStyleSet = useMemo(
    () => (styleSet ? undefined : createAdaptiveCardsStyleSet(styleOptions)),
    [styleOptions, styleSet]
  );

  const patchedRenderMarkdown = useMemo(
    () => (typeof renderMarkdown === 'undefined' ? defaultRenderMarkdown : renderMarkdown),
    [renderMarkdown]
  );

  const patchedHTMLContentTransformMiddleware = useMemo<readonly HTMLContentTransformMiddleware[]>(
    () => Object.freeze([...(htmlContentTransformMiddleware || []), ...createHTMLContentTransformMiddleware()]),
    [htmlContentTransformMiddleware]
  );

  const polymiddleware = useMemo<readonly Polymiddleware[]>(
    () => Object.freeze([createDefaultHeroCardPolymiddleware()]),
    []
  );

  return Object.freeze({
    attachmentForScreenReaderMiddleware: patchedAttachmentForScreenReaderMiddleware,
    attachmentMiddleware: patchedAttachmentMiddleware,
    extraStyleSet,
    htmlContentTransformMiddleware: patchedHTMLContentTransformMiddleware,
    polymiddleware,
    renderMarkdown: patchedRenderMarkdown
  });
}
