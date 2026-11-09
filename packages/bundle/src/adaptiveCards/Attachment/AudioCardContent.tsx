/* eslint react/no-array-index-key: "off" */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { Components } from 'botframework-webchat-component';
import { useStyles } from 'botframework-webchat-component/internal.js';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';
import MediaList from './private/MediaList';

import styles from './AudioCardContent.module.css';

const { AudioContent } = Components;

const audioCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineMediaCardSchema,
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type AudioCardContentProps = InferReactProps<typeof audioCardContentPropsSchema>;

function AudioCardContent(props: AudioCardContentProps) {
  const { actionPerformedClassName, content, disabled, replyToId } = validateProps(audioCardContentPropsSchema, props);

  const { autostart = false, autoloop = false, image: { url: imageURL = '' } = {}, media = [], title } = content;
  const classNames = useStyles(styles);

  return (
    <div className={classNames['audio-card-attachment']}>
      <MediaList>
        {media.map(({ url }, index) => (
          <AudioContent alt={title} autoPlay={autostart} key={index} loop={autoloop} poster={imageURL} src={url} />
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

export default memo(AudioCardContent);
export { audioCardContentPropsSchema, type AudioCardContentProps };
