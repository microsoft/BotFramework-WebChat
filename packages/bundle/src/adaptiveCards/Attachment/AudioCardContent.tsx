/* eslint react/no-array-index-key: "off" */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { Components } from 'botframework-webchat-component';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import styles from './AudioCardContent.module.css';
import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';

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

  const { autostart = false, autoloop = false, image: { url: imageURL = '' } = {}, media = [] } = content;
  const classNames = useStyles(styles);

  return (
    <div className={classNames['audio-card-attachment']}>
      <ul className="media-list">
        {media.map(({ url }, index) => (
          <li key={index}>
            <AudioContent autoPlay={autostart} loop={autoloop} poster={imageURL} src={url} />
          </li>
        ))}
      </ul>
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
