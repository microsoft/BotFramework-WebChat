function createFetchSpeechServicesCredentials() {
  let expireAfter = 0;
  let resultPromise;

  return (url = 'https://webchat-mockbot.azurewebsites.net/speechservices/token') => {
    if (!resultPromise || Date.now() > expireAfter) {
      expireAfter = Date.now() + 5000;
      resultPromise = fetch(url, { method: 'POST' })
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
