import cx from 'classnames';
import React, { type TextareaHTMLAttributes, forwardRef } from 'react';
import { useStyles } from '../../styles';

const styles = {
  'webchat__sendbox__text-area': {
    display: 'grid',
    gridTemplateAreas: `'main'`,
    maxHeight: '200px',
    overflow: 'hidden'
  },

  'webchat__sendbox__text-area-shared': {
    border: 'none',
    font: 'inherit',
    gridArea: 'main',
    outline: 'inherit',
    overflowWrap: 'anywhere',
    resize: 'inherit',
    scrollbarGutter: 'stable'
  },

  'webchat__sendbox__text-area-doppelganger': {
    overflow: 'hidden',
    visibility: 'hidden',
    whiteSpace: 'pre-wrap'
  },

  'webchat__sendbox__text-area-input': {
    height: '100%'
  },

  'webchat__sendbox__text-area-input--scroll': {
    /* Firefox */
    MozScrollbarColor: 'var(--colorNeutralBackground5) var(--colorNeutralForeground2)',
    MozScrollbarWidth: 'thin',

    /* Chrome, Edge, and Safari */
    '&::-webkit-scrollbar': {
      width: '8px'
    },

    '&::-webkit-scrollbar-track': {
      backgroundColor: ' var(--colorNeutralBackground5)',
      borderRadius: '16px'
    },

    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'var(--colorNeutralForeground2)',
      borderRadius: '16px'
    },

    '&::-webkit-scrollbar-corner': {
      backgroundColor: 'var(--colorNeutralBackground5)'
    }
  }
};

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  Readonly<
    TextareaHTMLAttributes<HTMLTextAreaElement> & {
      readonly className?: string | undefined;
    }
  >
>((props, ref) => {
  const classNames = useStyles(styles);
  return (
    <div className={cx(classNames['webchat__sendbox__text-area'], props.className)}>
      <div
        className={cx(
          classNames['webchat__sendbox__text-area-doppelganger'],
          classNames['webchat__sendbox__text-area-shared']
        )}
      >
        {props.value || props.placeholder}{' '}
      </div>
      <textarea
        {...props}
        className={cx(
          classNames['webchat__sendbox__text-area-input'],
          classNames['webchat__sendbox__text-area-shared'],
          classNames['webchat__sendbox__text-area-input--scroll']
        )}
        ref={ref}
      />
    </div>
  );
});
