/* eslint react/no-array-index-key: "off" */

import { Components, hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import type { DirectLineAnimationCard } from 'botframework-webchat-core';

import CommonCard from './CommonCard';

const { ImageContent, VideoContent } = Components;
const { useStyleSet } = hooks;

type AnimationCardContentProps = {
  actionPerformedClassName?: string;
  content: DirectLineAnimationCard;
  disabled?: boolean;
};

const AnimationCardContent: FC<AnimationCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
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
};

AnimationCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

AnimationCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  content: PropTypes.shape({
    media: PropTypes.arrayOf(
      PropTypes.shape({
        profile: PropTypes.string,
        url: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default AnimationCardContent;
