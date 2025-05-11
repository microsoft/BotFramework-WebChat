/* eslint react/no-array-index-key: "off" */

import { Components } from 'botframework-webchat-component';
import React, { memo } from 'react';
import { array, boolean, object, optional, parse, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import CommonCard from './CommonCard';

const { VideoContent } = Components;

const videoCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: pipe(
      object({
        autoloop: optional(boolean()),
        autostart: optional(boolean()),
        image: optional(pipe(object({ url: string() }), readonly())),
        media: pipe(
          array(
            pipe(
              object({
                profile: optional(string()),
                url: string()
              }),
              readonly()
            )
          ),
          readonly()
        )
      }),
      readonly()
    ),
    disabled: optional(boolean())
  }),
  readonly()
);

type VideoCardContentProps = InferInput<typeof videoCardContentPropsSchema>;

function VideoCardContent(props: VideoCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parse(videoCardContentPropsSchema, props);

  const { autoloop, autostart, image: { url: imageURL } = { url: undefined }, media } = content;
  const [{ audioCardAttachment: audioCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={audioCardAttachmentStyleSet}>
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
