/* eslint react/no-array-index-key: "off" */

import { Components } from 'botframework-webchat-component';
import { parseProps } from 'botframework-webchat-component/internal';
import React, { memo } from 'react';
import { array, boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import CommonCard from './CommonCard';

const { ImageContent, VideoContent } = Components;

const animationCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: pipe(
      object({
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

type AnimationCardContentProps = InferInput<typeof animationCardContentPropsSchema>;

function AnimationCardContent(props: AnimationCardContentProps) {
  const { actionPerformedClassName, content, disabled } = parseProps(animationCardContentPropsSchema, props);

  const { media = [] } = content;
  const [{ animationCardAttachment: animationCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={animationCardAttachmentStyleSet}>
      <ul className="media-list">
        {media.map(({ profile = '', url }, index) => (
          <li key={index}>
            {/\.gif$/iu.test(url) ? <ImageContent alt={profile} src={url} /> : <VideoContent alt={profile} src={url} />}
          </li>
        ))}
      </ul>
      <CommonCard actionPerformedClassName={actionPerformedClassName} content={content} disabled={disabled} />
    </div>
  );
}

export default memo(AnimationCardContent);
export { animationCardContentPropsSchema, type AnimationCardContentProps };
