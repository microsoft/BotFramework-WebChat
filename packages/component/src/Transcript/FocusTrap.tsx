import PropTypes from 'prop-types';
import React, {
  type KeyboardEventHandler,
  type PropsWithChildren,
  type ReactNode,
  Fragment,
  useCallback,
  useRef
} from 'react';

import FocusRedirector from '../Utils/FocusRedirector';
import tabbableElements from '../Utils/tabbableElements';
import useValueRef from '../hooks/internal/useValueRef';

type FocusTrapProps = Readonly<
  PropsWithChildren<{
    onFocus: () => void;
    onLeave: () => void;
  }>
>;

const FocusTrap = ({ children, onFocus, onLeave }: FocusTrapProps): ReactNode => {
  const bodyRef = useRef<HTMLDivElement>();
  const onLeaveRef = useValueRef<() => void>(onLeave);

  const getTabbableElementsInBody = useCallback(
    () => tabbableElements(bodyRef.current).filter(element => element.getAttribute('aria-disabled') !== 'true'),
    [bodyRef]
  );

  const handleBodyKeyDown: KeyboardEventHandler = useCallback(
    event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        onLeaveRef.current?.();
      }
    },
    [onLeaveRef]
  );

  const handleFirstSentinelFocus: () => void = useCallback(() => {
    const focusables = getTabbableElementsInBody();

    const lastTabbableElement = focusables[focusables.length - 1];

    lastTabbableElement ? lastTabbableElement.focus() : onLeaveRef.current?.();
  }, [getTabbableElementsInBody, onLeaveRef]);

  const handleLastSentinelFocus: () => void = useCallback(() => {
    const [firstTabbableElement] = getTabbableElementsInBody();

    firstTabbableElement ? firstTabbableElement.focus() : onLeaveRef.current?.();
  }, [getTabbableElementsInBody, onLeaveRef]);

  return (
    <Fragment>
      <FocusRedirector onFocus={handleFirstSentinelFocus} />
      <div onFocus={onFocus} onKeyDown={handleBodyKeyDown} ref={bodyRef}>
        {children}
      </div>
      <FocusRedirector onFocus={handleLastSentinelFocus} />
    </Fragment>
  );
};

FocusTrap.defaultProps = {
  children: undefined,
  onFocus: undefined
};

FocusTrap.propTypes = {
  children: PropTypes.any,
  onFocus: PropTypes.func,
  onLeave: PropTypes.func.isRequired
};

export default FocusTrap;
