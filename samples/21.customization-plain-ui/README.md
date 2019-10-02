# Customizing Web Chat with a plain HTML UI

This sample shows how to use Web Chat without its canned UI component.

When we designed Web Chat, we heavily considered the importance of customization. To make customization great and accessible, we designed our components in layers. Developers can get the full experience of Web Chat by:

1. Using all of our layers: using all of our layers as-is,
2. Using just business layers: building their own UI from the ground up using Web Chat's business logic, or
3. Using business layers and some UI components: opting into our UI but replacing just a handful of components as needed.

In this sample, we are demonstrating the ability to rebuild Web Chat UI using just the business layer of Web Chat.

Below is the explanation of different layers of Web Chat.

<table>
   <thead>
      <tr>
         <th>Package</th>
         <th>Component</th>
         <th>Description</th>
      </tr>
   </thead>
   <tbody>
      <tr>
         <td rowspan="4">
            <p>
               <a href="https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/component">
                  <code>botframework-webchat-component</code>
               </a>
            </p>
            <p>
               <nobr>(Web Chat UI)</nobr>
            </p>
         </td>
         <td>
            <a href="https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/SendBox/MicrophoneButton.js">
               <code>MicrophoneButton</code>
            </a>
         </td>
         <td>
            <p>The actual UI component the developer can use to reproduce the full Web Chat experience.</p>
            <p>Developers are also free to create a new UI by consulting how the original <code>MicrophoneButton</code> works.</p>
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/SendBox/MicrophoneButton.js">
               <code>connectMicrophoneButton</code>
            </a>
         </td>
         <td>
           <a href="https://reactjs.org/docs/higher-order-components.html">Higher-order component</a> to hoist specific features from Web Chat as props to the connected component. Although this is very similar to <a href="#connect-to-web-chat"><code>connectToWebChat</code></a>, it provides encapsulation of information and the business logic only required for the specific component type.
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/connectToWebChat.js">
               <a name="connect-to-web-chat"></a>
               <code>connectToWebChat</code>
            </a>
         </td>
         <td>
           <a href="https://reactjs.org/docs/higher-order-components.html">Higher-order component</a> that exposes all of Web Chat's UI API as props. The <code>connectToWebChat</code> method is very similar to Redux <a href="https://react-redux.js.org/api/connect"><code>connect</code></a> function, and provides access to all of the data required to build a chat component.
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Composer.js">
               <code>Composer</code>
            </a>
         </td>
         <td>
            <p>React component which houses all components that requires access to Web Chat UI API.</p>
            <p>This is very similar to Redux <code>&lt;Provider&gt;</code>.</p>
         </td>
      </tr>
      <tr>
         <td>
            <p>
               <a href="https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/core">
                  <code>botframework-webchat-core</code>
               </a>
            </p>
            <p>
               <nobr>(Web Chat Core)</nobr>
            </p>
         </td>
         <td></td>
         <td>
            <p>A stateful UI data store for a basic chat experience.</p>
            <ul>
               <li>Using Redux to provide a stateful data store but minimal support to various UI frameworks and app scenarios</li>
               <li>UI framework agnostic: we think about building apps on React Native and Angular (using Redux bindings)</li>
            </ul>
         </td>
      </tr>
      <tr>
         <td>
            <a href="https://github.com/microsoft/BotFramework-DirectLineJS">
               <code>botframework-directlinejs</code>
            </a>
         </td>
         <td></td>
         <td>
            <p>SDK to communicate between the browser and Direct Line channel service</p>
            <ul>
               <li>
                  Designed to be event-driven (via observables) and stateless
                  <ul>
                     <li>Due to its stateless nature, for example, it does not understand suggested actions, because suggested actions depends on previous state</li>
                  </ul>
               </li>
               <li>
                  Designed to be hackable/mockable thru <a href="https://github.com/microsoft/BotFramework-DirectLineJS/blob/master/src/directLine.ts#L381"><code>IBotConnection</code> interface</a>
               </li>
            </ul>
         </td>
      </tr>
   </tbody>
</table>

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/21.customization-plain-ui)

# Things to try out

-  Type `image` in the send box
   -  It should show an image
-  Type `suggested-actions` in the send box
   -  `imBack`, `messageBack`, and `postBack` buttons should work as expected
-  Type `card bingsports` in the send box
   -  Unsupported attachment will be rendered as preformatted JSON

# Code

This project is based on [`create-react-app`](https://github.com/facebook/create-react-app).

The completed code contains multiple files. You can start by reading [`App.js`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/21.customization-plain-ui/src/App.js), which replaces the default Web Chat renderer with [`<PlainWebChat>`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/21.customization-plain-ui/src/PlainWebChat.js) and uses its own UI.

## Goals of this bot

This project has two goals:

-  Use Web Chat without using any of its original UI components
-  Build your own UI with minimal functionalities
   -  Support suggested actions
   -  Support [`imBack`, `messageBack`, and `postBack`](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-connector-add-rich-cards?view=azure-bot-service-4.0#process-events-within-rich-cards)
   -  Support rendering hyperlinks

Although the UI is the main part of Web Chat, the state machine and business logic in Web Chat is very valuable for building your own chat experience.

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
