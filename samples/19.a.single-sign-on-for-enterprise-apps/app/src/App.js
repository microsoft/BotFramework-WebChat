import React, { useCallback, useMemo, useState } from 'react';

import './App.css';
import GitHubProfileMenu from './ui/GitHubProfileMenu';
import MicrosoftGraphProfileMenu from './ui/MicrosoftGraphProfileMenu';

const GITHUB_OAUTH_ACCESS_TOKEN = 'GITHUB_OAUTH_ACCESS_TOKEN';
const MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN = 'MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN';

const App = () => {
  const [gitHubAccessToken, setGitHubAccessToken] = useState(sessionStorage.getItem(GITHUB_OAUTH_ACCESS_TOKEN) || '');
  const [microsoftGraphAccessToken, setMicrosoftGraphAccessToken] = useState(sessionStorage.getItem(MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN) || '');

  useMemo(() => {
    console.log(`Dispatching "accesstokenchange" event for GitHub access token "${ (gitHubAccessToken || '').substr(0, 5) }".`);

    const event = new Event('accesstokenchange');

    event.data = { accessToken: gitHubAccessToken, provider: 'github' };
    window.dispatchEvent(event);
  }, [gitHubAccessToken]);

  useMemo(() => {
    console.log(`Dispatching "accesstokenchange" event for Microsoft Graph access token "${ (microsoftGraphAccessToken || '').substr(0, 5) }".`);

    const event = new Event('accesstokenchange');

    event.data = { accessToken: microsoftGraphAccessToken, provider: 'microsoft' };
    window.dispatchEvent(event);
  }, [microsoftGraphAccessToken]);

  const handleGitHubAccessTokenChange = useCallback(accessToken => {
    setGitHubAccessToken(accessToken);
    accessToken ? sessionStorage.setItem(GITHUB_OAUTH_ACCESS_TOKEN, accessToken) : sessionStorage.removeItem(GITHUB_OAUTH_ACCESS_TOKEN);
  }, [setGitHubAccessToken]);

  const handleMicrosoftGraphAccessTokenChange = useCallback(accessToken => {
    setMicrosoftGraphAccessToken(accessToken);
    accessToken ? sessionStorage.setItem(MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN, accessToken) : sessionStorage.removeItem(MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN);
  }, [setMicrosoftGraphAccessToken]);

  return (
    <div className="sso__upperRight">
      {
        !microsoftGraphAccessToken &&
          <GitHubProfileMenu
            accessToken={ gitHubAccessToken }
            onAccessTokenChange={ handleGitHubAccessTokenChange }
          />
      }
      {
        !gitHubAccessToken &&
          <MicrosoftGraphProfileMenu
            accessToken={ microsoftGraphAccessToken }
            onAccessTokenChange={ handleMicrosoftGraphAccessTokenChange }
          />
      }
    </div>
  );
}

export default App;
