import React, { /*useContext,*/ memo, useRef } from 'react';
import { Panel } from 'react-scroll-to-bottom';
import { VList, VListHandle } from 'virtua';
import useVirtualScrollEnabled from './useVirtualScrollEnabled';

function ScrollPanel({ children, ...props }) {
  const virtualScrollEnabled = useVirtualScrollEnabled();
  // const { scroller } = useContext(ScrollContext);
  const ref = useRef<VListHandle>(null);

  if (virtualScrollEnabled) {
    return (
      <VList ref={ref} {...props}>
        {children}
      </VList>
    );
  }
  return <Panel {...props}>{children}</Panel>;
}

export default memo(ScrollPanel);
