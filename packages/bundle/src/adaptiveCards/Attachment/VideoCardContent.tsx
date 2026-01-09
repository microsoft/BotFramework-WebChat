/* eslint react/no-array-index-key: "off" */

import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { Components } from 'botframework-webchat-component';
import React, { memo } from 'react';
import { boolean, object, optional, parse, pipe, readonly, string, type InferInput } from 'valibot';

import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';

import styles from './VideoCardContent.module.css';

const { VideoContent } = Components;

const videoCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineMediaCardSchema,
    disabled: optional(boolean())
  }),
  readonly()
);

type VideoCardContentProps = InferInput<typeof videoCardContentPropsSchema>;

function VideoCardContent(props: VideoCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parse(videoCardContentPropsSchema, props);

  const { autoloop, autostart, image: { url: imageURL } = { url: undefined }, media } = content;
  const classNames = useStyles(styles);

  return (
    <div className={classNames['video-card-attachment']}>
      <ul className="media-list">
        {media.map(({ url }, index) => (
          <li key={index}>
            <VideoContent autoPlay={autostart} loop={autoloop} poster={imageURL} src={url} />
          </li>
        ))}
      </ul>
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
}

export default memo(VideoCardContent);
export { videoCardContentPropsSchema, type VideoCardContentProps };
