import { useMemo } from 'react';

import { concatMiddleware } from 'botframework-webchat-component';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './renderMarkdown';

export default function useComposerProps({ attachmentMiddleware, renderMarkdown, styleOptions, styleSet }) {
  const patchedAttachmentMiddleware = useMemo(
    () => concatMiddleware(attachmentMiddleware, createAdaptiveCardsAttachmentMiddleware()),
    [attachmentMiddleware]
  );

  // When styleSet is not specified, the styleOptions will be used to create Adaptive Cards styleSet and merged into useStyleSet.
  const extraStyleSet = useMemo(() => (styleSet ? undefined : createAdaptiveCardsStyleSet(styleOptions)), [
    styleOptions
  ]);

  return {
    attachmentMiddleware: patchedAttachmentMiddleware,
    extraStyleSet,
    renderMarkdown: renderMarkdown || (text => defaultRenderMarkdown(text, styleOptions))
  };
}
