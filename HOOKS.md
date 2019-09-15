# Generic hooks

- [`useActivities`](#useactivities)
- [`useActivityRenderer`](#useactivityrenderer)
- [`useAttachmentRenderer`](#useattachmentrenderer)
- [`useAvatarForBot`](#useavatarforbot)
- [`useAvatarForUser`](#useavatarforuser)
- [`useClockSkewAdjustment`](#useclockskewadjustment)
- [`useConnectivityStatus`](#useconnectivitystatus)
- [`useDictateInterims`](#usedictateinterims)
- [`useDictateState`](#usedictatestate)
- [`useDisabled`](#usedisabled)
- [`useFocusSendBox`](#usefocussendbox)
- [`useGrammars`](#usegrammars)
- [`useGroupTimestamp`](#usegrouptimestamp)
- [`useLanguage`](#uselanguage)
- [`useLastTypingAt`](#uselasttypingat)
- [`useLocalize`](#uselocalize)
- [`useMarkActivityAsSpoken`](#usemarkactivityasspoken)
- [`usePerformCardAction`](#useperformcardaction)
- [`usePostActivity`](#usepostactivity)
- [`useReadyState`](#usereadystate)
- [`useReferenceGrammarID`](#usereferencegrammarid)
- [`useRenderMarkdown`](#userendermarkdown)
- [`useScrollToEnd`](#usescrolltoend)
- [`useSelectVoice`](#useselectvoice)
- [`useSendBoxRef`](#usesendboxref)
- [`useSendBoxValue`](#usesendboxvalue)
- [`useSendEvent`](#usesendevent)
- [`useSendFiles`](#usesendfiles)
- [`useSendMessage`](#usesendmessage)
- [`useSendMessageBack`](#usesendmessageback)
- [`useSendPostBack`](#usesendpostback)
- [`useTimeoutForSend`](#usetimeoutforsend)
- [`useSendTypingIndicator`](#usesendtypingindicator)
- [`useShouldSpeakIncomingActivity`](#useshouldspeakincomingactivity)
- [`useStartDictate`](#usestartdictate)
- [`useStopDictate`](#usestopdictate)
- [`useStyleOptions`](#usestyleoptions)
- [`useStyleSet`](#usestyleset)
- [`useSubmitSendBox`](#usesubmitsendbox)
- [`useSuggestedActions`](#usesuggestedactions)
- [`useUserID`](#useuserid)
- [`useUsername`](#useusername)
- [`useWebSpeechPonyfill`](#usewebspeechponyfill)

## `useActivities`

```js
useActivities(): [Activity[]]
```

This function will return a list of activities.

## `useActivityRenderer`

```js
useActivityRenderer(): [ActivityMiddleware]
```

This function will return an activity renderer middleware. The middleware pattern is very similar to Redux. For example, a passthru middleware would looks like the following code.

```js
() => next => { activity, timestampClassName } => children => next({ activity, timestampClassName })(children)
```

## `useAttachmentRenderer`

```js
useAttachmentRenderer(): [AttachmentMiddleware]
```

This function will return an activity renderer middleware. The middleware pattern is very similar to Redux. For example, a passthru middleware would looks like the following code.

```js
() => next => { activity, attachment } => next({ activity, attachment })
```

## `useAvatarForBot`

```js
useAvatarForBot(): [{
  image: string,
  initials: string
}]
```

This function will return the image and initials of the bot. Both image and initials are optional and can be falsy.

## `useAvatarForUser`

```js
useAvatarForUser(): [{
  image: string,
  initials: string
}]
```

This function will return the image and initials of the user. Both image and initials are optional and can be falsy.

## `useClockSkewAdjustment`

```js
useClockSkewAdjustment(): [number]
```

This function will return the clock skew between the client and the server, represented in milliseconds.

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
- `uninitialized`: Never connect

## `useDictateInterims`

```js
useDictateInterims(): [string[][]]
```

This function will return interims for dictation.

## `useDictateState`

```js
useDictateState(): [string]
```

This function will return the dictate state of:

- `0`: Idle
- `1`: Starting
- `2`: Dictating
- `3`: Stopping

## `useDisabled`

```js
useDisabled(): [boolean]
```

This function will return whether the UI should be disabled or not. All interactable UI components should honor this value.

## `useFocusSendBox`

```js
useFocusSendBox(): void
```

When calling this function, it will send focus to the send box.

## `useGrammars`

```js
useGrammars(): [string[]]
```

This function will return the grammars for speech-to-text.

## `useGroupTimestamp`

```js
useGroupTimestamp(): [number]
```

This function will return the interval for grouping similar activities with a single timestamp. The interval is represented in milliseconds.

For example, if this value is `5000`, activities with successive within 5 seconds will not have timestamp shown.

## `useLanguage`

```js
useLanguage(): [string]
```

This function will return the language of the UI. All UI components should honor this value.

## `useLastTypingAt`

```js
useLastTypingAt(): [{
  [id: string]: number
}]
```

This function will return a map of last typing time of all participants. The time is based on client clock.

## `useLocalize`

```js
useLocalize(identifier: string): string
```

This function will return a localized string represented by the identifier. It honor the language settings from `useLanguage` hook.

## `useMarkActivityAsSpoken`

```js
useMarkActivityAsSpoken(activity: Activity): void
```

When called, this function will mark the activity as spoken and remove it from the text-to-speech queue.

## `usePerformCardAction`

```js
usePerformCardAction({
  displayText: string,
  text: string,
  type: string,
  value: string
}): void
```

When called, this function will perform the card action based on its `type`. The card action will be performed by `cardActionMiddleware`.

## `usePostActivity`

```js
usePostActivity(activity: Activity): void
```

When called, this function will post the activity on behalf of the user, to the bot.

## ~`useReadyState`~

## `useReferenceGrammarID`

```js
useReferenceGrammarId(): [string]
```

When called, this function will return the reference grammar ID used to improve speech-to-text performance when used with Cognitive Services.

## `useRenderMarkdown`

```js
useRenderMarkdown(): (markdown: string): string
```

This function will return a function that render Markdown into HTML.

## `useScrollToEnd`

```js
useScrollToEnd(): (): void
```

This function will return a function that when called, it will scroll the transcript view to the end.

## `useSelectVoice`

```js
useSelectVoice(): (voices: SpeechSynthesisVoice[], activity: Activity[]): SpeechSynthesisVoice
```

This function will return a function that can be called to select the voice for a specific activity.

## `useSendBoxRef`

```js
useSendBoxRef(): React.Ref
```

This function will return a React Ref object that reference the focusable send box element.

## `useSendBoxValue`

```js
useSendBoxValue(): [string, (value: string): void]
```

This function will return the value of the send box, and the setter function to change the value.

## `useSendEvent`

```js
useSendEvent(name: string, value: string): void
```

When called, this function will send an event activity to the bot.

## `useSendFiles`

```js
useSendFiles(files: File[]): void

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
useSendMessage(text: string, method: string): void
```

When called, this function will send a text message activity to the bot.

You can optionally include the input method the text message is collected. Currently, if specified, only `speech` is supported.

## `useSendMessageBack`

```js
useSendMessageBack(value: any, text: string, displayText: string): void
```

When called, this function will send a `messageBack` activity to the bot.

## `useSendPostBack`

```js
useSendPostBack(value: any): void
```

When called, this function will send a `postBack` activity to the bot.

## `useSendTypingIndicator`

```js
useSendTypingIndicator(): [boolean]
```

This function will return whether typing indicator will be send to the bot when the send box value is changed.

## `useShouldSpeakIncomingActivity`

```js
useShouldSpeakIncomingActivity(): [boolean, (value: boolean): void]
```

This function will return whether the next incoming activity will be queued for text-to-speech or not, and a setter function to control the behavior.

## `useStartDictate`

```js
useStartDictate(): void
```

This function will open the microphone for dictation. You should only call this function by user-initiated gesture. Otherwise, the browser may block access to the microphone.

## `useStopDictate`

```js
useStopDictate(): void
```

This function will close the microphone. It will not send the interims to the bot, but leave the interims in the send box.

## `useStyleOptions`

```js
useStyleOptions(): [StyleOptions]
```

This function will return the style options. UI components should honor the styling preferences.

## `useStyleSet`

```js
useStyleSet(): [StyleSet]
```

This function will return the style set.

## `useSubmitSendBox`

```js
useSubmitSendBox(): void
```

This function will send the text in the send box to the bot, and clear the send box.

## `useSuggestedActions`

```js
useSuggestedActions(): [CardAction[]]
```

This function will return a list of suggested actions that should show to the user.

## `useTimeoutForSend`

```js
useTimeoutForSend(): [number]
```

This function will return the interval before a sending activity is considered fail. The interval is represented in milliseconds. Due to network partitioning problem, activity that failed to send could eventually successfully deliver to the bot.

## `useUserID`

```js
useUserID(): [string]
```

This function will return the user ID.

## `useUsername`

```js
useUsername(): [string]
```

This function will return the username.

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

# Component-specific hooks

These are hooks specific provide specific user experience.

## `MicrophoneButton`

These are hooks that are specific for the microphone button.

- [`useMicrophoneButtonClick`](#usemicrophonebuttonclick)
- [`useMicrophoneButtonDisabled`](#usemicrophonebuttondisabled)

### `useMicrophoneButtonClick`

```js
useMicrophoneButtonClick(): void
```

When called, this function will toggle microphone open or close.

### `useMicrophoneButtonDisabled`

```js
useMicrophoneButtonDisabled(): void
```

This function will return whether the microphone button is disabled. This is more than `useDisabled()`. The microphone button could be disabled because it is currently starting or stopping.

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
useTextBoxSubmit(setFocus: boolean): void
```

This function will send the text box value as a message to the bot. In addition to the original `useSubmitSendBox` hook, this function will also scroll to bottom and optionally, set focus to the send box.

The focus is useful for phone scenario, where virtual keyboard will only be shown when a text box is focused.

### `useTextBoxValue`

```js
useTextBoxValue(): [string, (value: string): void]
```

This function will return the text box value, and a setter function for the value.

The setter function will also stop dictation if started.

## `TypingIndicator`

These are hooks that are specific to the typing indicator.

- [`useTypingIndicatorVisible`](#usetypingindicatorvisible)

### `useTypingIndicatorVisible`

This function will return whether the typing indicator should be visible or not. This function is time-sensitive, means, the value could varies based on the clock.

This function derive the visibility of the typing indicator by:

- `typingAnimationDuration` value specified in style options, in milliseconds
- Values from the `useLastTypingAt` hook

## `UploadButton`

These are hooks that are specific to the upload button.

- [`useUploadButtonSendFiles`](#useuploadbuttonsendfiles)

### `useUploadButtonSendFiles`

```js
useUploadButtonSendFiles: (files: File[]): void
```

This function is intended to simplify the handling of converting files into attachments.

When called with an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File), this function will call `useSendFiles` hook with the following additional behaviors:

- Convert [File](https://developer.mozilla.org/en-US/docs/Web/API/File) into object URL
- Generate thumbnail and will use Web Worker and offscreen canvas if supported
