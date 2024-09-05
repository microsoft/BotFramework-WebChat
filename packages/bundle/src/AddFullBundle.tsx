import {
  type AttachmentForScreenReaderMiddleware,
  type AttachmentMiddleware,
  type StyleOptions
} from 'botframework-webchat-api';
import { singleToArray, warnOnce, type OneOrMany } from 'botframework-webchat-core';
import React, { type ReactNode } from 'react';

import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import { type AdaptiveCardsStyleOptions } from './adaptiveCards/AdaptiveCardsStyleOptions';
import { type AdaptiveCardsPackage } from './types/AdaptiveCardsPackage';
import { type StrictFullBundleStyleOptions } from './types/FullBundleStyleOptions';
import useComposerProps from './useComposerProps';

type AddFullBundleProps = Readonly<{
  adaptiveCardsHostConfig?: any;
  adaptiveCardsPackage?: AdaptiveCardsPackage;
  attachmentForScreenReaderMiddleware?: OneOrMany<AttachmentForScreenReaderMiddleware>;
  attachmentMiddleware?: OneOrMany<AttachmentMiddleware>;
  children: ({ extraStyleSet }: { extraStyleSet: any }) => ReactNode;
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

const AddFullBundle = ({
  adaptiveCardHostConfig,
  adaptiveCardsHostConfig = undefined,
  adaptiveCardsPackage = undefined,
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  children = undefined,
  renderMarkdown,
  styleOptions,
  styleSet
}: AddFullBundleProps) => {
  adaptiveCardHostConfig && adaptiveCardHostConfigDeprecation();

  const patchedProps = useComposerProps({
    attachmentForScreenReaderMiddleware: singleToArray(attachmentForScreenReaderMiddleware),
    attachmentMiddleware: singleToArray(attachmentMiddleware),
    renderMarkdown,
    styleOptions,
    styleSet
  });

  return (
    <AdaptiveCardsComposer
      adaptiveCardsHostConfig={adaptiveCardHostConfig || adaptiveCardsHostConfig}
      adaptiveCardsPackage={adaptiveCardsPackage}
    >
      {children(patchedProps)}
    </AdaptiveCardsComposer>
  );
};

export default AddFullBundle;

export type { AddFullBundleProps };
