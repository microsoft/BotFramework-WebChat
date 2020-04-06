'use strict';

// Fetch the Direct Line Speech credentials.
async function fetchDirectLineSpeechCredentials() {
  const res = await fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch authorization token and region.');
  }

  const { region, token: authorizationToken } = await res.json();

  return { authorizationToken, region };
}

// Create a function to fetch the Cognitive Services Speech Services credentials.
// The async function created will hold expiration information about the token and will return cached token when possible.
function createFetchSpeechServicesCredentials() {
  let expireAfter = 0;
  let lastPromise;

  return () => {
    const now = Date.now();

    // Fetch a new token if the existing one is expiring.
    // The following article mentioned the token is only valid for 10 minutes.
    // We will invalidate the token after 5 minutes.
    // https://docs.microsoft.com/en-us/azure/cognitive-services/authentication#authenticate-with-an-authentication-token
    if (now > expireAfter) {
      expireAfter = now + 300000;
      lastPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', {
        method: 'POST'
      }).then(
        res => res.json(),
        err => {
          expireAfter = 0;

          return Promise.reject(err);
        }
      );
    }

    return lastPromise;
  };
}

(async function() {
  // In this demo, we are using Direct Line token from MockBot.
  // Your client code must provide either a secret or a token to talk to your bot.
  // Tokens are more secure. To learn about the differences between secrets and tokens.
  // and to understand the risks associated with using secrets, visit https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0

  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

  // Imports
  const {
    navigator: { mediaDevices },
    React: { useCallback, useEffect, useMemo, useState },
    ReactDOM,
    WebChat: {
      createCognitiveServicesSpeechServicesPonyfillFactory,
      createDirectLine,
      createDirectLineSpeechAdapters,
      ReactWebChat
    }
  } = window;

  const App = () => {
    // List of audio input devices. The list is initially empty until the async function call finished.
    // If the browser does not support media devices, we will set it to false to show an error message.
    const [audioInputDevices, setAudioInputDevices] = useState(mediaDevices ? [] : false);

    // Channel to use, either "directline" or "directlinespeech".
    const [channel, setChannel] = useState('directline');

    // Time when the device list change. This is used to trigger a re-enumeration of devices.
    const [lastDeviceChangeAt, setLastDeviceChangeAt] = useState(0);

    // Device ID of the audio input device selected by the user.
    const [selectedAudioInputDeviceId, setSelectedAudioInputDeviceId] = useState('default');

    // Direct Line adapter instance will be kept across render if the channel does not changed.
    const directLine = useMemo(() => channel !== 'directlinespeech' && createDirectLine({ token }), [channel, token]);

    // Function instance to fetch credentials for Cognitive Services Speech Services. The instance is kept across render to cache the credentials.
    const fetchSpeechServicesCredentials = useMemo(() => createFetchSpeechServicesCredentials(), []);

    // Create the ponyfill factory function, which can be called to create a concrete implementation of the ponyfill.
    // The ponyfill factory will be discarded when the channel changed.
    const webSpeechPonyfillFactory = useMemo(
      () =>
        channel !== 'directlinespeech' &&
        createCognitiveServicesSpeechServicesPonyfillFactory({
          // Device ID of the audio input device to use.
          audioInputDeviceId: selectedAudioInputDeviceId,

          // We are passing the Promise function to the "credentials" field.
          // This function will be called every time the token is being used.
          credentials: fetchSpeechServicesCredentials
        }),
      [channel, fetchSpeechServicesCredentials, selectedAudioInputDeviceId]
    );

    // When the user select a different channel, we change the "channel" based on their selection.
    const handleChannelChange = useCallback(({ target: { value } }) => setChannel(value));

    // When the user select a different device, we change the "selectedAudioInputDeviceId" based on their selection.
    const handleSelectedAudioInputDeviceIdChange = useCallback(({ target: { value } }) =>
      setSelectedAudioInputDeviceId(value)
    );

    // This is the set of adapters for Web Chat to use.
    const [adapters, setAdapters] = useState(false);

    // When channel or selected audio input device changed, we will re-create the set of adapters.
    useEffect(() => {
      if (channel === 'directlinespeech') {
        // Direct Line Speech adapter set creation is asynchronous call,
        // we will temporarily disable Web Chat until the adapter set is ready to use.
        setAdapters(false);

        let directLine;

        (async function() {
          const adapters = await createDirectLineSpeechAdapters({
            audioInputDeviceId: selectedAudioInputDeviceId,
            fetchCredentials: fetchDirectLineSpeechCredentials
          });

          directLine = adapters.directLine;
          setAdapters(adapters);
        })();

        return () => directLine && directLine.end();
      } else {
        // Direct Line adapter and Web Speech ponyfill are created.
        // We separate the adapter/ponyfill creation code so we can update either one of them without affecting the other one.
        setAdapters({ directLine, webSpeechPonyfillFactory });

        return () => directLine.end();
      }
    }, [channel, selectedAudioInputDeviceId]);

    // When device is plugged/unplugged, we will re-enumerate the device list.
    useEffect(() => {
      // "mediaDevices" is undefined if the loaded page is not secure:
      // 1. The page is not loaded via HTTPS, and;
      // 2. The page is not loaded from localhost.
      if (mediaDevices) {
        const handleDeviceChange = () => setLastDeviceChangeAt(Date.now());

        mediaDevices.addEventListener('devicechange', handleDeviceChange);

        return () => mediaDevices.removeEventListener('devicechange', handleDeviceChange);
      }
    }, [setLastDeviceChangeAt]);

    // Enumerate the device list on initial page load or when a device is plugged/unplugged.
    useEffect(() => {
      (async function() {
        mediaDevices &&
          setAudioInputDevices(
            // We will only list "audioinput" device.
            (await mediaDevices.enumerateDevices()).filter(({ kind }) => kind === 'audioinput')
          );
      })();
    }, [lastDeviceChangeAt, setAudioInputDevices]);

    return (
      <React.Fragment>
        <div className="app__settings-panel" role="radiogroup">
          <div className="app__settings-panel__header">Channel</div>
          <ul className="app__settings-panel__list">
            <li className="app__settings-panel__list-item">
              <label className="app__settings-panel__row">
                <input
                  checked={channel !== 'directlinespeech'}
                  className="app__settings-panel__radio-button"
                  name="channel-direct-line"
                  onChange={handleChannelChange}
                  type="radio"
                  value="directline"
                />
                Direct Line
              </label>
            </li>
            <li className="app__settings-panel__list-item">
              <label className="app__settings-panel__row">
                <input
                  checked={channel === 'directlinespeech'}
                  className="app__settings-panel__radio-button"
                  name="channel-direct-line-speech"
                  onChange={handleChannelChange}
                  type="radio"
                  value="directlinespeech"
                />
                Direct Line Speech
              </label>
            </li>
          </ul>
        </div>
        <div className="app__settings-panel" role="radiogroup">
          <div className="app__settings-panel__header">Audio input devices</div>
          {audioInputDevices ? (
            <ul className="app__settings-panel__list">
              {audioInputDevices.map(({ deviceId, label }) => (
                <li className="app__settings-panel__list-item" key={deviceId}>
                  <label className="app__settings-panel__row">
                    <input
                      checked={selectedAudioInputDeviceId === deviceId}
                      className="app__settings-panel__radio-button"
                      name="audio-input-device-id"
                      onChange={handleSelectedAudioInputDeviceIdChange}
                      type="radio"
                      value={deviceId}
                    />
                    {label || deviceId}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <div>Your browser does not support Web Audio or this page is not loaded via HTTPS or from localhost.</div>
          )}
        </div>
        {/* We are recreating <ReactWebChat> on channel change */}
        {adapters && <ReactWebChat className="webchat" key={channel} {...adapters} />}
      </React.Fragment>
    );
  };

  // Pass a Web Speech ponyfill factory to renderWebChat.
  // You can also use your own speech engine given it is compliant to W3C Web Speech API: https://w3c.github.io/speech-api/.
  // For implementor, look at createBrowserWebSpeechPonyfill.js for details.
  ReactDOM.render(<App />, document.getElementById('app'));
})().catch(err => console.error(err));
