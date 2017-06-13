# Adaptive Cards in Microsoft Bot Framework WebChat

## Introduction
The Bot Framework WebChat component now supports [Adaptive Cards](http://adaptivecards.io/), which you can use to achieve a greater level of rich content display and interactivity in your bot messages. Adaptive Cards are a general-purpose technology which may be used in a wide variety of applications. This document focuses on the implementation of Adaptive Cards in the context of Bot Framework.

## Getting Started with Adaptive Cards
The best way to get started with Adaptive cards is to look at the platform-specific example code. The BotBuilder SDK repository on GitHub provides examples of how to create and send an Adaptive Card for each of the supported platforms: 
   - [Node SDK > Add rich card attachments to messages > Send an Adaptive card](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards#send-an-adaptive-card)
   - [.NET SDK > Add rich card attachments to messages > Send an Adaptive card](https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-add-rich-card-attachments#adaptive-card)
   - [Direct Line REST API > Add rich card attachments to messages > Add an Adaptive card to a message](https://docs.microsoft.com/en-us/bot-framework/rest-api/bot-framework-rest-connector-add-rich-cards#a-idadaptive-carda-add-an-adaptive-card-to-a-message).

## WebChat Implementation Details

### Card Actions
Adaptive Cards provide the ability to define clickable buttons in a card message which will trigger one of the following four action types.

| Action Type | Implementation details |
|---|---|
| Action.Http | **Not Supported in WebChat**. WebChat will filter out any actions which have the "Action.Http" type, and they will not be displayed. This applies to actions on the root card as well as sub-cards. The recommendation is to use Action.Submit instead, then execute any HTTP requests on the server-side within your bot code. |
| Action.OpenUrl  | Supported. Will open the URL in a new browser tab. |
| Action.ShowCard | Supported. May change the size of your card. |
| Action.Submit   | Supported. The `data` property of the action may be a string or it may be an object. A string will be passed back to your bot as a Bot Builder SDK `imBack` activity, and an object will be passed as a `postBack` activity. Activities with `imBack` will appear in the chat stream as a user-entered reply; `postBack` activities are not displayed. |

### BotBuilder Rich Cards are now Adaptive Cards

The existing BotBuilder SDK Rich Cards - Hero, Thumbnail, Audio, Video, Animation, SignIn, Receipt - are now implemented as Adaptive Cards. [You may see some rendering differences from previous versions of WebChat, but these should be improvements because the card is adapted to the fields you've populated in your message object.] **NW: This line could be removed. Reason: Its not exactly clear what improvements you are referring to here - maybe provide some examples?**

Cards may specify a tap action on the entire card. **NW: How? Inquiring minds want to know** Since Adaptive Cards have introduced interactive elements, the tap action will not be invoked unless the tap event occurs on a non-interactive element. **NW: this section needs clarification. Eg. what is interactive vs non-interactive? How is it configured?**

Audio and Video are not yet part of the Adaptive Cards schema.**NW: What's the plan? Will they be ported over at some point?** So, Bot Builder SDK Audio and Video cards are implemented as a Media element followed by an Adaptive Card.

### Design considerations for WebChat display

* Action buttons are displayed at full card width by default. **NW: saw the full width buttons on Cortana cards and it looks terrible. There should be some margin around the buttons.** Each button will occupy its own vertical space. In the "Rich Card" implementation of Cards, buttons followed a word-wrap layout. To maintain button text readability across channels, we recommend a best practice of five (5) buttons per card, maximum.

* Adaptive Cards may define columns of data. It is common for a WebChat to be a sidebar or otherwise narrow window. Having many columns may force a layout wider than the typical chat.

* Adaptive Cards do not currently have a layout model which is constrained by device size. Compare this to CSS Media Queries which allow this type of styling. Again, the recommendation is to simply limit the number of columns in your card.

* As any other card, Adaptive Cards can be shown in a carousel. **NW: this last point could be removed. Reason: nothing changed with respect to carousel display of cards, its covered in the Bot Framework docs already**

## Handling Errors

There are two levels of errors of Adaptive Cards. **NW: provide more detail here. For example, why should the developer care about errors? What is the specific scenario where error handling becomes an issue for bot developers?**

1. Your Adaptive Card is in JSON format and should adhere to a schema. If your JSON does not validate to the schema then an error will result. **NW: needs more detail - Eg. when and where would this potential error occur? During a build task? In dev? localhost? When deployed? In the channel when sending the card attachment?**

2. Your JSON is valid yet still does not produce a renderable card, or an unforeseen error occurs. **NW: needs clarification - why would the JSON be "valid" but not produce a renderable card? Do you mean valid as in regular old JSON object, but not conforming to the adaptive cards schema? If so, then say that explicitly.

In these scenarios, WebChat may show an error card to the end user. **NW: remove this line, redundant + does not add any new information**

## Customizing Cards for WebChat

> Note: WebChat is the only channel that supports custom styling of Adaptive Cards. Channels such as Skype will not recognize host config files, even if they are present. **NW: moved this info to top to increase discoverability**

### Overview
It is important to first understand how [Adaptive Cards separates the concerns of card content vs presentation style](http://adaptivecards.io/documentation/#about-overview). The cards produced by your bot are pure semantic content, and the presentation style is driven by a JSON config file named [`adaptivecards-hostconfig.json`](http://adaptivecards.io/documentation/#display-hostconfigschema). Styling properties such as font, color and margin sizes are specified in this file.

### Build
The Adaptive Cards Host Configuration is stored in the file `/adaptivecards-hostconfig.json`. **NW: Where? In this repository?**. The `adaptivecards-hostconfig.json` contents will be imported into the file `/botchat.js` when you build the project by running `webpack`. If you have created a host Configuration file, replace the contents of `/adaptivecards-hostconfig.json`, then run `webpack`. **NW: might be good to add an NPM build script to the package.json file - this would allow the user to build the project by running `npm run build` instead of having to know about webpack**

### Use SCSS instead of CSS
You may wish to create your Host Configuration using SCSS in this repo. This method allows you to share variables (which may contain font, color and margins) between CSS and the Adaptive Cards Host Configuration. Find the file `/src/scss/includes/adaptive-card-config.scss` and modify its contents. Then you can run the command `npm run build-ac-config` which will create the `/adaptivecards-hostconfig.json` file for you from the SCSS source. Then you can embed the JSON file as described above.

If you change an SCSS resource that is shared by both your CSS and the Adaptive Cards Host Configuration, such as `/src/scss/includes/colors.scss` or `/src/scss/includes/settings.scss`, you may wish to build both `/botchat.css` and `/adaptivecards-hostconfig.json` by running the command `npm run build-all-style`.
