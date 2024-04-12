import { hooks } from 'botframework-webchat-component';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { MouseEventHandler, memo, useCallback, useRef } from 'react';
import { useStyles } from '../../styles';
import AccessibleButton from './AccessibleButton';

const { useScrollToEnd, useStyleSet, usePerformCardAction, useFocus, useSuggestedActions, useDisabled } = hooks;

type SuggestedActionProps = Readonly<{
  buttonText: string | undefined;
  className?: string | undefined;
  displayText?: string | undefined;
  image?: string | undefined;
  imageAlt?: string | undefined;
  itemIndex: number;
  text?: string | undefined;
  type?:
    | 'call'
    | 'downloadFile'
    | 'imBack'
    | 'messageBack'
    | 'openUrl'
    | 'playAudio'
    | 'playVideo'
    | 'postBack'
    | 'showImage'
    | 'signin';
  value?: any;
}>;

const styles = {
  'webchat-fluent__suggested-action': {
    alignItems: 'center',
    background: 'transparent',
    border: '1px solid var(--webchat-colorBrandStroke2)',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    fontSize: '12px',
    gap: '4px',
    padding: '4px 8px 4px',
    textAlign: 'start',
    transition: 'all .15s ease-out',

    '@media (hover: hover)': {
      '&:not([aria-disabled="true"]):hover': {
        backgroundColor: 'var(--webchat-colorBrandBackground2Hover)',
        color: 'var(--webchat-colorBrandForeground2Hover)'
      }
    },
    '&:not([aria-disabled="true"]):active': {
      backgroundColor: 'var(--webchat-colorBrandBackground2Pressed)',
      color: 'var(--webchat-colorBrandForeground2Pressed)'
    },
    '&[aria-disabled="true"]': {
      color: 'var(--webchat-colorNeutralForegroundDisabled)',
      cursor: 'not-allowed'
    }
  },

  'webchat-fluent__suggested-action__image': {
    height: '12px'
  }
};

function SuggestedAction({
  buttonText,
  className,
  displayText,
  image,
  imageAlt,
  text,
  type,
  value
}: SuggestedActionProps) {
  const [_, setSuggestedActions] = useSuggestedActions();
  const [{ suggestedAction: suggestedActionStyleSet }] = useStyleSet();
  const [disabled] = useDisabled();
  const focus = useFocus();
  const focusRef = useRef<HTMLButtonElement>(null);
  const performCardAction = usePerformCardAction();
  const classNames = useStyles(styles);
  const scrollToEnd = useScrollToEnd();

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    ({ target }) => {
      (async function () {
        // We need to focus to the send box before we are performing this card action.
        // The will make sure the focus is always on Web Chat.
        // Otherwise, the focus may momentarily send to `document.body` and screen reader will be confused.
        await focus('sendBoxWithoutKeyboard');

        // TODO: [P3] #XXX We should not destruct DirectLineCardAction into React props and pass them in. It makes typings difficult.
        //       Instead, we should pass a "cardAction" props.
        performCardAction({ displayText, text, type, value } as DirectLineCardAction, { target });

        // Since "openUrl" action do not submit, the suggested action buttons do not hide after click.
        type === 'openUrl' && setSuggestedActions([]);

        scrollToEnd();
      })();
    },
    [displayText, focus, performCardAction, scrollToEnd, setSuggestedActions, text, type, value]
  );

  return (
    <AccessibleButton
      className={cx(
        classNames['webchat-fluent__suggested-action'],
        suggestedActionStyleSet + '',
        (className || '') + ''
      )}
      disabled={disabled}
      onClick={handleClick}
      ref={focusRef}
      type="button"
    >
      {image && <img alt={imageAlt} className={classNames['webchat-fluent__suggested-action__image']} src={image} />}
      <span>{buttonText}</span>
    </AccessibleButton>
  );
}

export default memo(SuggestedAction);
