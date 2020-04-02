function createFetchSpeechServicesCredentials() {
  let expireAfter = 0;
  let resultPromise;

  return () => {
    if (!resultPromise || Date.now() > expireAfter) {
      expireAfter = Date.now() + 5000;
      resultPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' })
        .then(res => res.json())
        .catch(err => {
          expireAfter = 0;
          resultPromise = null;

          return Promise.reject(err);
        });
    }

    return resultPromise;
  };
}

const fetchSpeechServicesCredentials = createFetchSpeechServicesCredentials();

export default fetchSpeechServicesCredentials;
