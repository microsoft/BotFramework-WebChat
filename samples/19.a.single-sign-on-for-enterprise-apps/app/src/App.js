import React, { useCallback, useMemo, useState } from 'react';

import './App.css';
import GitHubProfileMenu from './ui/GitHubProfileMenu';
import MicrosoftGraphProfileMenu from './ui/MicrosoftGraphProfileMenu';

const GITHUB_OAUTH_ACCESS_TOKEN = 'GITHUB_OAUTH_ACCESS_TOKEN';
const MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN = 'MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN';

const App = () => {
  const [gitHubAccessToken, setGitHubAccessToken] = useState(sessionStorage.getItem(GITHUB_OAUTH_ACCESS_TOKEN) || '');
  const [microsoftGraphAccessToken, setMicrosoftGraphAccessToken] = useState(sessionStorage.getItem(MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN) || '');

  // We will fire "accesstokenchange" event to the browser if gitHubAccessToken changed.
  // Custom code in Web Chat will monitor "accesstokenchange" event and send to the bot when it is connected.
  useMemo(() => {
    console.log(`Dispatching "accesstokenchange" event for GitHub access token "${ (gitHubAccessToken || '').substr(0, 5) }".`);

    const event = new Event('accesstokenchange');

    event.data = { accessToken: gitHubAccessToken, provider: 'github' };
    window.dispatchEvent(event);
  }, [gitHubAccessToken]);

  // We will fire "accesstokenchange" event to the browser if microsoftGraphAccessToken changed.
  // Custom code in Web Chat will monitor "accesstokenchange" event and send to the bot when it is connected.
  useMemo(() => {
    console.log(`Dispatching "accesstokenchange" event for Microsoft Graph access token "${ (microsoftGraphAccessToken || '').substr(0, 5) }".`);

    const event = new Event('accesstokenchange');

    event.data = { accessToken: microsoftGraphAccessToken, provider: 'microsoft' };
    window.dispatchEvent(event);
  }, [microsoftGraphAccessToken]);

  // In addition to state, we will save the gitHubAccessToken to session storage to persist across page refresh.
  const handleGitHubAccessTokenChange = useCallback(accessToken => {
    setGitHubAccessToken(accessToken);
    accessToken ? sessionStorage.setItem(GITHUB_OAUTH_ACCESS_TOKEN, accessToken) : sessionStorage.removeItem(GITHUB_OAUTH_ACCESS_TOKEN);
  }, [setGitHubAccessToken]);

  // In addition to state, we will save the microsoftGraphAccessToken to session storage to persist across page refresh.
  const handleMicrosoftGraphAccessTokenChange = useCallback(accessToken => {
    setMicrosoftGraphAccessToken(accessToken);
    accessToken ? sessionStorage.setItem(MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN, accessToken) : sessionStorage.removeItem(MICROSOFT_GRAPH_OAUTH_ACCESS_TOKEN);
  }, [setMicrosoftGraphAccessToken]);

  // Once signed into GitHub, the Microsoft Graph menu will be hidden, and vice versa.
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
