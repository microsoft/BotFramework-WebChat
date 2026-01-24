# Customize Web Chat as a Pill UI Component demonstrating continuous listening

## Description

Customize web chat into a pill UI design for hosting continuous listening and barge in features.


This app is built with `create-react-app`.


# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.recomposing-ui/f.continuous-speech-recognition)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/06.recomposing-ui/f.continuous-speech-recognition/` in command line
-  Run `npm install`
-  Run `npm start`
-  Browse to [http://localhost:8000/](http://localhost:8000/)

# Things to try out

-  Notice there is a Microphone button within a pill UI.
-  Press the microphone button and speak 'hello'.
-  Mock Bot will respond via speech.
-  Microphone will be be in listening mode.
-  Speak to bot.
-  Mock Bot will respond again via speech.
-  While bot is responding barge in with another phrase or question.
-  Bot should stop speaking previous response.
-  After processing new speech input bot will speak with latest response.
-  Click on keyboard to view chat transcript.


# Overview
This sample uses the base components of Web Chat to build new components that suit the individual bot.
In this case, we are creating a speech UI with two views- Voice and Text

Voice view: Created custom UI in form of Pill UI design That consists of 
- Microphone: Starts/stops continuous recognition.
- Keyboard: Switches to text view.


Text view: Created custom UI for text chat that consists of 
- Transcripts: displays transcripts for session across both views.
- Send box: sends texts messages. Note no send icon in custom send box.
- Microphone: Switches to voice view.


The intent of this sample is to show how you can pick and choose what components you want to use, allowing for expansion and modification of how traditional Web Chat works. If you have a significantly different design spec for your bot, but would still like to use Web Chat, looking at this sample is a great place to start.

To see what components are available for customization, please take a look at the [components directory](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/component/src) of the Web Chat repo.


## `App.tsx`
[`App.tsx`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/06.recomposing-ui/f.continuous-speech-recognition/src/App.tsx)
Note that this is the component that builds up the other components we will create. We will need to import `<Composer>` from Web Chat to form the container of our application. Inside the composer, our imported components that we will create will be utilized within that container.
Setup for directline token and cognitive services credentials. 
To enable continuous listening pass speechRecognitionContinuous in styleOptions to Composer. 

```js
useEffect(() => {
    const abortController = new AbortController();
    const { signal } = abortController;

    (async function () {
      const res = await fetch(
        'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline',
        { method: 'POST', signal }
      );

      const { token } = await res.json();

      signal.aborted || setDirectLine(createDirectLine({ token }));
    })();

    return () => abortController.abort();
  }, [setDirectLine]);
```

```js
useEffect(() => {
    (async function () {
      await fetch(
        'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/speech/msi',
        {
          method: 'POST'
        }
      )
        .then(res => res.json())
        .then(({ region, token }) => ({ authorizationToken: `Bearer ${token}`, region }))
        .then(res => {
          setSpeechCredentials(res);
          return res;
        })
        .catch(err => {
          throw new Error(err);
        });
    })();
  }, []);

```

```js
const composerProps = {
    directLine,
    webSpeechPonyfillFactory,
    styleOptions: { speechRecognitionContinuous: true },
    sendBoxMiddleware: [() => () => () => () => SendBoxMiddlewareComponent]
  };

  return (
    <div className="App-chat_container">
      <Composer {...composerProps}>
        <ReactSpeechWebChatView changeView={handleChangeView} currentView={currentView} />
      </Composer>
    </div>
  );

```
## useUnSpokenActivities.tsx
[`useUnSpokenActivities.tsx`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/06.recomposing-ui/f.continuous-speech-recognition/src/useUnSpokenActivities.tsx) will return the list of unread activities. It uses below hook from Web Chat:

-  `useActivities` returns all activities.

```js
const useUnSpokenActivities = () => {
  const [activities] = useActivities();
  return activities.filter(
    ({ from: { role }, type, channelData }) => role === 'bot' && type === 'message' && channelData?.speak === true
  );
};
```

## MicrophoneButton.tsx
[`MicrophoneButton.tsx`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/06.recomposing-ui/f.continuous-speech-recognition/src/MicrophoneButton.tsx) represents the microphone button used to turn on microphone continuous listening. It will use several hooks from Web Chat:

-  `useMicrophoneButtonClick` to turn on microphone recording
-  `useDictateState` to indicate whether recognizing is in progress or not and animate the mic accordingly
-  `useUnSpokenActivities` to indicate whether bot has pending unspoken activities  and stop microphone animation

The `MicrophoneButton.tsx` leveraged logic from various Web Chat hooks, which are also used internally by Web Chat to drive its standard components.

```js
const handleMicrophoneButtonClick = useCallback(() => {
    changeView('speech');
    setShouldSpeakIncomingActivity(false);
    microphoneClick();
  }, [changeView, microphoneClick, setShouldSpeakIncomingActivity]);

  return (
    <button
      className={classNames(
        'icon-button',
        {
          'icon-button_animation': dictateState === DictateState.DICTATING && !unSpokenActivities.length
        },
        'micButton'
      )}
      onClick={handleMicrophoneButtonClick}
      type="button"
    >
      <Mic />
    </button>
  );
};
```

## BotResponse.tsx
[`BotResponse.tsx`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/06.recomposing-ui/f.continuous-speech-recognition/src/BotResponse.tsx) will render the most recent unread activity from the bot.
It can use several hooks from Web Chat:
-  `useUnSpokenActivities` to fetch and read unread activity from the bot.

```js
function BotResponse() {
  const unSpokenActivities = useUnSpokenActivities();

  return (
    <React.Fragment>
      {unSpokenActivities.map(activity => (
        <SpeakActivity activity={activity} key={activity.id} />
      ))}
    </React.Fragment>
  );
}
```


# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
 