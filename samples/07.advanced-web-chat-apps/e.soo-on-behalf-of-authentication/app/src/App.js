import React from 'react';

import './App.css';
import MicrosoftGraphProfileMenu from './ui/MicrosoftGraphProfileMenu';
import OAuthComposer from './oauth/Composer';
import WebChat from './ui/WebChat';

const App = () => (
  <div>
    <OAuthComposer>
      <MicrosoftGraphProfileMenu />
      <WebChat />
    </OAuthComposer>
  </div>
);

export default App;
