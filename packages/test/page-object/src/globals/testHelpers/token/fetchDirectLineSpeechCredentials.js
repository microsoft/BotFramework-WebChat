function createFetchDirectLineSpeechCredentials() {
  let expireAfter = 0;
  let resultPromise;

  return () => {
    if (!resultPromise || Date.now() > expireAfter) {
      expireAfter = Date.now() + 5000;
      resultPromise = fetch(
        'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/speech',
        {
          method: 'POST'
        }
      )
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
