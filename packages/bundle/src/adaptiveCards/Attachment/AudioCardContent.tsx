/* eslint react/no-array-index-key: "off" */

import { Components } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import type { DirectLineAudioCard } from 'botframework-webchat-core';

import CommonCard from './CommonCard';
import useStyleSet from '../../hooks/useStyleSet';

const { AudioContent } = Components;

type AudioCardContentProps = {
  actionPerformedClassName?: string;
  content: DirectLineAudioCard;
  disabled?: boolean;
};

const AudioCardContent: FC<AudioCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
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
};

AudioCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

AudioCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  content: PropTypes.shape({
    autostart: PropTypes.bool,
    autoloop: PropTypes.bool,
    image: PropTypes.shape({
      url: PropTypes.string.isRequired
    }),
    media: PropTypes.arrayOf(
      PropTypes.shape({
        url: PropTypes.string.isRequired
      }).isRequired
    ).isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default AudioCardContent;
