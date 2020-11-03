import React from 'react';

import MinimizableWebChat from './MinimizableWebChat';
import WebPageBackground from './WebPage.jpg';
import './App.css';

const App = (parameters) => (
  
  <div className="App">
    {/* <img alt="product background" src={WebPageBackground} /> */}
    <MinimizableWebChat parameters={parameters} />
  </div>
);

export default App;
