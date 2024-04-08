import type { DirectLineCardAction } from 'botframework-webchat-core';
import { useStyles } from '../../styles';
import React from 'react';

const styles = {
  'webchat__sendbox__suggested-actions': {
    display: 'flex',
    alignSelf: 'flex-end',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '8px',
    paddingInlineStart: '4px',
    paddingBlockEnd: '8px'
  },

  webchat__sendbox__action: {
    padding: '6px 8px 4px',
    border: '1px solid var(--colorBrandStroke2)',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'start',
    fontSize: '12px',
    lineHeight: '12px',
    background: 'transparent'
  }
};

// TODO: this is a stub for actions. We must reuse the existing SuggestedActions implementation
export function SuggestedActions(
  props: Readonly<{
    readonly suggestedActions: Partial<DirectLineCardAction>[];
    readonly onActionClick: (action: Partial<DirectLineCardAction>) => void;
  }>
) {
  const classNames = useStyles(styles);
  return (
    <div className={classNames['webchat__sendbox__suggested-actions']}>
      {props.suggestedActions.map(action => (
        <button
          className={classNames.webchat__sendbox__action}
          key={action.value}
          // TODO: how to fix?
          // eslint-disable-next-line react/jsx-no-bind
          onClick={() => props.onActionClick(action)}
          type="button"
        >
          {'displayText' in action ? action.displayText : null}
        </button>
      ))}
    </div>
  );
}
