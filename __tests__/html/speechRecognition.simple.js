<!doctype html>
<html lang="en-US">
  <head>
    <link href="/assets/index.css" rel="stylesheet" type="text/css" />
    <script crossorigin="anonymous" src="/test-harness.js"></script>
    <script crossorigin="anonymous" src="/test-page-object.js"></script>
    <script crossorigin="anonymous" src="/__dist__/webchat-es5.js"></script>
  </head>
  <body>
    <main id="webchat"></main>
    <script>
      const {
        testHelpers: {
          arrayBufferToBase64,
          createStore,
          iterateAsyncIterable,
          shareObservable,
          speech: {
            concatArrayBuffer,
            createQueuedArrayBufferAudioSource,
            fetchSpeechData,
            float32ArraysToPcmWaveArrayBuffer,
            MockAudioContext,
            pcmWaveArrayBufferToRiffWaveArrayBuffer,
            recognizeRiffWaveArrayBuffer
          },
          token: {
            fetchDirectLineSpeechCredentials,
            fetchDirectLineToken,
            fetchSpeechServicesAuthorizationToken,
            fetchSpeechServicesCredentials
          }
        }
      } = window;

      run(
        async function () {
          const params = new URLSearchParams(location.hash.replace(/^#/u, ''));

          const channelType = params.get('type');
          const directLineSpeechRegion = params.get('dls.region');
          const directLineSpeechSubscriptionKey = params.get('dls.key');
          const directLineToken = params.get('dl.token');
          const speechServicesRegion = params.get('speech.region');
          const speechServicesSubscriptionKey = params.get('speech.key');
          const useHostname = params.get('host');
          const useSubscriptionKey = params.get('key');

          let directLineSpeechHostname;
          let speechAuthorizationToken;
          let speechRecognitionHostname;
          let speechSubscriptionKey;
          let speechSynthesisHostname;
          let speechRegion;

          // CodeQL [SM01513] False positive, not bypassing, but switching between approaches
          if (useSubscriptionKey) {
            // CodeQL [SM01513] False positive, not bypassing, but switching between approaches
            if (channelType === 'dlspeech' && directLineSpeechSubscriptionKey) {
              speechAuthorizationToken = await fetchSpeechServicesAuthorizationToken({
                region: directLineSpeechRegion,
                subscriptionKey: directLineSpeechSubscriptionKey
              });

              if (useHostname) {
                directLineSpeechHostname = `${directLineSpeechRegion}.convai.speech.microsoft.com`;
                speechRecognitionHostname = `${directLineSpeechRegion}.stt.speech.microsoft.com`;
                speechSynthesisHostname = `${directLineSpeechRegion}.tts.speech.microsoft.com`;
              } else {
                speechRegion = directLineSpeechRegion;
              }
              // CodeQL [SM01513] False positive, not bypassing, but switching between approaches
            } else if (channelType === 'dl' && speechServicesSubscriptionKey) {
              speechAuthorizationToken = await fetchSpeechServicesAuthorizationToken({
                region: speechServicesRegion,
                subscriptionKey: speechServicesSubscriptionKey
              });

              if (useHostname) {
                speechRecognitionHostname = `${speechServicesRegion}.stt.speech.microsoft.com`;
                speechSynthesisHostname = `${speechServicesRegion}.tts.speech.microsoft.com`;
              } else {
                speechRegion = speechServicesRegion;
              }
            }
          } else {
            if (channelType === 'dlspeech') {
              if (directLineSpeechSubscriptionKey) {
                speechSubscriptionKey = directLineSpeechSubscriptionKey;

                if (useHostname) {
                  directLineSpeechHostname = `${directLineSpeechRegion}.convai.speech.microsoft.com`;
                  speechRecognitionHostname = `${directLineSpeechRegion}.stt.speech.microsoft.com`;
                  speechSynthesisHostname = `${directLineSpeechRegion}.tts.speech.microsoft.com`;
                } else {
                  speechRegion = directLineSpeechRegion;
                }
              } else {
                const { authorizationToken: fetchedSpeechAuthorizationToken, region: fetchedSpeechRegion } =
                  await fetchDirectLineSpeechCredentials();

                speechAuthorizationToken = fetchedSpeechAuthorizationToken;
                speechRegion = fetchedSpeechRegion;
              }
            } else {
              if (speechServicesSubscriptionKey) {
                speechSubscriptionKey = speechServicesSubscriptionKey;

                if (useHostname) {
                  speechRecognitionHostname = `${speechServicesRegion}.stt.speech.microsoft.com`;
                  speechSynthesisHostname = `${speechServicesRegion}.tts.speech.microsoft.com`;
                } else {
                  speechRegion = speechServicesRegion;
                }
              } else {
                const { authorizationToken: fetchedSpeechAuthorizationToken, region: fetchedSpeechRegion } =
                  await fetchSpeechServicesCredentials();

                speechAuthorizationToken = fetchedSpeechAuthorizationToken;
                speechRegion = fetchedSpeechRegion;
              }
            }
          }

          if (
            speechSubscriptionKey &&
            !speechRegion &&
            ((channelType === 'dl' && (!speechRecognitionHostname || !speechSynthesisHostname)) ||
              (channelType === 'dlspeech' && !directLineSpeechHostname))
          ) {
            throw new Error('Speech region or hostname must be specified when speech subscription key is specified.');
          }

          const speechCredentials = {
            authorizationToken: speechAuthorizationToken,
            directLineSpeechHostname,
            region: speechRegion,
            speechRecognitionHostname,
            speechSynthesisHostname,
            subscriptionKey: speechSubscriptionKey
          };

          let audioContext;

          // EventIterator will only start listening when passed to for-await-of. This is correct behavior and follow the standard async iterator protocol.
          // Since we construct the MockAudioContext in the iterable, we need to start the iteration sooner.
          // The iterateAsyncIterable() will iterate the async iterable immediately and return a new iterable.
          const bufferSourceAsyncIterable = iterateAsyncIterable(
            new EventIterator(({ push, stop }) => {
              let allBuffers = [];
              let timer;

              audioContext = new MockAudioContext({
                bufferSourceStartHandler: async ({ target: { buffer } }) => {
                  allBuffers.push(float32ArraysToPcmWaveArrayBuffer([new Float32Array(buffer.getChannelData(0))]));

                  timer && clearTimeout(timer);

                  timer = setTimeout(async () => {
                    const pcmWaveArrayBuffer = concatArrayBuffer(...allBuffers);

                    allBuffers = [];

                    if (pcmWaveArrayBuffer.byteLength) {
                      const riffWaveArrayBuffer = pcmWaveArrayBufferToRiffWaveArrayBuffer(pcmWaveArrayBuffer, {
                        channels: buffer.numberOfChannels,
                        samplesPerSec: buffer.sampleRate
                      });

                      filename = Date.now() + '-recognizing.wav';

                      // If not running in Jest, show the saved file in console.
                      if (!document.querySelector('body.jest')) {
                        console.groupCollapsed(`Saving ${filename}`);
                        console.log(`data:audio/wav;base64,${arrayBufferToBase64(riffWaveArrayBuffer)}`);
                        console.groupEnd();
                      }

                      push({
                        filename,
                        text: await recognizeRiffWaveArrayBuffer({
                          arrayBuffer: riffWaveArrayBuffer,
                          credentials: speechCredentials
                        })
                      });

                      stop();
                    }
                  }, 2000);
                }
              });
            })
          );

          const audioConfig = createQueuedArrayBufferAudioSource();

          let adapters;

          if (channelType === 'dlspeech') {
            adapters = await WebChat.createDirectLineSpeechAdapters({
              audioConfig,
              audioContext,
              fetchCredentials: () => speechCredentials
            });
          } else {
            adapters = {
              directLine: WebChat.createDirectLine({ token: directLineToken }),
              webSpeechPonyfillFactory: WebChat.createCognitiveServicesSpeechServicesPonyfillFactory({
                audioConfig,
                audioContext,
                credentials: speechCredentials,
                speechSynthesisOutputFormat: 'raw-16khz-16bit-mono-pcm'
              })
            };
          }

          WebChat.renderWebChat(
            {
              ...adapters,
              store: testHelpers.createStore()
            },
            document.getElementById('webchat')
          );

          await pageConditions.uiConnected();

          audioConfig.push(
            await fetchSpeechData({
              fetchCredentials: () => speechCredentials,
              text: 'A quick brown fox jumped over the lazy dogs.'
            })
          );

          await pageObjects.clickMicrophoneButton();
          await pageConditions.allOutgoingActivitiesSent();
          await pageConditions.minNumActivitiesShown(2);

          const recognized = [];

          for await (const result of bufferSourceAsyncIterable) {
            recognized.push(result);
          }

          try {
            expect(
              recognized.map(({ text }) =>
                text
                  .replace(/[^\w']/giu, ' ')
                  .replace(new RegExp('\\s+', 'gu'), ' ')
                  .trim()
                  .toLowerCase()
              )
            ).toEqual(['echo a quick brown fox jumped over the lazy dogs']);
          } catch (err) {
            const files = recognized.map(({ filename }) => `See diff for details: ${filename}`).join('\n');
            const detailedError = new Error(err.message + '\n\n' + files);

            detailedError.stack = files + '\n\n' + err.stack;

            throw detailedError;
          }
        },
        { ignoreErrors: true }
      );
    </script>
  </body>
</html>
