/* eslint react/no-array-index-key: "off" */

import { Components, hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import type { DirectLineVideoCard } from 'botframework-webchat-core';

import CommonCard from './CommonCard';

const { useStyleSet } = hooks;
const { VideoContent } = Components;

type VideoCardContentProps = {
  actionPerformedClassName?: string;
  content: DirectLineVideoCard & {
    autoloop?: boolean;
    autostart?: boolean;
    image?: { url?: string };
    media?: { profile?: string; url?: string }[];
  };
  disabled?: boolean;
};

const VideoCardContent: FC<VideoCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
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
};

VideoCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

VideoCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  content: PropTypes.shape({
    autoloop: PropTypes.bool,
    autostart: PropTypes.bool,
    image: PropTypes.shape({
      url: PropTypes.string.isRequired
    }),
    media: PropTypes.arrayOf(
      PropTypes.shape({
        profile: PropTypes.string,
        url: PropTypes.string.isRequired
      })
    ).isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default VideoCardContent;
