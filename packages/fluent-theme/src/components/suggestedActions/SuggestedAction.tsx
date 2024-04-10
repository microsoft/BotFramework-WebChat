import { hooks } from 'botframework-webchat-component';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { MouseEventHandler, memo, useCallback, useRef } from 'react';
import AccessibleButton from './AccessibleButton';
import { useStyles } from '../../styles';

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
    background: 'transparent',
    border: '1px solid var(--colorBrandStroke2)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    lineHeight: '14px',
    padding: '6px 8px 4px',
    textAlign: 'start',
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    transition: 'all .15s ease-out',

    '@media (hover: hover)': {
      '&:not([aria-disabled="true"]):hover': {
        backgroundColor: 'var(--colorBrandBackground2Hover)',
        color: 'var(--colorBrandForeground2Hover)'
      }
    },
    '&:not([aria-disabled="true"]):active': {
      backgroundColor: 'var(--colorBrandBackground2Pressed)',
      color: 'var(--colorBrandForeground2Pressed)'
    },
    '&[aria-disabled="true"]': {
      color: ' var(--colorNeutralForegroundDisabled)',
      cursor: 'not-allowed'
    }
  },

  'webchat-fluent__suggested-action__image': {
    width: '1em',
    height: '1em',
    fontSize: '20px'
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
