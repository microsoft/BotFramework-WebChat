import memoize from 'memoize-one';
import React from 'react';
import ReactWebChat, { createDirectLine, createStyleSet } from 'botframework-webchat';

import './WebChat.css';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.createDirectLine = memoize(token => createDirectLine({ token }));

    this.state = {
      styleSet: createStyleSet({
        backgroundColor: 'Transparent'
      })
    };
  }

  componentDidMount() {
    !this.props.token && this.props.onFetchToken();
  }

  render() {
    const {
      props: { className, store, token },
      state: { styleSet }
    } = this;

    return (
      token ?
        <ReactWebChat
          className={ `${ className || '' } web-chat` }
          directLine={ this.createDirectLine(token) }
          store={ store }
          styleSet={ styleSet }
        />
      :
        <div className={ `${ className || '' } connect-spinner` }>
          <div className="content">
            <div className="icon">
              <span className="ms-Icon ms-Icon--Robot" />
            </div>
            <p>Please wait while we are connecting.</p>
          </div>
        </div>
    );
  }
}
