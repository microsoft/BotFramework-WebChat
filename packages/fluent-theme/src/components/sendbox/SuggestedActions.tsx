import type { DirectLineCardAction } from 'botframework-webchat-core';
import { useStyles } from '../../styles';
import React from 'react';

const styles = {
  'webchat-fluent__sendbox__suggested-actions': {
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBlockEnd: '8px',
    paddingInlineStart: '4px'
  },

  'webchat-fluent__sendbox__action': {
    background: 'transparent',
    border: '1px solid var(--colorBrandStroke2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: '12px',
    padding: '6px 8px 4px',
    textAlign: 'start'
  }
};

// TODO: this is a stub for actions. We must reuse the existing SuggestedActions implementation
export function SuggestedActions(
  props: Readonly<{
    readonly onActionClick: (action: Partial<DirectLineCardAction>) => void;
    readonly suggestedActions: Partial<DirectLineCardAction>[];
  }>
) {
  const classNames = useStyles(styles);
  return (
    <div className={classNames['webchat-fluent__sendbox__suggested-actions']}>
      {props.suggestedActions.map(action => (
        <button
          className={classNames['webchat-fluent__sendbox__action']}
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
