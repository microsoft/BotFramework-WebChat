import {
  type AttachmentForScreenReaderMiddleware,
  type AttachmentMiddleware,
  type StyleOptions
} from 'botframework-webchat-api';
import { type HTMLContentTransformMiddleware } from 'botframework-webchat-component';
import { singleToArray, warnOnce, type OneOrMany } from 'botframework-webchat-core';
import React, { memo, type ReactNode } from 'react';

import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import { type AdaptiveCardsStyleOptions } from './adaptiveCards/AdaptiveCardsStyleOptions';
import ShikiComposer from './codeHighlighter/ShikiComposer';
import { type AdaptiveCardsPackage } from './types/AdaptiveCardsPackage';
import { type StrictFullBundleStyleOptions } from './types/FullBundleStyleOptions';
import useComposerProps from './useComposerProps';

type AddFullBundleProps = Readonly<{
  adaptiveCardsHostConfig?: any;
  adaptiveCardsPackage?: AdaptiveCardsPackage;
  attachmentForScreenReaderMiddleware?: OneOrMany<AttachmentForScreenReaderMiddleware>;
  attachmentMiddleware?: OneOrMany<AttachmentMiddleware>;
  children: ({ extraStyleSet }: { extraStyleSet: any }) => ReactNode;
  htmlContentTransformMiddleware?: HTMLContentTransformMiddleware[];
  renderMarkdown?: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  styleOptions?: StyleOptions & AdaptiveCardsStyleOptions;
  styleSet?: any & { options: StrictFullBundleStyleOptions };

  /** @deprecated Rename to "adaptiveCardsHostConfig" */
  adaptiveCardHostConfig?: any;
}>;

const adaptiveCardHostConfigDeprecation = warnOnce(
  '"adaptiveCardHostConfig" is deprecated. Please use "adaptiveCardsHostConfig" instead. "adaptiveCardHostConfig" will be removed on or after 2022-01-01.'
);

function AddFullBundle({
  adaptiveCardHostConfig,
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  children,
  htmlContentTransformMiddleware,
  renderMarkdown,
  styleOptions,
  styleSet
}: AddFullBundleProps) {
  adaptiveCardHostConfig && adaptiveCardHostConfigDeprecation();

  const patchedProps = useComposerProps({
    attachmentForScreenReaderMiddleware: singleToArray(attachmentForScreenReaderMiddleware),
    attachmentMiddleware: singleToArray(attachmentMiddleware),
    htmlContentTransformMiddleware,
    renderMarkdown,
    styleOptions,
    styleSet
  });

  return (
    <ShikiComposer>
      <AdaptiveCardsComposer
        adaptiveCardsHostConfig={adaptiveCardHostConfig || adaptiveCardsHostConfig}
        adaptiveCardsPackage={adaptiveCardsPackage}
      >
        {children(patchedProps)}
      </AdaptiveCardsComposer>
    </ShikiComposer>
  );
}

export default memo(AddFullBundle);

export type { AddFullBundleProps };
