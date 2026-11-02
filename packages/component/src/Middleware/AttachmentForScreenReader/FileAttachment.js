import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React from 'react';
import { object, pipe, readonly, string } from 'valibot';

const { useLocalizer } = hooks;

const fileAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(object({ name: string() }), readonly())
  }),
  readonly()
);

const FileAttachment = props => {
  const { attachment: { name = '' } = {} } = validateProps(fileAttachmentPropsSchema, props);
  const localize = useLocalizer();

  const label = localize('ATTACHMENT_FILE', name);

  return <div role="none">{label}</div>;
};

export default FileAttachment;
