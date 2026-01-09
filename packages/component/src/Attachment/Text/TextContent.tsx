import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import React, { memo, useMemo } from 'react';

import { any, object, optional, pipe, readonly, string, type InferInput } from 'valibot';
import useRenderMarkdownAsHTML from '../../hooks/useRenderMarkdownAsHTML';
import isAIGeneratedActivity from './private/isAIGeneratedActivity';
import MarkdownTextContent from './private/MarkdownTextContent';
import PlainTextContent from './private/PlainTextContent';

import styles from './TextContent.module.css';

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

function TextContent(props: TextContentProps) {
  const { activity, contentType = 'text/plain', text } = validateProps(textContentPropsSchema, props);

  const classNames = useStyles(styles);
  const supportMarkdown = !!useRenderMarkdownAsHTML('message activity');
  const localize = useLocalizer();

  const generatedBadge = useMemo(
    () =>
      isAIGeneratedActivity(activity) && (
        <div className={classNames['text-content__generated-badge']}>{localize('ACTIVITY_CONTENT_CAUTION')}</div>
      ),
    [activity, classNames, localize]
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
