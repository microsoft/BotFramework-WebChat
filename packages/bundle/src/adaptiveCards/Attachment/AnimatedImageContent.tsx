import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { hooks } from 'botframework-webchat-component';
import { ActivityButton, FixedWidthImage, useStyles } from 'botframework-webchat-component/internal.js';
import cx from 'classnames';
import React, { memo, useCallback, useRef, useState, type SyntheticEvent } from 'react';
import { boolean, object, optional, pipe, readonly, string } from 'valibot';

import styles from './AnimatedImageContent.module.css';

const { useLocalizer, useShouldReduceMotion } = hooks;

const animatedImageContentPropsSchema = pipe(
  object({
    alt: optional(string()),
    autoPlay: optional(boolean()),
    src: string()
  }),
  readonly()
);

type AnimatedImageContentProps = InferReactProps<typeof animatedImageContentPropsSchema>;

/**
 * Shows an animated image, such as a GIF, with a button to pause and play the animation.
 *
 * Like `<img>`, the animation plays unless `autoPlay` is `false`, but not when the user prefers reduced motion.
 * While paused, the first frame is shown. If the image fails to load, it is shown as is, without the button.
 */
function AnimatedImageContent(props: AnimatedImageContentProps) {
  const { alt, autoPlay = true, src } = validateProps(animatedImageContentPropsSchema, props);

  const [failedToLoad, setFailedToLoad] = useState(false);
  const [pausedByUser, setPausedByUser] = useState<boolean | undefined>();
  const [shouldReduceMotion] = useShouldReduceMotion();
  const classNames = useStyles(styles);
  const firstFrameRef = useRef<HTMLCanvasElement>(null);
  const localize = useLocalizer();

  // Until the user pauses or plays, follow `autoPlay` and the reduced motion preference.
  const paused = pausedByUser ?? (!autoPlay || shouldReduceMotion);

  const handleError = useCallback(() => setFailedToLoad(true), [setFailedToLoad]);

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

      setFailedToLoad(false);
    },
    [firstFrameRef, setFailedToLoad]
  );

  const handleClick = useCallback(() => setPausedByUser(!paused), [paused, setPausedByUser]);

  return (
    <div
      className={cx(classNames['animated-image-content'], {
        // An image that failed to load is shown as is.
        [classNames['animated-image-content--paused']]: paused && !failedToLoad
      })}
    >
      <FixedWidthImage
        alt={alt || ''}
        className={classNames['animated-image-content__image']}
        onError={handleError}
        onLoad={handleLoad}
        src={src}
      />
      <div className={classNames['animated-image-content__overlay']}>
        <canvas aria-hidden="true" className={classNames['animated-image-content__first-frame']} ref={firstFrameRef} />
        {!failedToLoad && (
          <ActivityButton
            aria-label={localize(paused ? 'ANIMATION_PLAY_BUTTON_ALT' : 'ANIMATION_PAUSE_BUTTON_ALT')}
            className={classNames['animated-image-content__button']}
            icon={paused ? 'play' : 'pause'}
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  );
}

AnimatedImageContent.displayName = 'AnimatedImageContent';

export default memo(AnimatedImageContent);
export { animatedImageContentPropsSchema, type AnimatedImageContentProps };
