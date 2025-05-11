/* eslint react/no-array-index-key: "off" */

import { Components } from 'botframework-webchat-component';
import { parseProps } from 'botframework-webchat-component/internal';
import React, { memo } from 'react';
import { array, boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import CommonCard from './CommonCard';

const { AudioContent } = Components;

const audioCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: pipe(
      object({
        autostart: optional(boolean()),
        autoloop: optional(boolean()),
        image: optional(object({ url: string() })),
        media: pipe(array(object({ url: string() })), readonly())
      }),
      readonly()
    ),
    disabled: boolean()
  }),
  readonly()
);

type AudioCardContentProps = InferInput<typeof audioCardContentPropsSchema>;

function AudioCardContent(props: AudioCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parseProps(audioCardContentPropsSchema, props);

  const [{ audioCardAttachment: audioCardAttachmentStyleSet }] = useStyleSet();
  const { autostart = false, autoloop = false, image: { url: imageURL = '' } = {}, media = [] } = content;

  return (
    <div className={audioCardAttachmentStyleSet}>
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
