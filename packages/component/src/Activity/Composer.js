import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';

function activityToAttachment({ contentType = 'text/markdown', text }) {
  return {
    content: { text },
    contentType
  };
}

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContext = memoize(activity => ({
      activity,
      attachments: [
        ...(activity.text ? [activityToAttachment(activity)] : []),
        ...activity.attachments || []
      ]
    }));
  }

  render() {
    const { props } = this;
    const context = this.createContext(props.activity);

    return (
      <Context.Provider value={ context }>
        {
          typeof props.children === 'function' ?
            props.children(context)
          :
            props.children
        }
      </Context.Provider>
    );
  }
}
