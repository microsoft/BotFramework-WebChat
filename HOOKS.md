# Web Chat API as React hooks

Web Chat is designed to be highly customizable. In order to build your own UI, you can use React Hooks to hook your UI component into Web Chat API.

To enable Web Chat API, all UI components must be located under the [`<Composer>`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js) component. You can refer to our [plain UI customization](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/21.customization-plain-ui) sample for details.

## Why React Hooks

React Hooks will make your code cleaner and shorter, and also greatly improve readability.

Web Chat expose our APIs through React Hooks. This API surface enables us to freely move stuff behind the scene, introduce new APIs, and a safe way to deprecate APIs. It will also make us easier to shuffle work between our internal Redux store and React Context.

## Two types of hooks

We design our hooks largely with two basic shapes:

- Actions, these are functions that you can call at any time to perform a side-effect
- Properties, these are getter function with an optional setter
   - This is same as [React State Hook pattern](https://reactjs.org/docs/hooks-state.html), but setter could be optional
   - If the value changed, React will call your render function again

### Actions

All actions will return a function that you can call later. For example, if you want to focus to the send box, you will use the following code:

```js
const focusSendBox = useFocusSendBox();

focusSendBox();
```

### Properties

All properties follow [React State Hook pattern](https://reactjs.org/docs/hooks-state.html). For example, if you want to get and set the value of send box, you will use the following code:

```js
const [sendBoxValue, setSendBoxValue] = useSendBoxValue();

console.log(`The send box value is "${ sendBoxValue }".`);

setSendBoxValue('Hello, World!');
```

> Note: some properties may not be settable.

# List of hooks

Following is the list of hooks supported by Web Chat API.

- [`useActivities`](#useactivities)
- [`useAvatarForBot`](#useavatarforbot)
- [`useAvatarForUser`](#useavatarforuser)
- [`useConnectivityStatus`](#useconnectivitystatus)
- [`useDictateInterims`](#usedictateinterims)
- [`useDictateState`](#usedictatestate)
- [`useDisabled`](#usedisabled)
- [`useEmitTypingIndicator`](#useemittypingindicator)
- [`useFocusSendBox`](#usefocussendbox)
- [`useGrammars`](#usegrammars)
- [`useGroupTimestamp`](#usegrouptimestamp)
- [`useLanguage`](#uselanguage)
- [`useLastTypingAt`](#uselasttypingat)
- [`useLocalize`](#uselocalize)
- [`useMarkActivityAsSpoken`](#usemarkactivityasspoken)
- [`usePerformCardAction`](#useperformcardaction)
- [`usePostActivity`](#usepostactivity)
- [`useReferenceGrammarID`](#usereferencegrammarid)
- [`useRenderActivity`](#useRenderActivity)
- [`useRenderAttachment`](#useRenderAttachment)
- [`useRenderMarkdownAsHTML`](#useRenderMarkdownAsHTML)
- [`useScrollToEnd`](#usescrolltoend)
- [`useSendBoxValue`](#usesendboxvalue)
- [`useSendEvent`](#usesendevent)
- [`useSendFiles`](#usesendfiles)
- [`useSendMessage`](#usesendmessage)
- [`useSendMessageBack`](#usesendmessageback)
- [`useSendPostBack`](#usesendpostback)
- [`useSendTypingIndicator`](#usesendtypingindicator)
- [`useShouldSpeakIncomingActivity`](#useshouldspeakincomingactivity)
- [`useStartDictate`](#usestartdictate)
- [`useStopDictate`](#usestopdictate)
- [`useStyleOptions`](#usestyleoptions)
- [`useStyleSet`](#usestyleset)
- [`useSubmitSendBox`](#usesubmitsendbox)
- [`useSuggestedActions`](#usesuggestedactions)
- [`useTimeoutForSend`](#usetimeoutforsend)
- [`useUserID`](#useuserid)
- [`useUsername`](#useusername)
- [`useVoiceSelector`](#usevoiceselector)
- [`useWebSpeechPonyfill`](#usewebspeechponyfill)

## `useActivities`

```js
useActivities(): [Activity[]]
```

This function will return a list of activities.

## `useAvatarForBot`

```js
useAvatarForBot(): [{
  image: string,
  initials: string
}]
```

This function will return the image and initials of the bot. Both image and initials are optional and can be falsy.

To set the avatar for bot, use style options.

## `useAvatarForUser`

```js
useAvatarForUser(): [{
  image: string,
  initials: string
}]
```

This function will return the image and initials of the user. Both image and initials are optional and can be falsy.

To set the avatar for user, use style options.

## `useConnectivityStatus`

```js
useConnectivityStatus(): [string]
```

This function will return the connectivity status of:

- `connected`: Connected
- `connectingslow`: Still connecting, not connected
- `error`: Connection error
- `notconnected`: Not connected
- `reconnected`: Reconnected after interruption
- `reconnecting`: Reconnecting after interruption
- `sagaerror`: Errors on JavaScript side
- `uninitialized`: Never connect and not connecting

## `useDictateInterims`

```js
useDictateInterims(): [string[][]]
```

This function will return interims for dictation.

The first array represents separate sentences. And the second array represents various ambiguities/alternatives for the same sentence.

## `useDictateState`

```js
useDictateState(): [string]
```

This function will return the dictate state of:

- `0`: Idle
- `1`: Starting
- `2`: Dictating
- `3`: Stopping

To control dictate state, use [`useStartDictate`](#usestartdictate) and [`useStopDictate`](#usestopdictate) hooks.

## `useDisabled`

```js
useDisabled(): [boolean]
```

This function will return whether the UI should be disabled or not. All interactable UI components should honor this value.

To modify this value, change the props passed to Web Chat.

## `useEmitTypingIndicator`

```js
useEmitTypingIndicator(): () => void
```

When called, this function will send a typing activity to the bot.

## `useFocusSendBox`

```js
useFocusSendBox(): () => void
```

When called, this function will send focus to the send box.

## `useGrammars`

```js
useGrammars(): [string[]]
```

This function will return the grammars for speech-to-text.

To modify this value, change the props passed to Web Chat.

## `useGroupTimestamp`

```js
useGroupTimestamp(): [number]
```

This function will return the interval for grouping similar activities with a single timestamp. The interval is represented in milliseconds.

For example, if this value is `5000`, activities with successive within 5 seconds will not have timestamp shown.

To control the `groupTimestamp` state, use style options.

## `useLanguage`

```js
useLanguage(): [string]
```

This function will return the language of the UI. All UI components should honor this value.

To modify this value, change the props passed to Web Chat.

## `useLastTypingAt`

```js
useLastTypingAt(): [{
  [id: string]: number
}]
```

This function will return a map of last typing time of all participants. The time is based on client clock.

This property is computed on every incoming activity.

## `useLocalize`

```js
useLocalize(): (identifier: string) => string
```

This function will return a localized string represented by the identifier. It honor the language settings from `useLanguage` hook.

To modify this value, change the props passed to Web Chat.

## `useMarkActivityAsSpoken`

```js
useMarkActivityAsSpoken(): (activity: Activity) => void
```

When called, this function will mark the activity as spoken and remove it from the text-to-speech queue.

## `usePerformCardAction`

```js
usePerformCardAction(): ({
  displayText: string,
  text: string,
  type: string,
  value: string
}) => void
```

When called, this function will perform the card action based on its `type`. The card action will be performed by `cardActionMiddleware`.

## `usePostActivity`

```js
usePostActivity(): (activity: Activity) => void
```

When called, this function will post the activity on behalf of the user, to the bot.

You can use this function to send any type of activities to the bot. We highly recommend you send the following type of activities only:

- `event`
- `message`
- `typing`

## `useReferenceGrammarID`

```js
useReferenceGrammarId(): [string]
```

When called, this function will return the reference grammar ID used to improve speech-to-text performance when used with Cognitive Services.

This value is not controllable and is passed from Direct Line channel.

## `useRenderActivity`

```js
useRenderActivity(): ({
  activity: Activity,
  renderAttachment: ({
    activity: Activity,
    attachment: Attachment
  }) => React.Element,
  timestampClassName: string
}) => React.Element
```

This function is for rendering activity into React element. The caller will need to pass `activity`, `timestampClassName`, and a render function for attachment. This function is a composition of `activityRendererMiddleware`, which is passed as a prop.

## `useRenderAttachment`

```js
useRenderAttachment(): ({
  activity: Activity,
  attachment: Attachment
}) => React.Element
```

This function is for rendering attachment into React element. The caller will need to pass `activity` and `attachment`. This function is a composition of `attachmentRendererMiddleware`, which is passed as a prop.

```js
() => next => { activity, attachment } => next({ activity, attachment })
```

## `useRenderMarkdownAsHTML`

```js
useRenderMarkdownAsHTML(): (markdown: string): string
```

This function will return a function that render Markdown into HTML string. For example,

```js
const renderMarkdown = useRenderMarkdown();

renderMarkdown('Hello, World!') === '<p>Hello, World!</p>\n';
```

To modify this value, change the props passed to Web Chat.

## `useScrollToEnd`

```js
useScrollToEnd(): () => void
```

This function will return a function that when called, it will scroll the transcript view to the end.

## `useSendBoxValue`

```js
useSendBoxValue(): [string, (value: string) => void]
```

This function will return the value of the send box, and the setter function to change the value.

## `useSendEvent`

```js
useSendEvent(): (name: string, value: string) => void
```

When called, this function will send an event activity to the bot.

## `useSendFiles`

```js
useSendFiles(): (files: File[]) => void

interface File {
  name: string;
  size: number;
  thumbnail: string;
  url: string;
}
```

When called, this function will send a message activity with one or more file attachments to the bot.

The content of the file must be represented in URL. If you are uploading an `Blob`/`File`, you can use [`URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL) function to create a temporary URL.

If you are using `ArrayBuffer`, you can use `FileReader` to convert it into a blob before calling [`URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL).

Thumbnail must be presented in Data URI format.

## `useSendMessage`

```js
useSendMessage(): (text: string, method: string) => void
```

When called, this function will send a text message activity to the bot.

You can optionally include the input method the text message is collected. Currently, if specified, only `speech` is supported.

## `useSendMessageBack`

```js
useSendMessageBack(): (value: any, text: string, displayText: string) => void
```

When called, this function will send a `messageBack` activity to the bot.

## `useSendPostBack`

```js
useSendPostBack(): (value: any) => void
```

When called, this function will send a `postBack` activity to the bot.

## `useSendTypingIndicator`

```js
useSendTypingIndicator(): [boolean]
```

This function will return whether typing indicator will be send to the bot when the send box value is changed.

To modify this value, change the props passed to Web Chat.

## `useShouldSpeakIncomingActivity`

```js
useShouldSpeakIncomingActivity(): [boolean, (value: boolean) => void]
```

This function will return whether the next incoming activity will be queued for text-to-speech or not, and a setter function to control the behavior.

If the last outgoing message is sent by speech, Web Chat will set this state to `true`, so the response from bot will be synthesized as speech.

## `useStartDictate`

```js
useStartDictate(): () => void
```

This function will open the microphone for dictation. You should only call this function by user-initiated gesture. Otherwise, the browser may block access to the microphone.

## `useStopDictate`

```js
useStopDictate(): () => void
```

This function will close the microphone. It will not send the interims to the bot, but leave the interims in the send box.

## `useStyleOptions`

```js
useStyleOptions(): [StyleOptions]
```

This function will return the style options. UI components should honor the styling preferences.

The value is not the same as the props. Web Chat will merge the style options passed in props with default values specified in [`defaultStyleOptions.js`](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleOptions.js).

To modify the value of `styleOptions` state, change the props you pass to Web Chat.

## `useStyleSet`

```js
useStyleSet(): [StyleSet]
```

This function will return the style set.

To modify this value, change the props passed to Web Chat.

## `useSubmitSendBox`

```js
useSubmitSendBox(): () => void
```

This function will send the text in the send box to the bot, and clear the send box.

## `useSuggestedActions`

```js
useSuggestedActions(): [CardAction[], (CardAction[]) => void]
```

This function will return a list of suggested actions that should show to the user, and a setter function to clear suggested actions. The setter function can only be used to clear suggested actions, and it will accept empty array or falsy value only.

The suggested actions is computed from the last message activity sent from the bot. If the user posted an activity, the suggested actions will be cleared.

## `useTimeoutForSend`

```js
useTimeoutForSend(): [number]
```

This function will return the interval before a sending activity is considered fail. The interval is represented in milliseconds. Due to network partitioning problem, activity that failed to send could eventually successfully deliver to the bot.

To modify this value, change the props passed to Web Chat.

## `useUserID`

```js
useUserID(): [string]
```

This function will return the user ID.

To modify this value, change the props passed to Web Chat.

## `useUsername`

```js
useUsername(): [string]
```

This function will return the username.

To modify this value, change the props passed to Web Chat.

## `useVoiceSelector`

```js
useVoiceSelector(activity: Activity): (voices: SpeechSynthesisVoice[]) => SpeechSynthesisVoice
```

This function will return a function that can be called to select the voice for a specific activity.

To modify this value, change the props passed to Web Chat.

## `useWebSpeechPonyfill`

```js
useWebSpeechPonyfill(): [{
  SpeechGrammarList: SpeechGrammarList,
  SpeechRecognition: SpeechRecognition,
  speechSynthesis: SpeechSynthesis,
  SpeechSynthesisUtterance: SpeechSynthesisUtterance
}]
```

This function will return the ponyfill for Web Speech API.

To modify this value, change the props passed to Web Chat.

# Component-specific hooks

These are hooks specific provide specific user experience.

## `MicrophoneButton`

These are hooks that are specific for the microphone button.

- [`useMicrophoneButtonClick`](#usemicrophonebuttonclick)
- [`useMicrophoneButtonDisabled`](#usemicrophonebuttondisabled)

### `useMicrophoneButtonClick`

```js
useMicrophoneButtonClick(): () => void
```

When called, this function will toggle microphone open or close.

### `useMicrophoneButtonDisabled`

```js
useMicrophoneButtonDisabled(): () => void
```

This function will return whether the microphone button is disabled. This is more than `useDisabled()`. The microphone button could be disabled because it is currently starting or stopping.

This value can be partly controllable through Web Chat props.

## `SendBox`

These are hooks that are specific for the send box.

- [`useSendBoxDictationStarted`](#usesendboxdictationstarted)

### `useSendBoxDictationStarted`

```js
useSendBoxDictationStarted(): [boolean]
```

This function will return whether the speech-to-text has been started or not.

## `TextBox`

These are hooks that are specific to the text box in the send box.

- [`useTextBoxSubmit`](#usetextboxsubmit)
- [`useTextBoxValue`](#usetextboxvalue)

### `useTextBoxSubmit`

```js
useTextBoxSubmit(): (setFocus: boolean) => void
```

This function will send the text box value as a message to the bot. In addition to the original `useSubmitSendBox` hook, this function will also scroll to bottom and optionally, set focus to the send box.

The focus is useful for phone scenario, where virtual keyboard will only be shown when a text box is focused.

### `useTextBoxValue`

```js
useTextBoxValue(): [string, (value: string) => void]
```

This function will return the text box value, and a setter function to set the value.

The setter function will call the setter of [`useSendBoxValue`](#usesendboxvalue) and also stop dictation if started.

## `TypingIndicator`

These are hooks that are specific to the typing indicator.

- [`useTypingIndicatorVisible`](#usetypingindicatorvisible)

### `useTypingIndicatorVisible`

```js
useTypingIndicatorVisible(): [boolean]
```

This function will return whether the typing indicator should be visible or not. This function is time-sensitive, means, the value could varies based on the clock.

This function derive the visibility of the typing indicator by:

- `typingAnimationDuration` value specified in style options, in milliseconds
- Values from the `useLastTypingAt` hook

## `UploadButton`

These are hooks that are specific to the upload button.

- [`useUploadButtonSendFiles`](#useuploadbuttonsendfiles)

### `useUploadButtonSendFiles`

```js
useUploadButtonSendFiles(): (files: File[]) => void
```

This function is intended to simplify the handling of converting files into attachments.

When called with an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File), this function will call `useSendFiles` hook with the following additional behaviors:

- Convert [File](https://developer.mozilla.org/en-US/docs/Web/API/File) into object URL
- Generate thumbnail and will use Web Worker and offscreen canvas if supported
