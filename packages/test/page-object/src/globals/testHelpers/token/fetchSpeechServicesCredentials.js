function createFetchSpeechServicesCredentials() {
  let expireAfter = 0;
  let resultPromise;

  return (
    url = 'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/speech'
  ) => {
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
