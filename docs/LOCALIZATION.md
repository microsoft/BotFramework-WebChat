# Localization

Starting from Web Chat 4.8, a dedicated team at Microsoft will start localizing our UI for 44 languages.

## Adding a new language

To add a new language, please update following files:

-  Update `/packages/component/scripts/languages.json` and add the language according to Unicode CLDR
   -  For example, there is no `en-US` in Unicode CLDR, it should be `en` instead
   -  To see a list of locale for Unicode CLDR, look under `/packages/component/node_modules/cldr-data/main/`
-  Update `/packages/component/src/Utils/toGlobalizeLanguaage.js` and add a mapping from ISO language to Unicode CLDR
   -  For example, `en-US` should be mapped to `en`
-  Update `/packages/component/src/Utils/normalizeLanguage.js` and add a normalization logic for ISO language
   -  This is for cleaning up data provided by developers
   -  For example, if the language starts with `ja`, it will be mapped to `ja-JP`
-  Add a new language to `/packages/component/src/Localization/`
   -  Copy `en-US.json` as the base template

## Updating strings of an existing language

There are two types of supported languages:

- Maintained by Microsoft
- Maintained by the community

For strings that are maintained by Microsoft, please file a bug to us. We need to verify to make sure new strings pass our additional checks.

For strings that are maintained by the community, please submit a pull request to us.

## Adding new strings for new UI

To add new strings to be used in the UI, please update `/packages/component/src/localization/en-US.json`. Our localization team will pick up the new strings and translate them to all other officially supported languages.

## Overriding localization database

(TBD)
