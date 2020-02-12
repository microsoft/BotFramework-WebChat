# Localization

Starting from Web Chat 4.8, a dedicated team at Microsoft will start localizing our UI for 44 languages.

## Adding a new language

To add a new language, please update following files:

-  Update `/packages/component/src/Localization/overrides.json` and add the language according to Unicode CLDR.
   -  `GLOBALIZE_LANGUAGE` is the language code used for referencing Unicode CLDR
      -  To see the supported list of Unicode CLDR, look under `/packages/component/node_modules/cldr-data/main/`.
   -  (Optional) `TEXT_TO_SPEECH` is used to indicate the language code for speech.
      -  Some locales has different oral but share same written language with other locales. For example, written language in Hong Kong and Taiwan are Traditional Chinese, while oral languages are Cantonese and Taiwanese Mandarin respectively.
      -  The language code used in Web Chat only indicate the written language.
      -  Thus, when performing text-to-speech, the language code will be remapped for oral language.
      -  For example, written language in Hong Kong is `zh-Hant-HK`, while the oral language is `zh-HK` (Cantonese). And the written language in Taiwan is `zh-Hant`, while the oral language is `zh-TW` (Taiwanese Mandarin).
   -  (Optional) `COGNITIVE_SERVICES_*` is used to indicate whether the language supported Cognitive Services Speech Services.
      -  `COGNITIVE_SERVICES_SPEECH_TO_TEXT` is used to indicate the language is supported by Cognitive Services Speech-to-Text Service.
      -  `COGNITIVE_SERVICES_TEXT_TO_SPEECH` is used to indicate the language is supported by Cognitive Services Text-to-Speech Service. If the service support neural voices, set it to `"neural"`, otherwise, `true`
      -  https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support
-  Update `/packages/component/src/Utils/normalizeLanguage.js` and add a normalization logic for ISO language.
   -  This is for cleaning up data provided by developers.
   -  For example, if the language starts with `ja`, it will be mapped to `ja-JP`.
-  Add a new language to `/packages/component/src/Localization/`.
   -  Copy `en-US.json` as the base template.

## Updating strings of an existing language

There are two types of supported languages:

- Maintained by Microsoft
- Contributed by the community

For strings that are maintained by Microsoft, please file a bug to us. It will take us time as we need perform additional checks to maintain the quality.

For strings that are contributed by the community, please submit a pull request to us.

## Adding new strings for new UI

To add new strings to be used in the UI, please update `/packages/component/src/localization/en-US.json`. Our localization team will pick up the new strings and translate them to all other officially supported languages.

## Overriding localization strings

Developers can override localization strings in one of two ways. An `overrideLocalizedStrings` prop will be passed and it can either be a plain object or a function.

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

## Design

### User stories

The localization feature is backed by these user stories:

-  Translated by Microsoft localization team with automated pipeline
-  Overrideable by developers
   -  Change the "Type your message" placeholder text

### Translated by Microsoft localization team

We support 44 languages, including right-to-left languages, translated by Microsoft localization team. Additional languages by the community are always welcomed.

| Language Code | Language              | Name             |
|---------------|-----------------------|------------------|
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
| `ko-kr`       | Korean                | 한국어              |
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

| Language Code | Language        | Name           | Translator                               |
|---------------|-----------------|----------------|------------------------------------------|
| `ar-EG`       | Egyptian Arabic | اللهجه المصريه | [@midineo](https://github.com/midineo)   |
| `zh-HK`       | Cantonese       | 廣東話         | [@compulim](https://github.com/compulim) |

### JSON file format

This file format is maintained by localization team at Microsoft. An automated pipeline has been set up and will help Web Chat to translate new strings in a matter of days than weeks or months.

### Lock down on strings

For strings that are maintained by Microsoft, they have passed additional checks, for example, profanity check and cultural check, to guarantee the quality of the strings. In order to maintain the quality of these strings, modification of these strings requires additional checks from the localization team.

The additional checks do not applies for strings that are contributed by the community, for example, Egyptian Arabic and Cantonese.

### Overrideable by developers

Developers should have a way to modify existing strings. One of the popular ask is the modify the "Type your message" placeholder text in the message input box.
