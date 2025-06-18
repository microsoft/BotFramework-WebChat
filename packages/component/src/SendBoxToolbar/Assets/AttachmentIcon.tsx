import classNames from 'classnames';
import React from 'react';

import { ComponentIcon } from '../../Icon';
import { useStyleToEmotionObject } from '../../hooks/internal/styleToEmotionObject';

type Props = Readonly<{ checked: boolean }>;

const ROOT_STYLE = {
  '&.webchat__attachment-icon': {
    display: 'grid',
    gridTemplateArea: 'body',
    position: 'relative',

    '& .webchat__attachment-icon__icon': {
      gridArea: 'body'
    },

    '&:not(.webchat__attachment-icon--checked) .webchat__attachment-icon__checkmark-icon': {
      display: 'none'
    },

    // TODO: [P1] Replace the icon with a SVG that embed the checkmark directly.
    '& .webchat__attachment-icon__checkmark-icon': {
      // White border around the check icon
      border: '2px solid white',
      borderRadius: '50%',
      position: 'absolute',
      left: '45%',
      top: '50%'
    }
  }
};

const AttachmentIcon = ({ checked }: Props) => {
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      className={classNames(
        'webchat__attachment-icon',
        { 'webchat__attachment-icon--checked': checked },
        rootClassName
      )}
    >
      <ComponentIcon
        appearance="text"
        className="webchat__attachment-icon__icon"
        icon={checked ? 'attachment-checkmark' : 'attachment'}
      />
    </div>
  );
};

export default AttachmentIcon;
