# Using Web Chat as a smart display

## Description

Customize Web Chat into a smart display for hosting voice assistant via Direct Line Speech channel.

This app is built with `create-react-app`.

![Screenshot of smart display sample](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/samples/13.b.customization-smart-display/docs/screenshot1.png

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/13.b.customization-smart-display)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/13.b.customization-smart-display` in command line
-  Run `npm install`
-  Run `npm start`
-  Browse to [http://localhost:3000/](http://localhost:3000/)

# Things to try out

-  Click the microphone button and say "what's the weather"

# Overview

This sample uses the base components of Web Chat to build a new user interface that suit the voice assistant scenario. In this case, we are creating a smart display which shows:

1. Time of the day and weather forecast
1. Microphone button to initiate speech-to-text
1. Interims while the user is speaking
1. Last message from the bot, including Adaptive Cards

Notice that traditional Web Chat "pieces" are missing: the transcript and send box are not present on this app.

The intent of this sample is to show how you can pick and choose what components you want to use, allowing for expansion and modification of how traditional Web Chat works. If you have a significantly different design spec for your bot, but would still like to use Web Chat, looking at this sample is a great place to start.

To see what components are available for customization, please take a look at the [components directory](https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/component/src) of the Web Chat repo. You are welcome to import any one of these into your app and make modifications, or build an entirely new component from scratch.

First, let's take a look at the `App.js` file.

Note that this is the component that builds up the other components we will create. We will need to import `<Composer>` from Web Chat to form the container of our application. Inside the composer, our imported components that we will create will be utilized within that container.

## `App.js`

[`App.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/13.b.customization-smart-display/src/App.js) will set up the container for hosting Web Chat components. The container will be using Direct Line Speech channel.

`useEffect` and `useState` hooks are used to create the Direct Line Speech adapter set asynchronously. After the adapter set are created, they will be used to create the container.

```jsx
const [directLineSpeechAdapters, setDirectLineSpeechAdapters] = useState();

useEffect(() => {
   (async () =>
      setDirectLineSpeechAdapters(
         await createDirectLineSpeechAdapters({
            fetchCredentials: fetchCognitiveServicesCredentials
         })
      ))();
}, [setDirectLineSpeechAdapters]);

return (
   !!directLineSpeechAdapters && (
      <Composer {...directLineSpeechAdapters}>
         <SmartDisplay />
      </Composer>
   )
);
```

## `SmartDisplay.js`

[`SmartDisplay.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/13.b.customization-smart-display/src/SmartDisplay.js) will set up all the components for smart display, including clock, speech interims, bot response, and microphone button. The component will also keep track of the last read activity. When the user clicks on the microphone button, it will mark the last bot activity as read.

```jsx
const SmartDisplay = () => {
   const [lastBotActivity] = useLastBotActivity();
   const [lastReadActivityID, setLastReadActivityID] = useState();

   const handleMicrophoneButtonClick = useCallback(() => {
      lastBotActivity && setLastReadActivityID(lastBotActivity.id);
   }, [lastBotActivity, setLastReadActivityID]);

   return (
      <div className="App-SmartDisplay">
         <Clock />
         <BlurLens />
         <SpeechInterims />
         <BotResponse lastReadActivityID={lastReadActivityID} />
         <MicrophoneButton onClick={handleMicrophoneButtonClick} />
      </div>
   );
};
```

## `Clock.js`

[`Clock.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/13.b.customization-smart-display/src/Clock.js) will set up the clock. The time will be updated every second using `useInterval` hook, and forecast fetched from https://api.weather.gov/ on initial render. Other notification icons are dummy.

```jsx
function useInterval(fn, intervalMS = 1000) {
   useEffect(() => {
      if (fn && intervalMS) {
         const interval = setInterval(fn, intervalMS);

         return () => clearInterval(interval);
      }
   }, [fn, intervalMS]);
}

const Clock = () => {
   const [clock, setClock] = useState(Date.now());
   const [temperatureInFahrenheit, setTemperatureInFahrenheit] = useState();

   useEffect(() => {
      (async () => {
         const res = await fetch(WEATHER_FORECAST_URL, {
            headers: { accept: 'application/geo+json' }
         });

         if (res.ok) {
            const {
               properties: {
                  periods: [firstPeriod]
               }
            } = await res.json();

            setTemperatureInFahrenheit(firstPeriod.temperature);
         }
      })();
   }, []);

   useInterval(() => setClock(Date.now()), 1000);

   return (
      <div className="App-Clock">
         <div className="App-Clock-Text">
            {Intl.DateTimeFormat('en-US', { hour12: false, timeStyle: 'short' }).format(new Date(clock))}
         </div>
         {!!temperatureInFahrenheit && (
            <Notification icon="PartlyCloudyDay">{temperatureInFahrenheit}&deg;F</Notification>
         )}
         <Notification icon="Mail">2</Notification>
         <Notification icon="SkypeForBusinessLogo">1</Notification>
      </div>
   );
};
```

