import React from 'react';
import './App.css';

import GitHubProfileMenu from './ui/GitHubProfileMenu';
import MicrosoftGraphProfileMenu from './ui/MicrosoftGraphProfileMenu';

const App = () =>
  <div className="sso__upperRight">
    <GitHubProfileMenu />
    <MicrosoftGraphProfileMenu />
  </div>

export default App;
