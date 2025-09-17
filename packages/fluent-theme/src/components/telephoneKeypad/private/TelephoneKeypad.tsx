import { Components } from 'botframework-webchat';
import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef, type KeyboardEventHandler, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';

// import HorizontalDialPadController from './HorizontalDialPadController';
import { useStyles } from '../../../styles';
import testIds from '../../../testIds';
import { FluentIcon } from '../../icon';
import { type DTMF } from '../types';
import useShown from '../useShown';
import Button from './Button';
import styles from './TelephoneKeypad.module.css';

const { LocalizedString } = Components;

type Props = Readonly<{
  autoFocus?: boolean | undefined;
  className?: string | undefined;
  isHorizontal: boolean;
  onButtonClick: (button: DTMF) => void;
}>;

const Orientation = memo(
  ({ children, isHorizontal }: Readonly<{ children?: ReactNode | undefined; isHorizontal: boolean }>) => {
    const classNames = useStyles(styles);

    return isHorizontal ? null : ( // <HorizontalDialPadController>{children}</HorizontalDialPadController>
      <div className={classNames['telephone-keypad__box']}>{children}</div>
    );
  }
);

Orientation.displayName = 'TelephoneKeypad:Orientation';

const TelephoneKeypad = memo(({ autoFocus, className, onButtonClick, isHorizontal }: Props) => {
  const autoFocusRef = useRefFrom(autoFocus);
  const classNames = useStyles(styles);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const onButtonClickRef = useRefFrom(onButtonClick);
  const [, setShown] = useShown();

  const handleButton1Click = useCallback(() => onButtonClickRef.current?.('1'), [onButtonClickRef]);
  const handleButton2Click = useCallback(() => onButtonClickRef.current?.('2'), [onButtonClickRef]);
  const handleButton3Click = useCallback(() => onButtonClickRef.current?.('3'), [onButtonClickRef]);
  const handleButton4Click = useCallback(() => onButtonClickRef.current?.('4'), [onButtonClickRef]);
  const handleButton5Click = useCallback(() => onButtonClickRef.current?.('5'), [onButtonClickRef]);
  const handleButton6Click = useCallback(() => onButtonClickRef.current?.('6'), [onButtonClickRef]);
  const handleButton7Click = useCallback(() => onButtonClickRef.current?.('7'), [onButtonClickRef]);
  const handleButton8Click = useCallback(() => onButtonClickRef.current?.('8'), [onButtonClickRef]);
  const handleButton9Click = useCallback(() => onButtonClickRef.current?.('9'), [onButtonClickRef]);
  const handleButton0Click = useCallback(() => onButtonClickRef.current?.('0'), [onButtonClickRef]);
  const handleButtonStarClick = useCallback(() => onButtonClickRef.current?.('*'), [onButtonClickRef]);
  const handleButtonPoundClick = useCallback(() => onButtonClickRef.current?.('#'), [onButtonClickRef]);
  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLDivElement>>(
    event => {
      if (event.key === 'Escape') {
        // TODO: Should send focus to the send box.
        setShown(false);
      }
    },
    [setShown]
  );

  useEffect(() => {
    autoFocusRef.current && firstButtonRef.current?.focus();
  }, [autoFocusRef, firstButtonRef]);

  return (
    <div className={cx(classNames['telephone-keypad'], className)} onKeyDown={handleKeyDown}>
      <Orientation isHorizontal={isHorizontal}>
        <Button
          button="1"
          data-testid={testIds.sendBoxTelephoneKeypadButton1}
          onClick={handleButton1Click}
          ref={firstButtonRef}
        />
        <Button
          button="2"
          data-testid={testIds.sendBoxTelephoneKeypadButton2}
          onClick={handleButton2Click}
          ruby="ABC"
        />
        <Button
          button="3"
          data-testid={testIds.sendBoxTelephoneKeypadButton3}
          onClick={handleButton3Click}
          ruby="DEF"
        />
        <Button
          button="4"
          data-testid={testIds.sendBoxTelephoneKeypadButton4}
          onClick={handleButton4Click}
          ruby="GHI"
        />
        <Button
          button="5"
          data-testid={testIds.sendBoxTelephoneKeypadButton5}
          onClick={handleButton5Click}
          ruby="JKL"
        />
        <Button
          button="6"
          data-testid={testIds.sendBoxTelephoneKeypadButton6}
          onClick={handleButton6Click}
          ruby="MNO"
        />
        <Button
          button="7"
          data-testid={testIds.sendBoxTelephoneKeypadButton7}
          onClick={handleButton7Click}
          ruby="PQRS"
        />
        <Button
          button="8"
          data-testid={testIds.sendBoxTelephoneKeypadButton8}
          onClick={handleButton8Click}
          ruby="TUV"
        />
        <Button
          button="9"
          data-testid={testIds.sendBoxTelephoneKeypadButton9}
          onClick={handleButton9Click}
          ruby="WXYZ"
        />
        <Button button="*" data-testid={testIds.sendBoxTelephoneKeypadButtonStar} onClick={handleButtonStarClick} />
        <Button button="0" data-testid={testIds.sendBoxTelephoneKeypadButton0} onClick={handleButton0Click} ruby="+" />
        <Button button="#" data-testid={testIds.sendBoxTelephoneKeypadButtonPound} onClick={handleButtonPoundClick} />
      </Orientation>
      <div className={classNames['telephone-keypad__info-message']}>
        <FluentIcon appearance="text" icon="info-16" />
        <LocalizedString
          linkClassName={classNames['telephone-keypad__info-message-link']}
          stringIds="TELEPHONE_KEYPAD_INPUT_MESSAGE"
        />
      </div>
    </div>
  );
});

TelephoneKeypad.displayName = 'TelephoneKeypad';

export default TelephoneKeypad;
