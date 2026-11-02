import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React from 'react';
import { object, pipe, readonly, string } from 'valibot';

const { useLocalizer } = hooks;

const textAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(object({ content: string() }), readonly())
  }),
  readonly()
);

const TextAttachment = props => {
  const { attachment: { content = '' } = {} } = validateProps(textAttachmentPropsSchema, props);
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_TEXT', content);

  return <div role="none">{label}</div>;
};

export default TextAttachment;
