import { useMemo } from 'react';

import { concatMiddleware, defaultStyleOptions } from 'botframework-webchat-component';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './renderMarkdown';

export default function useComposerProps({ attachmentMiddleware, renderMarkdown, styleOptions, styleSet }) {
  const patchedAttachmentMiddleware = useMemo(
    () => concatMiddleware(attachmentMiddleware, createAdaptiveCardsAttachmentMiddleware()),
    [attachmentMiddleware]
  );

  const patchedStyleOptions = useMemo(() => ({ ...defaultStyleOptions, ...styleOptions }), [styleOptions]);

  // When styleSet is not specified, the styleOptions will be used to create Adaptive Cards styleSet and merged into useStyleSet.
  const extraStyleSet = useMemo(() => (styleSet ? undefined : createAdaptiveCardsStyleSet(patchedStyleOptions)), [
    patchedStyleOptions,
    styleSet
  ]);

  return {
    attachmentMiddleware: patchedAttachmentMiddleware,
    extraStyleSet,
    renderMarkdown:
      typeof renderMarkdown === 'undefined' ? text => defaultRenderMarkdown(text, patchedStyleOptions) : renderMarkdown
  };
}
