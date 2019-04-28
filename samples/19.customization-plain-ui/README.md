# Customizing Web Chat with a plain HTML UI

This sample shows how to use Web Chat without its canned UI component.

When we design Web Chat, we think deeply about customizations. To make customizations great, we design our component in layers. Developers can go into the full experience of Web Chat by using all of our layers as-is. Or they could build their own UI from ground up with our business logic. Or they can opt into our UIs but replacing just a handful of components.

Below is the explanation of different layers of Web Chat.

- [botframework-directlinejs](https://github.com/Microsoft/BotFramework-DirectLineJS) should be eventful and stateless
- [botframework-webchat-core](https://github.com/Microsoft/BotFramework-WebChat/tree/master/packages/core) (a.k.a. Web Chat Core) is using Redux, provide stateful data store but minimal to support various UI frameworks and app scenarios
   - UI framework agnostic: we think about building apps on React Native and Angular (using Redux bindings)
- [botframework-webchat-component](https://github.com/Microsoft/BotFramework-WebChat/tree/master/packages/component) (a.k.a. Web Chat UI) has multiple layers
   - [`Composer`](https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js) is the React context which connect to Web Chat Core. If you want to build a component using Web Chat, you will need to put the component your inside `<Composer>`. This is very similar to Redux `<Provider>` but using React Context instead
   - [`connectToWebChat`](https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/connectToWebChat.js) should provide mechanisms to build components from ground up to support various creative ideas. `connectToWebChat` is very similar to Redux `connect` function, provides access to all data required to build a chat component
   - [`MicrophoneButton.connectMicrophoneButton`](https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/SendBox/MicrophoneButton.js) should provide HOC function to hoist features from Web Chat as props to the connected component. Although this is very similar to `connectToWebChat`, it provide encapsulation of information and business logics required for the specific component
   - [`MicrophoneButton`](https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/SendBox/MicrophoneButton.js) is the actual component developer can use to reproduce the full Web Chat experience

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

The completed code contains multiple files. You can start by reading [`App.js`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/19.customization-plain-ui/src/App.js), which replaces the default Web Chat renderer with [`<PlainWebChat>`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/19.customization-plain-ui/src/PlainWebChat.js) and uses its own UI.

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
