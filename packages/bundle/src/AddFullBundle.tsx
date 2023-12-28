import {
  type AttachmentForScreenReaderMiddleware,
  type AttachmentMiddleware,
  type StyleOptions
} from 'botframework-webchat-api';
import { type OneOrMany, singleToArray, warnOnce } from 'botframework-webchat-core';
import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import { type StrictFullBundleStyleOptions } from './types/FullBundleStyleOptions';
import AdaptiveCardsComposer from './adaptiveCards/AdaptiveCardsComposer';
import type AdaptiveCardsPackage from './types/AdaptiveCardsPackage';
import type AdaptiveCardsStyleOptions from './adaptiveCards/AdaptiveCardsStyleOptions';
import useComposerProps from './useComposerProps';

type AddFullBundleProps = Readonly<{
  adaptiveCardsHostConfig?: any;
  adaptiveCardsPackage?: Readonly<AdaptiveCardsPackage>;
  attachmentForScreenReaderMiddleware?: OneOrMany<AttachmentForScreenReaderMiddleware>;
  attachmentMiddleware?: OneOrMany<AttachmentMiddleware>;
  children: ({ extraStyleSet }: { extraStyleSet: any }) => ReactNode;
  renderMarkdown?: (
    markdown: string,
    newLineOptions: { markdownRespectCRLF: boolean },
    linkOptions: { externalLinkAlt: string }
  ) => string;
  styleOptions?: Readonly<StyleOptions & AdaptiveCardsStyleOptions>;
  styleSet?: any & Readonly<{ options: StrictFullBundleStyleOptions }>;

  /** @deprecated Rename to "adaptiveCardsHostConfig" */
  adaptiveCardHostConfig?: any;
}>;

const adaptiveCardHostConfigDeprecation = warnOnce(
  '"adaptiveCardHostConfig" is deprecated. Please use "adaptiveCardsHostConfig" instead. "adaptiveCardHostConfig" will be removed on or after 2022-01-01.'
);

const AddFullBundle = ({
  adaptiveCardHostConfig,
  adaptiveCardsHostConfig,
  adaptiveCardsPackage,
  attachmentForScreenReaderMiddleware,
  attachmentMiddleware,
  children,
  renderMarkdown,
  styleOptions,
  styleSet
}: AddFullBundleProps): ReactNode => {
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

AddFullBundle.defaultProps = {
  adaptiveCardHostConfig: undefined,
  adaptiveCardsHostConfig: undefined,
  adaptiveCardsPackage: undefined,
  attachmentForScreenReaderMiddleware: undefined,
  attachmentMiddleware: undefined,
  renderMarkdown: undefined,
  styleOptions: undefined,
  styleSet: undefined
};

AddFullBundle.propTypes = {
  adaptiveCardHostConfig: PropTypes.any,
  adaptiveCardsHostConfig: PropTypes.any,
  // TypeScript class is not mappable to PropTypes.func
  // @ts-ignore
  adaptiveCardsPackage: PropTypes.shape({
    AdaptiveCard: PropTypes.func.isRequired,
    HorizontalAlignment: PropTypes.any.isRequired,
    TextSize: PropTypes.any.isRequired,
    TextWeight: PropTypes.any.isRequired
  }),
  attachmentForScreenReaderMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  attachmentMiddleware: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.func), PropTypes.func]),
  children: PropTypes.func.isRequired,
  renderMarkdown: PropTypes.func,
  styleOptions: PropTypes.any,
  styleSet: PropTypes.any
};

export default AddFullBundle;

export type { AddFullBundleProps };
