import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

// var onActionClick = function (text, language) {
//   console.log('Action clicked: ' + text);
// };

// var onUserMessage = function (text, language) {
//   console.log('User message: ' + text + ', language:' + language);
// };

// var onMaximizeMinimize = function (minimized, language) {
//   console.log('Minimized:' + minimized);
// };

// const parameters = {
//   style: {
//     backgroundColor: '#FFFFFF', //window background color

//     bubbleBackground: 'rgba(241, 241, 244, 1)', //bot bubble background color
//     bubbleTextColor: '#575a5e', //bot bubble text color
//     botAvatarImage: '',

//     bubbleFromUserBackground: '#8A8A8A', //user bubble background color
//     bubbleFromUserTextColor: '#ffffff', //user bubble text color

//     suggestedActionBackground: 'White', //button background color
//     suggestedActionBorderColor: '#cccccc', //button border color
//     suggestedActionTextColor: '#ed823c', //button text color

//     //overlaybutton to move through carousel or suggested actions
//     transcriptOverlayButtonBackground: '#d2dde5', //overlaybutton
//     transcriptOverlayButtonBackgroundOnHover: '#ef501f',
//     transcriptOverlayButtonColor: '#ed823c',
//     transcriptOverlayButtonColorOnHover: 'White', //parameter

//     streamingCancelButtonColor: 'rgb(239, 80, 31);',
//     streamingCancelButtonColorOnHover: 'White',
//     streamingCancelButtonTextColor: 'White'
//   },
//   header: {
//     backgroundColor: '#ef501f',
//     color: '#ef501f',
//     imageUrl: '',
//     height: '50px'
//   },
//   maximize: {
//     backgroundColor: '#EE8239',
//     imageUrl: ''
//   },
//   brandMessage: 'Powered by Hotelequia',
//   directlineTokenUrl: 'https://turismobot-dev.intelequia.com/api/directline/generateToken/',
//   directlineReconnectTokenUrl: 'https://turismobot-dev.intelequia.com/api/directline/reconnect/',
//   // speechTokenUrl: '', //botframework-webchat: "authorizationToken", "region", and "subscriptionKey" are deprecated and will be removed on or after 2020-12-17. Please use "credentials" instead.
//   chatIconMessage: 'hola',
//   language: 'en',
//   onActionClick,
//   onUserMessage,
//   onMaximizeMinimize,
//   reactivateChat: true,
//   proactiveTimeOut: 50000
// };

// ReactDOM.render(<App parameters={parameters} />, document.getElementById('root'));

const renderApp = (element, parameters) => {
  ReactDOM.render(<App parameters={parameters} />, document.getElementById(element));
};

window['Intelequia'] = {
  renderApp
};

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
