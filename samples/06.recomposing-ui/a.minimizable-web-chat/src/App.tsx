import React, { memo } from 'react';

import './App.css';
import MinimizableWebChat from './MinimizableWebChat';
// @ts-ignore
import WebPageBackground from './WebPage.jpg';

function App() {
  return (
    <div className="App">
      <img alt="product background" src={new URL(WebPageBackground, new URL('static/app/js/', location.href)).href} />
      <MinimizableWebChat />
    </div>
  );
}

export default memo(App);
