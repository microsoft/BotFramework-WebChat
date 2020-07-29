import PropTypes from 'prop-types';
import React, { useCallback, useRef } from 'react';

import Context from './internal/Context';
import firstTabbableDescendant from '../firstTabbableDescendant';

const Surface = ({ children, ...otherProps }) => {
  const contextRef = useRef({ focii: [] });

  const handleKeyUp = useCallback(event => {
    const { altKey, key, shiftKey } = event;

    if (altKey && shiftKey) {
      const focii = contextRef.current.focii.filter(entry => entry.key === key);

      if (focii.length > 1) {
        throw new Error(
          `botframework-webchat: More than one element registered for access key "${key}", only the last one will be triggered.`
        );
      }

      const [focus] = focii;

      if (focus) {
        event.preventDefault();
        event.stopPropagation();

        const firstTabbable = firstTabbableDescendant(focus.ref.current);

        firstTabbable && firstTabbable.focus();
      }
    }
  }, []);

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
