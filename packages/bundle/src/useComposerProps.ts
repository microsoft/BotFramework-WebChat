import { AttachmentForScreenReaderMiddleware, AttachmentMiddleware } from 'botframework-webchat-api';
import { useMemo } from 'react';

import createAdaptiveCardsAttachmentForScreenReaderMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './markdown/renderMarkdown';

export default function useComposerProps({
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  renderMarkdown,
  styleOptions,
  styleSet
}: {
  attachmentForScreenReaderMiddleware: AttachmentForScreenReaderMiddleware[];
  attachmentMiddleware: AttachmentMiddleware[];
  renderMarkdown?: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  styleOptions: any;
  styleSet: any;
}): {
  attachmentForScreenReaderMiddleware: AttachmentForScreenReaderMiddleware[];
  attachmentMiddleware: AttachmentMiddleware[];
  renderMarkdown: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  extraStyleSet: any;
} {
  const patchedAttachmentMiddleware = useMemo(
    () => [...attachmentMiddleware, createAdaptiveCardsAttachmentMiddleware()],
    [attachmentMiddleware]
  );

  const patchedAttachmentForScreenReaderMiddleware = useMemo(
    () => [...attachmentForScreenReaderMiddleware, createAdaptiveCardsAttachmentForScreenReaderMiddleware()],
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

  return {
    attachmentForScreenReaderMiddleware: patchedAttachmentForScreenReaderMiddleware,
    attachmentMiddleware: patchedAttachmentMiddleware,
    extraStyleSet,
    renderMarkdown: patchedRenderMarkdown
  };
}
