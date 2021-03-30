import { concatMiddleware } from 'botframework-webchat-component';
import { useMemo } from 'react';

import createAdaptiveCardsAttachmentForScreenReaderMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentForScreenReaderMiddleware';
import createAdaptiveCardsAttachmentMiddleware from './adaptiveCards/createAdaptiveCardsAttachmentMiddleware';
import createAdaptiveCardsStyleSet from './adaptiveCards/Styles/createAdaptiveCardsStyleSet';
import defaultRenderMarkdown from './renderMarkdown';
import fullBundleDefaultStyleOptions from './fullBundleDefaultStyleOptions';

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

  // TODO: [P1] We should let <API.Composer> to patch the style options.
  //       Bundle should not know how API patch the style options and should not patch it for API.
  //       "createAdaptiveCardsStyleSet" need a patched style options, e.g. default color of accent.
  const patchedStyleOptions = useMemo(() => ({ ...fullBundleDefaultStyleOptions, ...styleOptions }), [styleOptions]);

  // When styleSet is not specified, the styleOptions will be used to create Adaptive Cards styleSet and merged into useStyleSet.
  const extraStyleSet = useMemo(() => (styleSet ? undefined : createAdaptiveCardsStyleSet(patchedStyleOptions)), [
    patchedStyleOptions,
    styleSet
  ]);

  const patchedRenderMarkdown = useMemo(
    () => (typeof renderMarkdown === 'undefined' ? (...args) => defaultRenderMarkdown(...args) : renderMarkdown),
    [renderMarkdown]
  );

  return {
    attachmentMiddleware: patchedAttachmentMiddleware,
    attachmentForScreenReaderMiddleware: patchedAttachmentForScreenReaderMiddleware,
    extraStyleSet,
    renderMarkdown: patchedRenderMarkdown,
    styleOptions: patchedStyleOptions
  };
}
