import React, { useState } from 'react';

import './App.css';
import GitHubProfileMenu from './ui/GitHubProfileMenu';
import MicrosoftGraphProfileMenu from './ui/MicrosoftGraphProfileMenu';

const App = () => {
  const [gitHubSignedIn, setGitHubSignedIn] = useState(false);
  const [microsoftGraphSignedIn, setMicrosoftGraphSignedIn] = useState(false);

  return (
    <div className="sso__upperRight">
      {
        !microsoftGraphSignedIn &&
          <GitHubProfileMenu
            onSignedInChange={ setGitHubSignedIn }
          />
      }
      {
        !gitHubSignedIn &&
          <MicrosoftGraphProfileMenu
            onSignedInChange={ setMicrosoftGraphSignedIn }
          />
      }
    </div>
  );
}

export default App;
