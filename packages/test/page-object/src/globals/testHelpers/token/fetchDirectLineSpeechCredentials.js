function createFetchDirectLineSpeechCredentials() {
  let expireAfter = 0;
  let resultPromise;

  return () => {
    if (!resultPromise || Date.now() > expireAfter) {
      expireAfter = Date.now() + 5000;
      resultPromise = fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
        method: 'POST'
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch Direct Line Speech credentials.');
          }

          return res.json();
        })
        .then(({ region, token }) => ({ authorizationToken: token, region }))
        .catch(err => {
          expireAfter = 0;
          resultPromise = null;

          return Promise.reject(err);
        });
    }

    return resultPromise;
  };
}

const fetchDirectLineSpeechCredentials = createFetchDirectLineSpeechCredentials();

export default fetchDirectLineSpeechCredentials;
