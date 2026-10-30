/* eslint react/no-array-index-key: "off" */

import type { InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { Components } from 'botframework-webchat-component';
import { useStyles } from 'botframework-webchat-component/internal.js';
import React, { memo } from 'react';
import { boolean, object, optional, parse, pipe, readonly, string } from 'valibot';

import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';
import MediaList from './private/MediaList';

import styles from './VideoCardContent.module.css';

const { VideoContent } = Components;

const videoCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineMediaCardSchema,
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type VideoCardContentProps = InferReactProps<typeof videoCardContentPropsSchema>;

function VideoCardContent(props: VideoCardContentProps) {
  const { actionPerformedClassName, content, disabled, replyToId } = parse(videoCardContentPropsSchema, props);

  const { autoloop, autostart, image: { url: imageURL } = { url: undefined }, media, title } = content;
  const classNames = useStyles(styles);

  return (
    <div className={classNames['video-card-attachment']}>
      <MediaList>
        {media.map(({ url }, index) => (
          <VideoContent alt={title} autoPlay={autostart} key={index} loop={autoloop} poster={imageURL} src={url} />
        ))}
      </MediaList>
      <CommonCard
        actionPerformedClassName={actionPerformedClassName}
        content={content}
        disabled={disabled}
        replyToId={replyToId}
      />
    </div>
  );
}

export default memo(VideoCardContent);
export { videoCardContentPropsSchema, type VideoCardContentProps };
