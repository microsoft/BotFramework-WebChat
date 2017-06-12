# Adaptive Cards in Microsoft Bot Framework WebChat

WebChat now supports [Adaptive Cards](http://adaptivecards.io/) which you can use to achieve a greater level of rich display and interactivity in your bot's UX. Adaptive Cards are a general purpose technology which may be used in a wide variety of applications, but you should be aware of the specific constraints when using them within the WebChat environment.

## Create and Send an Adaptive Card from your bot

Please see the Bot Framework documentation site for examples of how to create and send an Adaptive Card from either [Node.js](https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-send-rich-cards#send-an-adaptive-card), [.NET](https://docs.microsoft.com/en-us/bot-framework/dotnet/bot-builder-dotnet-add-rich-card-attachments#adaptive-card), or [REST](https://docs.microsoft.com/en-us/bot-framework/rest-api/bot-framework-rest-connector-add-rich-cards#a-idadaptive-carda-add-an-adaptive-card-to-a-message).

## WebChat Implementation details

### Actions

An Adaptive Card [may afford actions](http://adaptivecards.io/documentation/#create-cardschema) which define buttons that the user may click. There are 4 types of Adaptive Card actions:

| Action Type | Implementation details |
|---|---|
| Action.Http | **Not Supported in WebChat**. WebChat will filter out any actions which have the "Action.Http" type, and they will not be displayed. This applies to actions on the root card as well as sub-cards. The recommendation is to use Action.Submit instead, then execute any HTTP requests on the server-side within your bot code. |
| Action.OpenUrl  | Supported. Will open the URL in a new browser tab. |
| Action.ShowCard | Supported. May change the size of your card. |
| Action.Submit   | Supported. The `data` property of the action may be a string or it may be an object. A string will be passed back to your bot as a Bot Builder SDK `imBack` activity, and an object will be passed as a `postBack` activity. Activities with `imBack` will appear in the chat stream as a user-entered reply; `postBack` activities are not displayed. |

### Bot Builder SDK cards are now Adaptive

The existing Bot Builder SDK card types (Hero, Thumbnail, Audio, Video, Animation, SignIn, Receipt) are now implemented as Adaptive Cards. You may see some rendering differences from previous versions of WebChat, but these should be improvements because the card is adapted to the fields you've populated in your message object.

SDK cards may specify a tap action on the entire card. Since Adaptive Cards have introduced interactive elements, the tap action will not be invoked unless the tap event occurs on a non-interactive element.

Audio and Video are not yet part of the Adaptive Cards schema. So, SDK Audio and Video cards are implemented as a Media element followed by an Adaptive Card.

### Design considerations for WebChat display

* Action buttons are displayed at full card width by default. Each button will occupy its own vertical space. In the previous WebChat, buttons followed a word-wrap layout. The recommendation is to not use more than 5 or so buttons, depending on card content, such that the entire card may be readable on screen.

* Adaptive Cards may define columns of data. It is common for a WebChat to be a sidebar or otherwise narrow window. Having many columns may force a layout wider than the typical chat.

* Adaptive Cards do not currently have a layout model which is constrained by device size. Compare this to CSS Media Queries which allow this type of styling. Again, the recommendation is to simply limit the number of columns in your card.

* As any other card, Adaptive Cards can be shown in a carousel.

## Error handling

There are two levels of errors of Adaptive Cards.

1. Your Adaptive Card is in JSON format and should adhere to a schema. If your JSON does not validate to the schema then an error will result.

2. Your JSON is valid yet still does not produce a renderable card, or an unforeseen error occurs.

In these scenarios, WebChat may show an error card to the end user.

## Style customization

### Overview
It is important to first understand how [Adaptive Cards separates the concerns of card content vs presentation style](http://adaptivecards.io/documentation/#about-overview). The cards produced by your bot are pure semantic content, and the presentation style is driven by a [Host Configuration](http://adaptivecards.io/documentation/#display-hostconfigschema) JSON structure. Style aspects such as font, color and margin sizes are specified in the Host Configuration. WebChat is unique in that is the only Bot Framework channel where the bot developer can customize the look and feel of the channel. So, in other channels, the Adaptive Cards Host Configuration is not under the bot devloper's control.

### Embedding

The Adaptive Cards Host Configuration is stored in the `/adaptivecards-hostconfig.json` file. This file's content will be embedded into `/botchat.js` when you issue the `webpack` command. If you have created a Host Configuration file, replace the contents of `/adaptivecards-hostconfig.json`, then webpack.

### Creating

You may wish to create your Host Configuration using SCSS in this repo. This method allows you to share variables (which may contain font, color and margins) between CSS and the Adaptive Cards Host Configuration. Find the file `/src/scss/includes/adaptive-card-config.scss` and modify its contents. Then you can run the command `npm run build-ac-config` which will create the `/adaptivecards-hostconfig.json` file for you from the SCSS source. Then you can embed the JSON file as described above.

If you change an SCSS resource that is shared by both your CSS and the Adaptive Cards Host Configuration, such as `/src/scss/includes/colors.scss` or `/src/scss/includes/settings.scss`, you may wish to build both `/botchat.css` and `/adaptivecards-hostconfig.json` by running the command `npm run build-all-style`.