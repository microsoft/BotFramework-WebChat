import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useMemo } from 'react';

import { any, object, optional, pipe, readonly, string, type InferInput } from 'valibot';
import { useStyleToEmotionObject } from '../../hooks/internal/styleToEmotionObject';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';
import CustomPropertyNames from '../../Styles/CustomPropertyNames';
import isAIGeneratedActivity from './private/isAIGeneratedActivity';
import MarkdownTextContent from './private/MarkdownTextContent';
import PlainTextContent from './private/PlainTextContent';

const { useLocalizer } = hooks;

const textContentPropsSchema = pipe(
  object({
    activity: any(),
    contentType: optional(string()),
    text: string()
  }),
  readonly()
);

type TextContentProps = InferInput<typeof textContentPropsSchema>;

const generatedBadgeStyle = {
  '&.webchat__text-content__generated-badge': {
    color: `var(${CustomPropertyNames.ColorSubtle})`,
    fontSize: `var(${CustomPropertyNames.FontSizeSmall})`
  }
};

function TextContent(props: TextContentProps) {
  const { activity, contentType = 'text/plain', text } = validateProps(textContentPropsSchema, props);

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
}

export default memo(TextContent);
export { textContentPropsSchema, type TextContentProps };
