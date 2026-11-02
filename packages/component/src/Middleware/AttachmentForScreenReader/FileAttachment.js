import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-api';
import React from 'react';
import { nullish, object, pipe, readonly, string } from 'valibot';

const { useLocalizer } = hooks;

const fileAttachmentPropsSchema = pipe(
  object({
    // Required, but has default values.
    attachment: nullish(pipe(object({ name: nullish(string()) }), readonly()))
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
