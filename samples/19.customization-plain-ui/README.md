# Customizing Web Chat with a plain HTML UI

This sample shows how to use Web Chat without its canned UI component.

When we designed Web Chat, we heavily considered the importance of customization. To make customization great and accessible, we designed our components in layers. Developers can get the full experience of Web Chat by:

1. using all of our layers as-is,
2. building their own UI from the ground up using Web Chat's business logic, or
3. opting into our UI but replacing just a handful of components as needed.

Below is the explanation of different layers of Web Chat.

<table>
   <thead>
      <tr>
         <th>Package</th>
         <th>Layer</th>
         <th>Description</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td>
            <a href="https://github.com/Microsoft/BotFramework-DirectLineJS">
               <code>botframework-directlinejs</code>
            </a>
         </td>
         <td></td>
         <td>
            <ul>
               <li>SDK to communicate between the browser and Direct Line channel service</li>
               <li>
                  It is designed to be event-driven (via observables) and stateless
                  <ul>
                     <li>Due to its stateless nature, for example, it does not understood suggested actions, because suggested actions depends on previous state</li>
                  </ul>
               </li>
               <li>
                  It is designed to be hackable/mockable thru <a href="https://github.com/microsoft/BotFramework-DirectLineJS/blob/master/src/directLine.ts#L381"><code>IBotConnection</code> interface</a>
               </li>
            </ul>
         </td>
      </tr>
      <tr>
         <td>
            <p>
               <a href="https://github.com/Microsoft/BotFramework-WebChat/tree/master/packages/core">
                  <code>botframework-webchat-core</code>
               </a>
            </p>
            <p>
               (a.k.a. Web Chat UI)
            </p>
         </td>
         <td></td>
         <td>
            <ul>
               <li>Using Redux to provide a stateful data store but minimal support to various UI frameworks and app scenarios</li>
               <li>UI framework agnostic: we think about building apps on React Native and Angular (using Redux bindings)</li>
            </ul>
         </td>
      </tr>
      <tr>
         <td rowspan="4">
            <p>
               <a href="https://github.com/Microsoft/BotFramework-WebChat/tree/master/packages/component">
                  <code>botframework-webchat-component</code>
               </a>
            </p>
            <p>
               (a.k.a. Web Chat UI)
            </p>
         </td>
         <td>
            <a href="https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js">
               <code>Composer</code>
            </a>
         </td>
         <td>
            The React context which connects to Web Chat Core. If you want to build a component using Web Chat, you will need to add the component inside `<Composer>`. This is very similar to Redux `<Provider>` but using React Context instead.
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/connectToWebChat.js">
               <code>connectToWebChat</code>
            </a>
         </td>
         <td>
            Provides the mechanisms to build components from the ground up to support various creative ideas, such as ______ or _______. The `connectToWebChat` method is very similar to Redux's `connect` function, and provides access to all of the data required to build a chat component
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/SendBox/MicrophoneButton.js">
               <code>MicrophoneButton.<br />connectMicrophoneButton</code>
            </a>
         </td>
         <td>
            Provides HOC function to hoist features from Web Chat as props to the connected component. Although this is very similar to `connectToWebChat`, it provides encapsulation of information and the business logic required for the specific component.
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/SendBox/MicrophoneButton.js">
               <code>MicrophoneButton</code>
            </a>
         </td>
         <td>
            <ul>
               <li>The actual UI component the developer can use to reproduce the full Web Chat experience.</li>
               <li>Developers are also free to create a new UI by consulting how the original <code>MicrophoneButton</code> works.</li>
            </ul>
         </td>
      </tr>
   </tbody>
</table>

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/19.customization-plain-ui)

# Things to try out

-  Type `image` in the send box
   -  It should show an image
-  Type `suggested-actions` in the send box
   -  `imBack`, `messageBack`, and `postBack` buttons should work as expected
-  Type `card bingsports` in the send box
   -  Unsupported attachment will be rendered as preformatted JSON

# Code

This project is based on [`create-react-app`](https://github.com/facebook/create-react-app).

The completed code contains multiple files. You can start by reading [`App.js`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/19.customization-plain-ui/src/App.js), which replaces the default Web Chat renderer with [`<PlainWebChat>`](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/19.customization-plain-ui/src/PlainWebChat.js) and uses its own UI.

## Goals of this bot

This project has two goals:

-  Use Web Chat without using any of its UI components
-  Build your own highly-customized UI with minimal functionalities
   -  Support suggested actions
   -  Support `imBack`, `messageBack`, and `postBack`
   -  Support rendering hyperlinks

Although the UI is the main part of Web Chat, the state machine and business logic in Web Chat Core is very valuable for building your own highly-customized chat UI.

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)
