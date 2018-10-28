import React from 'react';

export default React.createContext({
  _handleUpdate: () => 0,
  _setTarget: () => 0,
  atBottom: true,
  atEnd: true,
  atTop: true,
  mode: 'bottom',
  scrollTo: () => 0,
  scrollToBottom: () => 0,
  scrollToEnd: () => 0,
  scrollToTop: () => 0,
  threshold: 10
});
