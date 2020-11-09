import { useMemo } from 'react';

import { concatMiddleware, defaultStyleOptions } from 'botframework-webchat-component';
import createAdaptiveCardsAttachmentForScreenReaderMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './renderMarkdown';

export default function useComposerProps({
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  renderMarkdown,
  styleOptions,
  styleSet
}) {
  const patchedAttachmentMiddleware = useMemo(
    () => concatMiddleware(attachmentMiddleware, createAdaptiveCardsAttachmentMiddleware()),
    [attachmentMiddleware]
  );

  const patchedAttachmentForScreenReaderMiddleware = useMemo(
    () =>
      concatMiddleware(attachmentForScreenReaderMiddleware, createAdaptiveCardsAttachmentForScreenReaderMiddleware()),
    [attachmentForScreenReaderMiddleware]
  );

  const patchedStyleOptions = useMemo(() => ({ ...defaultStyleOptions, ...styleOptions }), [styleOptions]);

  // When styleSet is not specified, the styleOptions will be used to create Adaptive Cards styleSet and merged into useStyleSet.
  const extraStyleSet = useMemo(() => (styleSet ? undefined : createAdaptiveCardsStyleSet(patchedStyleOptions)), [
    patchedStyleOptions,
    styleSet
  ]);

  const patchedRenderMarkdown = useMemo(
    () =>
      typeof renderMarkdown === 'undefined' ? text => defaultRenderMarkdown(text, patchedStyleOptions) : renderMarkdown,
    [patchedStyleOptions, renderMarkdown]
  );

  return {
    attachmentMiddleware: patchedAttachmentMiddleware,
    attachmentForScreenReaderMiddleware: patchedAttachmentForScreenReaderMiddleware,
    extraStyleSet,
    renderMarkdown: patchedRenderMarkdown
  };
}
