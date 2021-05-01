# Localization

Beginning in Web Chat 4.8, this project shifted from community-provided localization to supporting most languages through a dedicated Microsoft team. As of 2020-02-14, 44 languages are officially maintained by Microsoft. Other languages will continue to be community-supported and -driven.

## Adding a new language

To add a new language, please update the following files:

-  Update [`/packages/component/src/Localization/overrides.json`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/Localization/overrides.json) and add the language according to [Unicode CLDR](https://st.unicode.org/cldr-apps/v#locales///).
   -  `GLOBALIZE_LANGUAGE` is the language code used for referencing Unicode CLDR
      -  To see the supported list of Unicode CLDR, look under `/packages/component/node_modules/cldr-data/main/`.
   -  (Optional) `TEXT_TO_SPEECH` is used to indicate the language code for speech.
      -  Some locales have different oral languages, but share same written language with other locales. For example, the written language in both Hong Kong SAR and Taiwan are Traditional Chinese, while oral languages are Cantonese and Taiwanese Mandarin respectively.
      -  The language code used in Web Chat only indicates the written language.
      -  Thus, when performing text-to-speech, the language code will be remapped to the oral language.
      -  For example, the written language in Hong Kong SAR is `zh-Hant-HK`, while the oral language is `zh-HK` (Cantonese). Meanwhile, the written language in Taiwan is `zh-Hant`, and the oral language is `zh-TW` (Taiwanese Mandarin).
   -  (Optional) `COGNITIVE_SERVICES_*` is used to indicate whether the language is supported by Cognitive Services Speech Services.
      -  `COGNITIVE_SERVICES_SPEECH_TO_TEXT` is used to indicate that the language is supported by Cognitive Services Speech-to-Text Service.
      -  `COGNITIVE_SERVICES_TEXT_TO_SPEECH` is used to indicate that the language is supported by Cognitive Services Text-to-Speech Service. If the service supports neural voices, set it to `"neural"`; otherwise, `true`
      -  [List of supported languages](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support)
-  Update [`/packages/component/src/Utils/normalizeLanguage.js`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/Utils/normalizeLanguage.js) and add a normalization logic for ISO language.
   -  This is for cleaning up data provided by developers.
   -  For example, if the language starts with `ja`, it will be mapped to `ja-JP`.
   -  Add a test to [`normalizeLanguage.spec.js`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/Localization/normalizeLanguage.spec.js)
-  Add a new language to [`/packages/component/src/Localization/`](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/component/src/Localization).
   -  Copy `en-US.json` as the base template.
   -  Add to [`getAllLocalizedStrings.js`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/Localization/getAllLocalizedStrings.js)
   -  Add a test to [`getAllLocalizedStrings.spec.js`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/Localization/getAllLocalizedStrings.spec.js)

### Designing new strings

When designing new strings, please consider its localizability:

-  Words with plural forms are not recommended
   -  "Number of files uploaded: 10" is preferred over "10 files uploaded"
   -  Some languages may have up to 6 variations of the same strings
   -  Also true for ordinal, for example, "1st activity", "2nd activity", etc
-  String concatenation are not recommended
   -  Prefer to use template instead
   -  Some languages may concatenate in a way that is different from English

## Updating strings of an existing language

There are two types of supported languages:

-  Maintained by Microsoft
-  Contributed by the community

For strings that are maintained by Microsoft, please file a bug to the Web Chat repo. Validation will be performed on these changes to maintain high quality.

For strings that are contributed by the community, please submit a pull request to the Web Chat repo.

## Adding new strings for new UI

To add new strings to be used in the UI, please update [`/packages/component/src/localization/en-US.json`](https://github.com/microsoft/BotFramework-WebChat/blob/main/packages/component/src/localization/en-US.json). The localization team will pick up the new strings and translate them to all other officially supported languages.

## Overriding localization strings

Developers can override localization strings in one of two ways. An `overrideLocalizedStrings` prop can be passed either as a plain object or a function in the Web Chat renderer.

<!-- prettier-ignore-start -->
```js
window.WebChat.renderWebChat(
  {
    locale: 'en-US',

    overrideLocalizedStrings: (strings, language) => ({
      ...strings,
      TEXT_INPUT_PLACEHOLDER: 'What is on your mind?'
    }),

    overrideLocalizedStrings: {
      TEXT_INPUT_PLACEHOLDER: 'What is on your mind?'
    }
  },
  document.getElementById('webchat')
);
```
<!-- prettier-ignore-end -->

## Design

### User stories

This localization feature will support the following user stories:

-  Web Chat UI strings will be automatically sent through a pipeline to the Microsoft localization team, which they will translate and perform a pull request for
   -  The pipeline is implemented and owned by the localization team
-  Strings localized by Microsoft localization team will be locked down
   -  Web Chat team can recommend more suitable strings to localization team; the request will be reviewed and validated, then sent back as a pull request
-  Developers can override strings for their own setup of Web Chat without forking our code
   -  For example, developers can change the "Type your message" placeholder text through customization

In the future, if we need to redesign or reimplement this feature, we need to make sure the new version will fulfill these user stories or update them as needed.

### Translated by Microsoft localization team

Web Chat officially supports 44 languages translated by the Microsoft localization team, which includes right-to-left languages.
Additional languages contributed and maintained by the community are always welcome.

| Language Code | Language              | Name             |
| ------------- | --------------------- | ---------------- |
| `ar-SA`       | Arabic (Saudi Arabia) | اَلْعَرَبِيَّةُ  |
| `eu-ES`       | Basque                | euskara          |
| `bg-BG`       | Bulgarian             | Български        |
| `ca-ES`       | Catalan               | català           |
| `zh-Hans`     | Chinese (Simplified)  | 中文(简体)       |
| `zh-Hant`     | Chinese (Traditional) | 中文(繁體)       |
| `hr-HR`       | Croatian              | hrvatski         |
| `cs-CZ`       | Czech                 | čeština          |
| `da-DK`       | Danish                | dansk            |
| `nl-NL`       | Dutch                 | Nederlands       |
| `en-US`       | English               | English          |
| `et-EE`       | Estonian              | eesti            |
| `fi-FI`       | Finnish               | suomi            |
| `fr-FR`       | French                | français         |
| `gl-ES`       | Galician              | galego           |
| `de-DE`       | German                | Deutsch          |
| `el-GR`       | Greek                 | Ελληνικά         |
| `he-IL`       | Hebrew                | עברית            |
| `hi-IN`       | Hindi                 | हिंदी            |
| `hu-HU`       | Hungarian             | magyar           |
| `id-ID`       | Indonesian            | Bahasa Indonesia |
| `it-IT`       | Italian               | italiano         |
| `ja-JP`       | Japanese              | 日本語           |
| `kk-KZ`       | Kazakh                | Қазақ            |
| `ko-kr`       | Korean                | 한국어           |
| `lv-LV`       | Latvian               | latviešu         |
| `lt-LT`       | Lithuanian            | lietuvių         |
| `ms-MY`       | Malay                 | Bahasa Melayu    |
| `nb-NO`       | Norwegian (Bokmål)    | norsk (bokmål)   |
| `pl-PL`       | Polish                | Polski           |
| `pt-BR`       | Portuguese (Brazil)   | Português        |
| `pt-PT`       | Portuguese (Portugal) | português        |
| `ro-RO`       | Romanian              | română           |
| `ru-RU`       | Russian               | Русский          |
| `sr-Cyrl`     | Serbian (Cyrillic)    | српски           |
| `sr-Latn`     | Serbian (Latin)       | srpski           |
| `sk-SK`       | Slovak                | slovenčina       |
| `sl-SI`       | Slovenian             | slovenski        |
| `es-ES`       | Spanish               | español          |
| `sv-SE`       | Swedish               | svenska          |
| `th-TH`       | Thai                  | ไทย              |
| `tr-TR`       | Turkish               | Türkçe           |
| `uk-UA`       | Ukrainian             | українська       |
| `vi-VN`       | Vietnamese            | Tiếng Việt       |

### Community-contributed languages

| Language Code | Language         | Name            | Translator                               |
| ------------- | ---------------- | --------------- | ---------------------------------------- |
| `ar-EG`       | Egyptian Arabic  | اللهجه المصريه  | [@midineo](https://github.com/midineo)   |
| `ar-JO`       | Jordanian Arabic | اللهجة الأردنية | muminasaad, Odai Hatem AbuGaith          |
| `yue`         | Cantonese        | 廣東話          | [@compulim](https://github.com/compulim) |

### JSON file format

This file format is maintained by the localization team at Microsoft, where an automated pipeline allows for Web Chat strings to be translated in a timely manner.

### Lock down on strings

Localized strings maintained by Microsoft have passed additional checks, including profanity and cultural checks to guarantee the localization quality. For maintenance purposes, any requested changes must be validated by the localization team.

Additional validation is not required for languages that are contributed by the community, e.g. Egyptian Arabic and Cantonese.

### Overrideable by developers

Developers may modify existing strings for customization purposes. One popular ask is the modification of the "Type your message" placeholder text in the message input box.

### Hooks to streamline internationalization

All `useXXXFormatter` hooks are intended for internationalization using Unicode CLDR data

-  `useByteFormatter` will format file size-related numbers into localized strings
-  `useDateFormatter` will format date in absolute format, similar to `useLocalizeDate`, but with an updated function signature. This hook does not use Unicode CLDR data
-  `useRelativeTimeFormatter` will format time to relative format, using Unicode CLDR data
-  `useLanguage` now accepts options to return oral language instead of written language

## Appendix

### Convert string ID to new format

To support the localization team, all string IDs have been refreshed to a standard format.

The following code is used by the Web Chat team to convert strings from our previous format into new format.

<!-- prettier-ignore-start -->
```js
function convertFromOldStringId(js) {
  const xMinutesAgoRelative = relative =>
    js['X minutes ago'] && js['X minutes ago'](new Date(Date.now() + relative).toISOString());

  return {
    '_.comment':
      '[CI-LOCKED] The content of this file is locked. Contributions are welcomed but it could be delayed as we conduct additional checks.',

    CONNECTIVITY_STATUS_ALT: js.ConnectivityStatus && js.ConnectivityStatus + '$1',
    CONNECTIVITY_STATUS_ALT_CONNECTED: js.CONNECTED_NOTIFICATION,
    CONNECTIVITY_STATUS_ALT_SLOW_CONNECTION: js.SLOW_CONNECTION_NOTIFICATION,
    CONNECTIVITY_STATUS_ALT_FATAL: js.FAILED_CONNECTION_NOTIFICATION,
    CONNECTIVITY_STATUS_ALT_CONNECTING: js.INITIAL_CONNECTION_NOTIFICATION,
    CONNECTIVITY_STATUS_ALT_RECONNECTING: js.INTERRUPTED_CONNECTION_NOTIFICATION,
    CONNECTIVITY_STATUS_ALT_RENDER_ERROR: js.RENDER_ERROR_NOTIFICATION,

    TOAST_ACCORDION_TWO: undefined,
    TOAST_ACCORDION_FEW: undefined,
    TOAST_ACCORDION_MANY: undefined,
    TOAST_ACCORDION_OTHER: undefined,

    TOAST_ALT_ERROR: undefined,
    TOAST_ALT_INFO: undefined,
    TOAST_ALT_SUCCESS: undefined,
    TOAST_ALT_WARN: undefined,
    TOAST_DISMISS_BUTTON: undefined,
    TOAST_TITLE_ALT: undefined,

    ACTIVITY_BOT_SAID:
      js['Bot said something'] && js.SentAt && js['Bot said something']('$1', '$2') + ' ' + js.SentAt + '$3',
    ACTIVITY_USER_SAID:
      js['User said something'] && js.SentAt && js['User said something']('$1', '$2') + ' ' + js.SentAt + '$3',

    ACTIVITY_STATUS_TIMESTAMP_JUST_NOW: xMinutesAgoRelative(0),
    ACTIVITY_STATUS_TIMESTAMP_ONE_MINUTE_AGO: xMinutesAgoRelative(60000),
    ACTIVITY_STATUS_TIMESTAMP_ONE_HOUR_AGO: xMinutesAgoRelative(3600000),
    ACTIVITY_STATUS_TIMESTAMP_TODAY: xMinutesAgoRelative(1440 * 60000 * 1000),
    ACTIVITY_STATUS_TIMESTAMP_YESTERDAY: xMinutesAgoRelative(2880 * 60000 * 1000),
    ACTIVITY_STATUS_SEND_FAILED_RETRY: js.SEND_FAILED_KEY && js.SEND_FAILED_KEY.replace('[retry]', '[RETRY]'),
    ACTIVITY_STATUS_SEND_STATUS_ALT: js.SendStatus && js.SendStatus + '$1',
    ACTIVITY_STATUS_SEND_STATUS_ALT_SENT_AT: js.SentAt && js.SentAt + '$1',
    ACTIVITY_STATUS_SEND_STATUS_ALT_SENDING: js.Sending,

    SUGGESTED_ACTIONS_ALT: js.SuggestedActionsContainer && js.SuggestedActionsContainer + '$1',
    SUGGESTED_ACTIONS_ALT_HAS_CONTENT: js.SuggestedActionsContent,
    SUGGESTED_ACTIONS_ALT_NO_CONTENT: js.SuggestedActionsEmpty,

    ADAPTIVE_CARD_ERROR_BOX_TITLE_PARSE: js['Adaptive Card parse error'],
    ADAPTIVE_CARD_ERROR_BOX_TITLE_RENDER: js['Adaptive Card render error'],

    FILE_CONTENT_ALT: "'$1'",
    FILE_CONTENT_WITH_SIZE_ALT: js.UploadFileWithFileSize && js.UploadFileWithFileSize('', '$1', '$2').trim(),
    FILE_CONTENT_DOWNLOADABLE_ALT: js['Download file'] && js['Download file'] + " '$1'",
    FILE_CONTENT_DOWNLOADABLE_WITH_SIZE_ALT:
      js.DownloadFileWithFileSize && js.DownloadFileWithFileSize(js['Download file'], '$1', '$2').trim(),

    SPEECH_INPUT_LISTENING: js['Listening…'],
    SPEECH_INPUT_STARTING: js['Starting…'],
    SPEECH_INPUT_MICROPHONE_BUTTON_OPEN_ALT: js['Microphone on'],
    SPEECH_INPUT_MICROPHONE_BUTTON_CLOSE_ALT: js['Microphone off'],

    ACTIVITY_ERROR_BOX_TITLE: js.ErrorMessage,

    CAROUSEL_ATTACHMENTS_BOT_ALT: js.BotSent,
    CAROUSEL_ATTACHMENTS_USER_ALT: js.UserSent,

    TYPING_INDICATOR_ALT: js.TypingIndicator,

    TEXT_INPUT_ALT: js.SendBox,
    TEXT_INPUT_PLACEHOLDER: js['Type your message'],
    TEXT_INPUT_SEND_BUTTON_ALT: js.Send,
    TEXT_INPUT_SPEAK_BUTTON_ALT: js.Speak,
    TEXT_INPUT_UPLOAD_BUTTON_ALT: js['Upload file'],

    TRANSCRIPT_NEW_MESSAGES: js['New messages'],

    CAROUSEL_FLIPPER_LEFT_ALT: js.Left,
    CAROUSEL_FLIPPER_RIGHT_ALT: js.Right,

    RECEIPT_CARD_TAX: js.Tax,
    RECEIPT_CARD_TOTAL: js.Total,
    RECEIPT_CARD_VAT: js.VAT
  };
}
```
<!-- prettier-ignore-end -->
