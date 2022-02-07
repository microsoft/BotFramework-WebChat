import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import type { FC, KeyboardEventHandler, PropsWithChildren } from 'react';

import FocusRedirector from '../Utils/FocusRedirector';
import tabbableElements from '../Utils/tabbableElements';
import useValueRef from '../hooks/internal/useValueRef';

type FocusTrapProps = PropsWithChildren<{
  bodyClassName?: string;
  className?: string;
  onFocus: () => void;
  onLeave: () => void;
}>;

const FocusTrap: FC<FocusTrapProps> = ({ bodyClassName, children, className, onFocus, onLeave }) => {
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
    <div className={className}>
      <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleFirstSentinelFocus} />
      <div className={bodyClassName} onFocus={onFocus} onKeyDown={handleBodyKeyDown} ref={bodyRef}>
        {children}
      </div>
      <FocusRedirector className="webchat__basic-transcript__activity-sentinel" onFocus={handleLastSentinelFocus} />
    </div>
  );
};

FocusTrap.defaultProps = {
  bodyClassName: undefined,
  children: undefined,
  className: undefined,
  onFocus: undefined
};

FocusTrap.propTypes = {
  bodyClassName: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  onFocus: PropTypes.func,
  onLeave: PropTypes.func.isRequired
};

export default FocusTrap;
