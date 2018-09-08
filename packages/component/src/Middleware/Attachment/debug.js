import React from 'react';

import DebugContainer from '../../Attachment/DebugContainer';

// TODO: Rename this file or the whole middleware, it looks either too simple or too comprehensive now
export default () => {
  return next => {
    return ({ activity, attachment }) => {
      return (
        <DebugContainer debug={ attachment }>
          { next({ activity, attachment }) }
        </DebugContainer>
      );
    };
  };
}
