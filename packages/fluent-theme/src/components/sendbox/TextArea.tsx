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
    font: 'inherit',
    border: 'none',
    outline: 'inherit',
    resize: 'inherit',
    gridArea: 'main',
    overflowWrap: 'anywhere',
    scrollbarGutter: 'stable'
  },

  'webchat__sendbox__text-area-doppelganger': {
    visibility: 'hidden',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap'
  },

  'webchat__sendbox__text-area-input': {
    height: '100%'
  },

  'webchat__sendbox__text-area-input--scroll': {
    /* Firefox */
    MozScrollbarWidth: 'thin',
    MozScrollbarColor: 'var(--colorNeutralBackground5) var(--colorNeutralForeground2)',

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
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    readonly className?: string | undefined;
  }
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