## `MicrophoneButton.js`

[`MicrophoneButton.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/13.b.customization-smart-display/src/MicrophoneButton.js) represents the microphone button used to turn on microphone recording. It will use several hooks from Web Chat:

-  `useMicrophoneButtonClick` to turn on microphone recording
-  `useMicrophoneButtonDisabled` to disable microphone click, for example:
   -  While the microphone is being turned on
   -  Microphone cannot be turned off because abort recording is not supported
-  `useSendBoxSpeechInterimsVisible` to indicate whether speech interims should be visible or not

The `MicrophoneButton.js` leveraged logic from various Web Chat hooks, which are also used internally by Web Chat to drive its standard components.

```jsx
const CustomMicrophoneButton = ({ onClick }) => {
   const [interimsVisible] = useSendBoxSpeechInterimsVisible();
   const [disabled] = useMicrophoneButtonDisabled();
   const click = useMicrophoneButtonClick();

   const handleClick = useCallback(() => {
      click();
      onClick && onClick();
   }, [click, onClick]);

   return (
      <button
         className={classNames('App-MicrophoneButton', { dictating: interimsVisible })}
         disabled={disabled}
         onClick={handleClick}
      >
         <i className="ms-Icon ms-Icon--Microphone" />
      </button>
   );
};
```

## `SpeechInterims.js`

[`SpeechInterims.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/13.b.customization-smart-display/src/SpeechInterims.js) formats and shows speech interims by the user. The interims could come in multiple parts.

```js
const CustomDictationInterims = () => {
   const [dictateInterims] = useDictateInterims();
   const [speechInterimsVisible] = useSendBoxSpeechInterimsVisible();

   return (
      speechInterimsVisible && (
         <div className="App-SpeechInterims">
            {!!speechInterimsVisible &&
               dictateInterims.map((interim, index) => <span key={index}>{interim}&nbsp;</span>)}
         </div>
      )
   );
};
```

## `BotResponse.js`

[`BotResponse.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/samples/13.b.customization-smart-display/src/BotResponse.js) will render the most recent unread activity and attachments from the bot.

-  Rendering Adaptive Cards attachments using [the middleware from full bundle](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/bundle/src/adaptiveCards/createAdaptiveCardsAttachmentMiddleware.js)
   -  If attachments other than Adaptive Cards is passed, it will be rendered as `false` and hidden in the UI
-  Using [`react-film`](https://npmjs.com/package/react-film) for the carousel of attachments
-  Using [`<SpeakActivity>`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Activity/Speak.js) for synthesizing the bot response as speech

```jsx
const BotResponse = ({ lastReadActivityID }) => {
   const [interimsVisible] = useSendBoxSpeechInterimsVisible();
   const [lastBotActivity] = useLastBotActivity();

   const renderAttachment = useMemo(() => {
      return createAdaptiveCardsAttachmentMiddleware()()(() => false);
   }, []);

   return (
      !interimsVisible &&
      !!lastBotActivity &&
      lastBotActivity.id !== lastReadActivityID && (
         <div className="App-BotResponse">
            {!!lastBotActivity.text && <div className="App-BotResponse-Activity">{lastBotActivity.text}</div>}
            <Film className="App-BotResponse-Attachments" showScrollBar={false}>
               {(lastBotActivity.attachments || []).map((attachment, index) => (
                  <div className="App-BotResponse-Attachment" key={index}>
                     {renderAttachment({ activity: lastBotActivity, attachment })}
                  </div>
               ))}
            </Film>
            {lastBotActivity.channelData && lastBotActivity.channelData.speak && (
               <SpeakActivity activity={lastBotActivity} />
            )}
         </div>
      )
   );
};
```

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
