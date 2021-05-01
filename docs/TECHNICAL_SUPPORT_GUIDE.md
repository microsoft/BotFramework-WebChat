# Web Chat Technical Support Guide

This guide is intended to help users and support engineers:

1. Find answers when facing a problem, (e.g. bug) and/or
1. Find feature requests and discussion related to their current topic

before filing a new issue. This will help users discover answers and/or workarounds without needing to wait for a response, and will help the Web Chat team reproduce a reported bug more quickly.

## Table of Contents

1. [Determining a Web Chat concern](#determining-a-web-chat-concern)
1. [Searching samples](#searching-samples)
1. [Searching documentation](#searching-documentation)
1. [Searching FAQ](#searching-faq)
1. [Searching the issues list](#searching-issues)
1. [Searching the Changelog](#searching-Changelog)
1. [Reporting a bug](#reporting-a-bug)
1. [Making a feature request](#making-a-feature-request)
1. [Reporting a new FAQ](#adding-to-faq)
1. [Supporting material](#supporting-material)

## Determining a Web Chat concern

First, please confirm that your question/concern/bug is related to Web Chat. If it is not, you will be better served searching for answers in another place. See the [supporting material](#supporting-material) section for helpful links.

The question is **NOT** related to Web Chat if:

1. You are not using Web Chat
   1. Does the project use Microsoft Teams or another channel for your bot? If yes, you will probably not find helpful information here
1. Your topic is in regards to **bot implementation**, not the Web Chat client. You can use the following links as appropriate:
   1. For implementation questions, search/post a question on [Stack Overflow Bot Framework tag](https://stackoverflow.com/questions/tagged/botframework)
   1. For BotFramework SDK bugs:
      1. [BotBuilder .NET repository](https://github.com/Microsoft/botbuilder-dotnet)
      1. [BotBuilder JavaScript repository](https://github.com/Microsoft/botbuilder-js)
      1. [BotBuilder Python repository](https://github.com/Microsoft/botbuilder-python)
      1. [BotBuilder Java repository](https://github.com/Microsoft/botbuilder-java)
1. Your bug involves an **[Adaptive Card](https://adaptivecards.io/)** that you can reproduce on the [Adaptive Cards Designer](https://adaptivecards.io/designer/)
   1. To test your card in the Designer, copy-paste your card's `json` into the designer. If this card looks the same as your card in Web Chat, see the next sub-bullet
      ![image: Copy-paste your card's json in the Adaptive Cards designer](https://user-images.githubusercontent.com/14900841/99120093-267a8400-25af-11eb-9498-ead629566138.png)
   1. To report an Adaptive Cards bug, search the [Adaptive Cards repository](https://github.com/Microsoft/AdaptiveCards)
1. Your bug exists in other parts of your app/website (not just Web Chat)
1. Note: Web Chat implementation questions should be redirected to Stack Overflow
   1. [Search samples](#searching-samples) for technical guidance of common Web Chat features
   1. For implementation questions, search/post a question on [Stack Overflow Web Chat tag](https://stackoverflow.com/questions/tagged/web-chat)

The question **IS** related to Web Chat if:

1. The topic is related to the bot's UI
1. You are following a Web Chat sample or tutorial and discover a problem
1. You are bumping your version of Web Chat and notice a behavior change from code that worked previously
1. You can reproduce the bug in one browser (e.g. Microsoft Edge) but not another (e.g. Google Chrome)
   1. Note: this may be a browser bug, and therefore not within Web Chat's ability to fix/implement and will need to be reported to the appropriate team
1. The topic is Accessibility, and the problem only occurs in Web Chat
   1. Note: this may be an Assistive Technology (e.g. Windows Narrator, JAWS, NVDA, etc.) problem, and therefore not within Web Chat's ability to fix/implement and will need to be reported to the appropriate team
      1. [Windows Narrator](https://support.microsoft.com/en-us/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1)
      1. [Accessibility Insights](https://github.com/microsoft/accessibility-insights-windows)
      1. [JAWS](https://www.freedomscientific.com/products/software/jaws/)
      1. [NVDA](https://github.com/nvaccess/nvda)
      1. [VoiceOver](https://support.apple.com/guide/voiceover/welcome/10)
      1. [TalkBack](https://support.google.com/accessibility/android/answer/6283677?hl=en)
1. The topic is related to speech.
   1. Note: this may be a speech (Direct Line Speech, Cognitive Services, web browser speech) problem, and therefore not within Web Chat's ability to fix/implement and will need to be reported to the appropriate team
      1. [Direct Line Speech](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/direct-line-speech)
      1. [Cognitive Services Speech SDK](https://github.com/microsoft/cognitive-services-speech-sdk-js)
      1. [Web Speech API](https://wicg.github.io/speech-api/)

## Searching samples

For common implementation scenarios, the Web Chat repository includes a list of samples that may jumpstart your development.

-  [Samples list](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples) (includes demo bots and tutorials)

## Searching documentation

Feel free to peruse our documentation, which is sorted based on general topic. These docs include design decisions, implementation quirks, links to related topics, and more.

-  [Web Chat's repository documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs)
-  [Microsoft Web Chat Docs](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-webchat-overview?view=azure-bot-service-4.0)

## Searching FAQ

Web Chat has several commonly-asked questions, workarounds, and known dependency issues that may address the problem you are currently investigating. If a question comes up more than once, the Web Chat team adds the related issue to the FAQ list for easier perusal.

1. Navigate to the **[FAQ](https://github.com/microsoft/BotFramework-WebChat/issues/1961)**
1. Search for keywords related to your question (e.g. iOS, speech, or Dynamics 365)
   1. Use the brower's search function by pressing <kbd>Ctrl</kbd> + <kbd>F</kbd> (Windows) or <kbd>Cmd</kbd> + <kbd>F</kbd> (OSX)
      ![image: search for keywords](https://user-images.githubusercontent.com/14900841/98878161-28b9d280-2437-11eb-9132-71974b022221.png)
1. Read the high-level information written in the FAQ. If you want more information, click the related link (as applicable)
   ![image: Follow related links](https://user-images.githubusercontent.com/14900841/98877965-9d404180-2436-11eb-8414-9a05723df0de.png)
1. If your FAQ search doesn't produce results, try **different keywords**, as there may be many ways the question has been asked previously
1. If you find an issue that discusses or resolves your problem, please chime in with a thumbsup or comment on that issue
1. If you haven't found what you are looking for, please move on to [searching the issues list](#searching-issues)

## Searching issues

The issues page is where all Web Chat-related discussion is tracked on GitHub. If you did not find something in the FAQ, you may still find it in issues because: a) This topic has not come up multiple times yet, b) It has not yet been added to the FAQ, or c) this topic has already been addressed in a previous discussion, bugfix, or new feature merge

1. Navigate to Web Chat's [issues page](https://github.com/microsoft/BotFramework-WebChat/issues)
1. Using the searchbar, **delete** the text `is:open` from the searchbar
1. In the searchbar, type the keywords related to your topic
   ![image: Use the issues search feature](https://user-images.githubusercontent.com/14900841/99120290-79543b80-25af-11eb-90ca-00d37225ce03.png)
1. For more information on how to search through issues, see the [GitHub search documentation](https://docs.github.com/en/free-pro-team@latest/github/searching-for-information-on-github/searching-issues-and-pull-requests)
1. To add a topic to the FAQ, see [Add a new FAQ](#adding-to-faq)

You can also look for issues by topic:

-  [`Area: Accessibility`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+Accessibility%22)
-  [`Area: Direct Line Speech`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+Direct+Line+Speech%22+)
-  [`Area: Docs`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+Docs%22+)
-  [`Area: Migration Support`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+Migration+Support%22+)
-  [`Area: React Native`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+React+Native%22+)
-  [`Area: Skills`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+Skills%22+)
-  [`Area: Speech`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+Speech%22+)
-  [`Area: SSO`](https://github.com/microsoft/BotFramework-WebChat/issues?q=is%3Aissue+label%3A%22Area%3A+SSO%22+)

If you find an issue that discusses or resolves your problem, please chime in with a thumbsup or comment on that issue.

If this section did not help you, please move on to [reporting a bug](#reporting-a-bug) or [making a feature request](#making-a-feature-request).

## Searching Changelog

All changes made to the Web Chat project are recorded in the repository's [Changelog](https://github.com/microsoft/BotFramework-WebChat/blob/main/CHANGELOG.md). Updates are sorted by release, with most-recent changes at the top of the file.

1. Navigate to the [`CHANGELOG.MD`](https://github.com/microsoft/BotFramework-WebChat/blob/main/CHANGELOG.md).
1. Search for keywords related to your question (e.g. iOS, speech, or Dynamics 365)
   1. Use the brower's search function by pressing <kbd>Ctrl</kbd> + <kbd>F</kbd> (Windows) or <kbd>Cmd</kbd> + <kbd>F</kbd> (OSX)
1. Follow the related links for details, design decisions, and implementation information
   1. PRs also include tests, which may help you find code that helps you achieve your experience goals

[Unreleased] changes have not yet been made generally available, and Web Chat users will need to [test using Web Chat's latest bits](https://github.com/microsoft/BotFramework-WebChat#how-to-test-with-web-chats-latest-bits).

The `CHANGELOG` format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/) and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Reporting a bug

Please note that **the more visual detail, code, and implementation steps you provide, the more quickly we will be able to assist you**.

Before posting your bug, be sure to **remove or hide all PII (Personally identifiable information)** in your screenshots, code, and details.

1. Begin by [filing a new issue as a bug](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose)
   ![image: File a new issue](https://user-images.githubusercontent.com/14900841/99122223-cab1fa00-25b2-11eb-95fd-dd8461a9da28.png)
1. Fill out each section as thoroughly as possible
   -  The more detail you can provide us, the more quickly we can help you
      ![image: Fill out each section of the bug report](https://user-images.githubusercontent.com/14900841/98987085-9b2fbe80-24da-11eb-89ad-74a70bf07146.png)
      1. **Screenshots**
         -  Screenshots are required for visual bugs. To upload a screenshot or video, see the following:
         -  [Take a screenshot on Windows](https://support.microsoft.com/en-us/windows/use-snipping-tool-to-capture-screenshots-00246869-1843-655f-f220-97299b865f6b)
         -  [Record your screen on Windows](https://www.pcmag.com/how-to/how-to-capture-video-clips-in-windows-10)
         -  [Take a screenshot on OSX](https://support.apple.com/en-us/HT201361#:~:text=To%20take%20a%20screenshot%2C%20press,to%20save%20to%20your%20desktop.)
         -  [Record your screen on OSX](https://support.apple.com/en-us/HT208721)
         -  [Take a screenshot on iOS](https://support.apple.com/en-us/HT200289#:~:text=Press%20the%20Side%20Button%20and,swipe%20left%20to%20dismiss%20it.)
         -  [Record your screen on iOS](https://support.apple.com/en-us/HT207935)
         -  [Take a screenshot or record your screen on Android](https://support.google.com/android/answer/9075928?hl=en)
         -  [Upload a screenshot to GitHub](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/file-attachments-on-issues-and-pull-requests) Note: video files must be attached in `.zip` folders
      1. **Version**
         -  The version of Web Chat in your app is required for all bug reports. This helps us quickly test the problem you are experiencing in the correct environment
         -  See the information inside the creating a bug dialog for how to determine your version of Web Chat
      1. **Describe the bug**
         -  List the environment details of where you are experiencing this bug as applicable, including:
            -  Browser
            -  Host app (JS, React, Angular, etc)
            -  Type of Web Chat (CDN, npm, embed)
            -  OS (Windows, iOS, etc)
         -  List the console errors you are seeing, if any (screenshots of these also help)
         -  Describe the bug as specifically as possible
         -  Provide screenshots of any relevant network activity
            -  [Inspect the network panel in Microsoft Edge](https://docs.microsoft.com/en-us/microsoft-edge/devtools-guide/network)
            -  [Inspect network activity in Google Chrome](https://developers.google.com/web/tools/chrome-devtools/network)
            -  [Use the network monitor on Mozilla Firefox](https://developer.mozilla.org/en-US/docs/Tools/Network_Monitor)
      1. **Steps to reproduce**
         -  Provide a detailed step-by-step of how the bug is experienced (required). Be sure to include:
            -  Typed or spoken commands
            -  Dialog interactions (e.g. button clicks)
         -  Provide the environment that reproduces the bug (required; see options below)
            -  Link to a hosted 'basic bot' that reproduces your specific issue
               -  This is the easiest way of avoiding the accidental exposure of PII, and guarantees that we can reproduce your issue
               -  [Deploy a bot to Azure](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-deploy-az-cli?view=azure-bot-service-4.0&tabs=javascript#deploy-code-to-azure)
                  -  Since this is a temporary deployment, you can use the free pricing tier (F0) to avoid additional costs
            -  Link to your existing bot (removing all PII)
            -  Provide the settings and command(s) that reproduce the bug on the [Web Chat Playground](https://webchat-playground.azurewebsites.net/)
         -  If your bug is related to an Adaptive Card, **please provide your card's `json` (with PII removed)**
         -  If your bug is related to an incoming activity, please provide the activity details (with PII removed)
      1. **Expected behavior**
         -  Provide a summary of what you expect to happen when the scenario is working correctly
      1. **Additional context** (more info is better!)
         -  Include links to any related samples, issues, pull requests, or documentation

## Making a feature request

Once you have determined that your desired enhancement has not been requested yet, feel free to make the request yourself.

1. Begin by [filing a new issue as feature request](https://github.com/microsoft/BotFramework-WebChat/issues/new/choose)
   ![image: File a new feature request](https://user-images.githubusercontent.com/14900841/99122281-e0bfba80-25b2-11eb-86ed-af07a67cdfdc.png)
1. Describe your request
1. Describe use-cases for this feature
1. Include screencaps as applicable
1. Include links to any related samples, issues, pull requests, or documentation

## Adding to FAQ

In case you find a discussion that should be added to the FAQ, please let us know!

Leave a new comment on the **[FAQ](https://github.com/microsoft/BotFramework-WebChat/issues/1961)**, and we will add it to the main list.

Thanks for the help!

## Supporting material

### Web Chat

-  [Web Chat FAQ](https://github.com/microsoft/BotFramework-WebChat/issues/1961)
-  [Web Chat labelling docs](https://github.com/microsoft/BotFramework-WebChat/blob/main/docs/LABELLING.md) - this explains the labelling guidelines for GitHub issues, which may help you find what you are looking for
-  [Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)
-  [Web Chat Changelog](https://github.com/microsoft/BotFramework-WebChat/blob/main/CHANGELOG.md)
-  [Stack Overflow Web Chat tag](https://stackoverflow.com/questions/tagged/web-chat)
-  [Web Chat's repository documentation](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs)
-  [Microsoft Docs](https://docs.microsoft.com/en-us/azure/bot-service/bot-builder-webchat-overview?view=azure-bot-service-4.0)

### BotFramework SDK

-  [BotBuilder .NET repository](https://github.com/Microsoft/botbuilder-dotnet)
-  [BotBuilder JavaScript repository](https://github.com/Microsoft/botbuilder-js)
-  [BotBuilder Python repository](https://github.com/Microsoft/botbuilder-python)
-  [BotBuilder Java repository](https://github.com/Microsoft/botbuilder-java)

### Accessibility

-  [Windows Narrator](https://support.microsoft.com/en-us/windows/complete-guide-to-narrator-e4397a0d-ef4f-b386-d8ae-c172f109bdb1)
-  [Accessibility Insights](https://github.com/microsoft/accessibility-insights-windows)
-  [JAWS](https://www.freedomscientific.com/products/software/jaws/)
-  [NVDA](https://github.com/nvaccess/nvda)
-  [VoiceOver](https://support.apple.com/guide/voiceover/welcome/10)
-  [TalkBack](https://support.google.com/accessibility/android/answer/6283677?hl=en)

### Adaptive Cards

-  [Adaptive Cards repository](https://github.com/Microsoft/AdaptiveCards)
-  [Adaptive Card Designer](https://adaptivecards.io/designer/)

### Speech

-  [Direct Line Speech](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/direct-line-speech)
-  [Cognitive Services Speech SDK](https://github.com/microsoft/cognitive-services-speech-sdk-js)
-  [Web Speech API](https://wicg.github.io/speech-api/)

### GitHub

-  [Official GitHub documentation](https://docs.github.com/en/free-pro-team@latest/github)
-  [Upload a screenshot to GitHub](https://docs.github.com/en/free-pro-team@latest/github/managing-your-work-on-github/file-attachments-on-issues-and-pull-requests) Note: video files must be attached in `.zip` folders
