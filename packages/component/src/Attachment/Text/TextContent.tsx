import React, { memo, useMemo } from 'react';
import classNames from 'classnames';
import { hooks } from 'botframework-webchat-api';
import { type WebChatActivity } from 'botframework-webchat-core';

import isAIGeneratedActivity from './private/isAIGeneratedActivity';
import MarkdownTextContent from './private/MarkdownTextContent';
import PlainTextContent from './private/PlainTextContent';
import CustomPropertyNames from '../../Styles/CustomPropertyNames';
import useStyleToEmotionObject from '../../hooks/internal/useStyleToEmotionObject';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';

const { useLocalizer } = hooks;

type Props = Readonly<{
  activity: WebChatActivity;
  contentType?: string;
  text: string;
}>;

const generatedBadgeStyle = {
  '&.webchat__text-content__generated-badge': {
    fontSize: `var(${CustomPropertyNames.FontSizeSmall})`,
    color: `var(${CustomPropertyNames.ColorSubtle})`
  }
};

const TextContent = memo(({ activity, contentType = 'text/plain', text }: Props) => {
  const supportMarkdown = !!useRenderMarkdownAsHTML('message activity');
  const localize = useLocalizer();
  const generatedBadgeClassName = useStyleToEmotionObject()(generatedBadgeStyle) + '';

  const generatedBadge = useMemo(
    () =>
      isAIGeneratedActivity(activity) && (
        <div className={classNames('webchat__text-content__generated-badge', generatedBadgeClassName)}>
          {localize('ACTIVITY_CONTENT_CAUTION')}
        </div>
      ),
    [activity, generatedBadgeClassName, localize]
  );

  return text ? (
    contentType === 'text/markdown' && supportMarkdown ? (
      <MarkdownTextContent activity={activity} markdown={text}>
        {generatedBadge}
      </MarkdownTextContent>
    ) : (
      <PlainTextContent text={text}>{generatedBadge}</PlainTextContent>
    )
  ) : null;
});

TextContent.displayName = 'TextContent';

export default TextContent;
