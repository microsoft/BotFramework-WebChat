/* eslint react/no-array-index-key: "off" */

import { Components } from 'botframework-webchat-component';
import { parseProps } from 'botframework-webchat-component/internal';
import React, { memo } from 'react';
import { boolean, custom, object, optional, pipe, readonly, safeParse, string, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';

const { ImageContent, VideoContent } = Components;

const animationCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string(), ''), // TODO: Should remove default value.
    content: custom<InferInput<typeof directLineMediaCardSchema>>(
      value => safeParse(directLineMediaCardSchema, value).success
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
