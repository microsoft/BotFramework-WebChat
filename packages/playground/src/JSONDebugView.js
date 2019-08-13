/* eslint-disable no-unused-vars */
/* eslint-disable no-magic-numbers */

import { css } from 'glamor';
import classNames from 'classnames';
import React, { useState } from 'react';

const ROOT_CSS = css({
  position: 'relative',

  '&.debug-view': {
    '& > pre': {
      backgroundColor: 'rgba(230, 255, 230, 1)',
      borderColor: 'Green',
      borderStyle: 'solid',
      borderWidth: 2,
      boxSizing: 'border-box',
      fontSize: '80%',
      left: 0,
      margin: 5,
      maxHeight: 200,
      overflowX: 'auto',
      padding: 5,
      top: 0,
      WebkitOverflowScrolling: 'touch',
      width: 'calc(100% - 10px)'
    }
  },

  '& > button.debug': {
    backgroundColor: 'Transparent',
    border: 0,
    outline: 0,
    padding: 10,
    position: 'absolute',
    right: 0,
    top: 0,

    '&:focus, &:hover': {
      backgroundColor: 'rgba(0, 0, 0, .1)'
    }
  }
});

const JSONDebugView = ({ debug, children, className }) => {
  const [debugView, setDebugView] = useState(false);

  const handleDebugViewClick = () => {
    setDebugView(!debugView);
  };

  return (
    <div className={classNames(ROOT_CSS + '', { 'debug-view': debugView }, className + '')}>
      {children}
      {!!debugView && <pre>{JSON.stringify(debug, null, 2)}</pre>}
      {!!debug && (
        <button className="debug" onClick={handleDebugViewClick} tabIndex={-1} type="button">
          &hellip;
        </button>
      )}
    </div>
  );
};

export default JSONDebugView;
