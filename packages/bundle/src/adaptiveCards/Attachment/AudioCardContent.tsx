/* eslint react/no-array-index-key: "off" */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { Components } from 'botframework-webchat-component';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';

import styles from './AudioCardContent.module.css';

const { AudioContent } = Components;

const audioCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineMediaCardSchema,
    disabled: optional(boolean())
  }),
  readonly()
);

type AudioCardContentProps = InferInput<typeof audioCardContentPropsSchema>;

function AudioCardContent(props: AudioCardContentProps) {
  const { actionPerformedClassName, content, disabled } = validateProps(audioCardContentPropsSchema, props);

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
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
}

export default memo(AudioCardContent);
export { audioCardContentPropsSchema, type AudioCardContentProps };
