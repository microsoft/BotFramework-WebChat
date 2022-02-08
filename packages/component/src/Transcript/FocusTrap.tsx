import PropTypes from 'prop-types';
import React, { Fragment, useCallback, useRef } from 'react';

import type { FC, KeyboardEventHandler, PropsWithChildren } from 'react';

import FocusRedirector from '../Utils/FocusRedirector';
import tabbableElements from '../Utils/tabbableElements';
import useValueRef from '../hooks/internal/useValueRef';

type FocusTrapProps = PropsWithChildren<{
  onFocus: () => void;
  onLeave: () => void;
}>;

const FocusTrap: FC<FocusTrapProps> = ({ children, onFocus, onLeave }) => {
  const bodyRef = useRef<HTMLDivElement>();
  const onLeaveRef = useValueRef<() => void>(onLeave);

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
    const focusables = tabbableElements(bodyRef.current);

    focusables[focusables.length - 1]?.focus();
  }, [bodyRef]);

  const handleLastSentinelFocus: () => void = useCallback(
    () => tabbableElements(bodyRef.current)[0]?.focus(),
    [bodyRef]
  );

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
