import React from 'react';

import DebugContainer from '../../Attachment/DebugContainer';

// TODO: Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default function () {
  return () => next => ({ activity, attachment }) =>
    <DebugContainer debug={ attachment }>
      { next({ activity, attachment }) }
    </DebugContainer>;
}
