import PropTypes from 'prop-types';
import React, { useCallback, useMemo, useState } from 'react';

import type { FC, MutableRefObject } from 'react';

import ActiveDescendantContext from './private/Context';

// import type { DefaultActiveDescendant } from './private/Context';

type ActiveDescendantComposerProps = {
  containerRef: MutableRefObject<HTMLElement>;
  // defaultActiveDescendant?: DefaultActiveDescendant;
};

const ActiveDescendantComposer: FC<ActiveDescendantComposerProps> = ({
  children,
  containerRef
  // defaultActiveDescendant
}) => {
  const [activeDescendantId, setActiveDescendantId] = useState<string | undefined>();
  const focusContainer = useCallback(() => containerRef.current?.focus(), [containerRef]);

  const contextValue = useMemo(
    () => ({
      activeDescendantId,
      // defaultActiveDescendant,
      focusContainer,
      setActiveDescendantId
    }),
    [
      activeDescendantId,
      // defaultActiveDescendant
      focusContainer,
      setActiveDescendantId
    ]
  );

  return <ActiveDescendantContext.Provider value={contextValue}>{children}</ActiveDescendantContext.Provider>;
};

ActiveDescendantComposer.defaultProps = {
  // defaultActiveDescendant: 'none'
};

ActiveDescendantComposer.propTypes = {
  // PropTypes is not fully compatible with TypeScript.
  // @ts-ignore
  containerRef: PropTypes.shape({
    current: PropTypes.instanceOf(HTMLElement)
  }).isRequired
  // defaultActiveDescendant: PropTypes.oneOf(['first', 'last', 'none'])
};

export default ActiveDescendantComposer;
