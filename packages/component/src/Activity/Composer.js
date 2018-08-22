import memoize from 'memoize-one';
import React from 'react';

import Context from './Context';

function activityToAttachment({ text, textFormat }) {
  return {
    content: { text },
    contentType: textFormat === 'plain' ? 'text/plain' : textFormat === 'xml' ? 'text/xml' : 'text/markdown'
  };
}

export default class Composer extends React.Component {
  constructor(props) {
    super(props);

    this.createContext = memoize(activity => ({
      activity,
      attachments: [
        ...(
          activity.text ?
            [activityToAttachment(activity)]
          : (activity.type === 'message' && activity.value) ?
            [{
              content: { value: activity.value },
              contentType: 'application/vnd.microsoft.card.postback'
            }]
          :
            []
          ),
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
