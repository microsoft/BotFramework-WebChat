import classNames from 'classnames';
import React from 'react';

import useStyleToEmotionObject from '../../hooks/internal/useStyleToEmotionObject';

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
      <svg
        className="webchat__attachment-icon__icon"
        focusable={false}
        height={28}
        role="presentation"
        viewBox="0 0 25.75 46"
        width={28}
      >
        <path
          clipRule="evenodd"
          d="M20.75 11.75v21.37a7.69 7.69 0 0 1-.62 3.07 7.95 7.95 0 0 1-4.19 4.19 7.89 7.89 0 0 1-6.13 0 7.95 7.95 0 0 1-4.19-4.19 7.69 7.69 0 0 1-.62-3.07v-22.5a5.27 5.27 0 0 1 .45-2.17 5.69 5.69 0 0 1 3-3 5.48 5.48 0 0 1 4.35 0 5.69 5.69 0 0 1 3 3 5.27 5.27 0 0 1 .45 2.17v22.5a3.41 3.41 0 0 1-.26 1.32 3.31 3.31 0 0 1-1.8 1.8 3.46 3.46 0 0 1-2.63 0 3.31 3.31 0 0 1-1.8-1.8 3.41 3.41 0 0 1-.26-1.32V14h2.25v19.12a1.13 1.13 0 1 0 2.25 0v-22.5a3.4 3.4 0 0 0-.26-1.31 3.31 3.31 0 0 0-1.8-1.8 3.46 3.46 0 0 0-2.63 0 3.31 3.31 0 0 0-1.8 1.8 3.4 3.4 0 0 0-.26 1.31v22.5a5.32 5.32 0 0 0 .45 2.18 5.69 5.69 0 0 0 3 3 5.48 5.48 0 0 0 4.35 0 5.69 5.69 0 0 0 3-3 5.32 5.32 0 0 0 .45-2.18v-21.37z"
        />
      </svg>
      <svg
        className="webchat__attachment-icon__icon webchat__attachment-icon__checkmark-icon"
        focusable={false}
        height={10}
        role="presentation"
        viewBox="0 0 10 10"
        width={10}
      >
        <path d="M5 10C7.76142 10 10 7.76142 10 5C10 2.23858 7.76142 0 5 0C2.23858 0 0 2.23858 0 5C0 7.76142 2.23858 10 5 10ZM7.10356 4.10355L4.85357 6.35356C4.65831 6.54883 4.34173 6.54883 4.14646 6.35357L3.14645 5.35357C2.95119 5.1583 2.95118 4.84172 3.14644 4.64646C3.34171 4.45119 3.65829 4.45119 3.85355 4.64645L4.50001 5.29291L6.39644 3.39645C6.59171 3.20119 6.90829 3.20118 7.10355 3.39644C7.29881 3.59171 7.29882 3.90829 7.10356 4.10355Z" />
      </svg>
    </div>
  );
};

export default AttachmentIcon;
