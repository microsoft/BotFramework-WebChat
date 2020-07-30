import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import Context from './internal/Context';
import firstTabbableDescendant, { isTabbable } from '../firstTabbableDescendant';
import useNavigatorPlatform from '../../hooks/internal/useNavigatorPlatform';

const Surface = ({ children, ...otherProps }) => {
  const contextRef = useRef({ focii: [] });

  const [{ apple }] = useNavigatorPlatform();

  const handleKeyUp = useCallback(
    event => {
      const { altKey, ctrlKey, key, shiftKey } = event;

      // On Apple, most modern browsers use ALT+CTRL.
      // Otherwise, we use ALT+SHIFT.
      if (altKey && (apple ? ctrlKey : shiftKey)) {
        const focii = contextRef.current.focii.filter(entry => entry.keys.includes(key));

        const currentFocus = focii.findIndex(
          ({ ref: { current } }) => current === document.activeElement || current.contains(document.activeElement)
        );
        const nextFocus = focii[(currentFocus + 1) % focii.length];

        if (nextFocus) {
          event.preventDefault();
          event.stopPropagation();

          const {
            ref: { current }
          } = nextFocus;

          if (isTabbable(current)) {
            current.focus();
          } else {
            const firstTabbable = firstTabbableDescendant(current);

            firstTabbable && firstTabbable.focus();
          }
        }
      }
    },
    [apple]
  );

  return (
    <Context.Provider value={contextRef.current}>
      <div onKeyUp={handleKeyUp} {...otherProps}>
        {children}
      </div>
    </Context.Provider>
  );
};

Surface.defaultProps = {
  children: undefined
};

Surface.propTypes = {
  children: PropTypes.element
};

export default Surface;
