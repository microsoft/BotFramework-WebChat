# Customizing Web Chat with a plain HTML UI

This sample shows how to use Web Chat without its UI component.

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/19.customization-plain-ui)

# Things to try out

- Type `image` in the send box
   - It should show an image
- Type `suggested-actions` in the send box
   - `imBack`, `messageBack`, and `postBack` button should work as expected
- Type `card bingsports` in the send box
   - Unsupported attachment will be rendered as preformatted JSON

# Code

This project is based on [`create-react-app`](https://github.com/facebook/create-react-app).

The completed code contains multiple files. You can start by reading [`App.js`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/19.customization-plain-ui/src/App.js), which replaces the default Web Chat renderer with PlainWebChat and uses its own UI.

## Goals of this bot

This project has two goals:

- Using Web Chat without using any of its UI component
- Build your own highly-customized UI with minimal functionalities
   - Support suggested actions
   - Support `imBack`, `messageBack`, and `postBack`
   - Support rendering hyperlinks

Although UI is main part of Web Chat, the state machine and business logic in Web Chat core is very valuable for building your highly-customized chat UI.

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
