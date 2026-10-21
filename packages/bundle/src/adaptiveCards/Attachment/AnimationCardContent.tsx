/* eslint react/no-array-index-key: "off" */

import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { Components } from 'botframework-webchat-component';
import { onErrorResumeNext } from 'botframework-webchat-core';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import AnimatedImageContent from './AnimatedImageContent';
import styles from './AnimationCardContent.module.css';
import CommonCard from './CommonCard';
import { directLineMediaCardSchema } from './private/directLineSchema';
import MediaList from './private/MediaList';

const { VideoContent } = Components;

// Image formats that browsers animate in <img>, by file extension, or by media type for data: URLs.
const IMAGE_EXTENSION_PATTERN = /\.(?:apng|avif|gif|png|webp)$/iu;
const IMAGE_MEDIA_TYPE_PATTERN = /^image\/(?:apng|avif|gif|png|webp)[,;]/iu;

// Animation cards declare their media as animated, so every image is played as an animated image.
function isImageURL(url: string): boolean {
  // Only the path is checked, so URLs with a query or a fragment, such as signed URLs, are recognized.
  // Relative URLs are resolved against a placeholder origin, only their path is used.
  const parsedURL = onErrorResumeNext(() => new URL(url, 'https://localhost/'));

  return parsedURL?.protocol === 'data:'
    ? IMAGE_MEDIA_TYPE_PATTERN.test(parsedURL.pathname)
    : IMAGE_EXTENSION_PATTERN.test(parsedURL?.pathname || '');
}

const animationCardContentPropsSchema = pipe(
  object({
    actionPerformedClassName: optional(string()),
    content: directLineMediaCardSchema,
    disabled: optional(boolean()),
    replyToId: optional(string())
  }),
  readonly()
);

type AnimationCardContentProps = InferReactProps<typeof animationCardContentPropsSchema>;

function AnimationCardContent(props: AnimationCardContentProps) {
  const { actionPerformedClassName, content, disabled, replyToId } = validateProps(
    animationCardContentPropsSchema,
    props
  );

  const { media = [], title } = content;
  const classNames = useStyles(styles);

  return (
    <div className={classNames['animation-card-attachment']}>
      <MediaList>
        {media.map(({ profile = '', url }, index) =>
          isImageURL(url) ? (
            <AnimatedImageContent alt={profile} autoPlay={content.autostart !== false} key={index} src={url} />
          ) : (
            <VideoContent alt={profile || title} autoPlay={content.autostart} key={index} src={url} />
          )
        )}
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

AnimationCardContent.displayName = 'AnimationCardContent';

export default memo(AnimationCardContent);
export { animationCardContentPropsSchema, type AnimationCardContentProps };
