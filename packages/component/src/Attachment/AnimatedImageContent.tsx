import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, useRef, useState, type SyntheticEvent } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useShouldReduceMotion from '../providers/ReducedMotion/useShouldReduceMotion';
import FixedWidthImage from '../Utils/FixedWidthImage';
import ActivityButton from './Text/private/ActivityButton';

import styles from './AnimatedImageContent.module.css';

const { useLocalizer } = hooks;

const animatedImageContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    src: string()
  }),
  readonly()
);

type AnimatedImageContentProps = InferInput<typeof animatedImageContentPropsSchema>;

/**
 * Shows an animated image, such as a GIF, with a button to pause and play the animation.
 *
 * Like `<img>`, the animation plays unless `autoPlay` is `false`, but not when the user prefers reduced motion.
 * While paused, the first frame is shown.
 */
function AnimatedImageContent(props: AnimatedImageContentProps) {
  const { alt, autoPlay = true, src } = validateProps(animatedImageContentPropsSchema, props);

  const [pausedByUser, setPausedByUser] = useState<boolean | undefined>();
  const [shouldReduceMotion] = useShouldReduceMotion();
  const classNames = useStyles(styles);
  const firstFrameRef = useRef<HTMLCanvasElement>(null);
  const localize = useLocalizer();

  // Until the user pauses or plays, follow `autoPlay` and the reduced motion preference.
  const paused = pausedByUser ?? (!autoPlay || shouldReduceMotion);

  // Browsers draw the first frame of an animated image onto a canvas.
  // Cross-origin images can be drawn too, only reading the pixels back is blocked.
  const handleLoad = useCallback(
    ({ currentTarget }: SyntheticEvent<HTMLImageElement>) => {
      const { current: canvas } = firstFrameRef;

      if (canvas) {
        canvas.height = currentTarget.naturalHeight;
        canvas.width = currentTarget.naturalWidth;

        canvas.getContext('2d')?.drawImage(currentTarget, 0, 0);
      }
    },
    [firstFrameRef]
  );

  const handleClick = useCallback(() => setPausedByUser(!paused), [paused, setPausedByUser]);

  return (
    <div
      className={cx(classNames['animated-image-content'], { [classNames['animated-image-content--paused']]: paused })}
    >
      <FixedWidthImage
        alt={alt || ''}
        className={classNames['animated-image-content__image']}
        onLoad={handleLoad}
        src={src}
      />
      <div className={classNames['animated-image-content__overlay']}>
        <canvas aria-hidden="true" className={classNames['animated-image-content__first-frame']} ref={firstFrameRef} />
        <ActivityButton
          aria-label={localize(paused ? 'ANIMATION_PLAY_BUTTON_ALT' : 'ANIMATION_PAUSE_BUTTON_ALT')}
          className={classNames['animated-image-content__button']}
          icon={paused ? 'play' : 'pause'}
          onClick={handleClick}
        />
      </div>
    </div>
  );
}

AnimatedImageContent.displayName = 'AnimatedImageContent';

export default memo(AnimatedImageContent);
export { animatedImageContentPropsSchema, type AnimatedImageContentProps };
