import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

import AudioContent from './AudioContent';
import useStyleSet from '../hooks/useStyleSet';

const audioAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        contentUrl: string(),
        name: optional(string())
      }),
      readonly()
    )
  }),
  readonly()
);

const AudioAttachment = props => {
  const { attachment } = validateProps(audioAttachmentPropsSchema, props);

  const [{ audioAttachment: audioAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={audioAttachmentStyleSet}>
      <AudioContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

export default AudioAttachment;
