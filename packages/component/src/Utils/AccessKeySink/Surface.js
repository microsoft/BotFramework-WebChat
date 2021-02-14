import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import { orSelf as firstTabbableDescendantOrSelf } from '../firstTabbableDescendant';
import AccessKeySinkContext from './internal/Context';
import useNavigatorPlatform from '../../hooks/internal/useNavigatorPlatform';

const Surface = ({ children, ...otherProps }) => {
  const [{ apple }] = useNavigatorPlatform();
  const contextRef = useRef({ focii: [] });

  const handleKeyUp = useCallback(
    event => {
      const { altKey, ctrlKey, key, shiftKey } = event;

      // On Apple, most modern browsers use CTRL + OPTION as modifiers.
      // Otherwise, we use ALT + SHIFT as modifierse.
      if (altKey && (apple ? ctrlKey : shiftKey)) {
        const focii = contextRef.current.focii.filter(entry => entry.keys.includes(key));

        const currentFocus = focii.findIndex(
          ({ ref: { current } }) => current === document.activeElement || current.contains(document.activeElement)
        );
        const nextFocus = focii[(currentFocus + 1) % focii.length];

        if (nextFocus) {
          event.preventDefault();
          event.stopPropagation();

          const tabbable = firstTabbableDescendantOrSelf(nextFocus.ref.current);

          tabbable && tabbable.focus();
        }
      }
    },
    [apple]
  );

  return (
    <AccessKeySinkContext.Provider value={contextRef.current}>
      <div onKeyUp={handleKeyUp} {...otherProps}>
        {children}
      </div>
    </AccessKeySinkContext.Provider>
  );
};

Surface.defaultProps = {
  children: undefined
};

Surface.propTypes = {
  children: PropTypes.any
};

export default Surface;
