import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React from 'react';
import { nullish, object, pipe, readonly, string } from 'valibot';

import useStyleSet from '../hooks/useStyleSet';
import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import VideoContent from './VideoContent';

const ROOT_STYLE = {
  display: 'flex',
  flexDirection: 'column'
};

const videoAttachmentPropsSchema = pipe(
  object({
    attachment: pipe(
      object({
        contentUrl: string(),
        name: nullish(string())
      }),
      readonly()
    )
  }),
  readonly()
);

const VideoAttachment = props => {
  const { attachment } = validateProps(videoAttachmentPropsSchema, props);
  const [{ videoAttachment: videoAttachmentStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div className={classNames(rootClassName, videoAttachmentStyleSet + '')}>
      <VideoContent alt={attachment.name} src={attachment.contentUrl} />
    </div>
  );
};

export default VideoAttachment;
