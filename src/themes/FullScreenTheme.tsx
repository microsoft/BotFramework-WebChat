import { BaseTheme } from './BaseTheme'
import { Theme } from './index'

export const FullScreenTheme = (theme: Theme) => `
  body {
    font-family: Helvetica, Arial;
    padding: 30px;

    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-align-items: flex-end;
    -ms-flex-align: end;
    align-items: flex-end;
  }

  .feedbot-logo {
    height: 10%;

    background-color: transparent;
    text-align: center;
    padding-top: 0px;
    padding-bottom: 5px;
  }

  .feedbot-logo img {
    max-height: 95%;
    max-width: 70%;
    padding-top: 15px;
    object-fit: contain;
  }
  
  @media (min-width: 768px) {
    .wc-adaptive-card {
      width: 398px;
    }
  }

  .feedbot-wrapper {
    background-color: transparent;
    max-width: 900px;
    min-width: 300px;
    max-height: 98.5%;
    min-height: 500px;

    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;

    position: fixed;
    top: 2%;
    left: 2%;
    right: 2%;
    bottom: 0;
  }

  @media screen and (min-width: 950px) {
    .feedbot-wrapper {
      left: calc(50% - 450px);
    }
  }

  .feedbot-wrapper .feedbot {
    position: relative;
    height: 90%;
  }

  .wc-message-from.wc-message-from-bot {
    visibility: hidden;
    height: 2px;
  }

  .wc-message-wrapper:not([data-activity-id='retry']) .wc-message-from {
    visibility: hidden;
  }

  .wc-message-wrapper:not([data-activity-id]) .wc-message-from {
    visibility: visible;
  }

  .wc-message-content {
    padding: 10px;
    border-radius: 13px;
  }

  .wc-message-from-bot .wc-message-content {
    color: #424242 !important;
  }

  .wc-carousel {
    margin-top: 10px;
  }

  .wc-suggested-actions .wc-hscroll > ul > li {
    margin: 6px;
  }

  .wc-message-pane .wc-suggested-actions {
    position: absolute;
    z-index: 10000;
    background-color: white;
  }

  .wc-message-pane.show-actions .wc-suggested-actions {
    height: 70px;
  }

  .feedbot-wrapper .wc-console {
    /*-webkit-box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.5);
    -moz-box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.5);
    box-shadow: 0px 0px 8px 0px rgba(0,0,0,0.5);*/

    border-width: 0px;
    height: 70px;
  }

  .wc-message-pane.show-actions .wc-message-groups {
    top: 0px;
    transform: translateY(0px);
  }

  .wc-console.disable-input {
    background-color: white !important;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button, .wc-app .wc-card button {
    border-radius: 20px;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button:focus, .wc-console .wc-mic, .wc-console .wc-send, .wc-app .wc-card button {
    outline:0;
  }

  .wc-console .wc-mic, .wc-console .wc-send {
    top: 10px !important;
  }

  .wc-console input[type=text], .wc-console textarea {
    margin: 0px 15px;
  }

  .wc-textbox {
    border-radius: 13px;
    background-color: #eceff1;
    height: 70%;
    margin-bottom: 0px;
    top: 6px !important;
  }

  .wc-suggested-actions .wc-hscroll > ul {
    text-align: center;
    margin-top: 10px;
  }

  .wc-message-from-bot .wc-message-content {
   background-color: #f5f5f5;
  }

  .wc-message-from-bot svg.wc-message-callout path {
    fill: #f5f5f5;
  }

  .wc-suggested-actions .wc-hscroll > ul > li {
    max-width: 60%;
  }

  .wc-message-content {
   box-shadow: none;
  }

  .wc-message .wc-list {
    text-align: center;
  }

  .wc-app ::-webkit-scrollbar-thumb {
    background-color: #ececec;
  }

  .wc-app h1, .wc-app h2, .wc-app h3, .wc-app h4, .wc-app p, .wc-app ul, .wc-app ol {
    padding: 4px;
  }

  .wc-carousel button.scroll {
    background-color: ${theme.mainColor} !important;
    border-width: 0px !important;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button, .wc-app .wc-card button {
    color: white !important;
    background-color: ${theme.mainColor} !important;
    border-color: ${theme.mainColor} !important;
  }

  .feedbot .wc-suggested-actions .wc-hscroll > ul > li button:active, .wc-app .wc-card button:active {
    color: ${theme.mainColor} !important;
    background-color: white !important;
    border-color: ${theme.mainColor} !important;
  }

  

  ${BaseTheme(theme)}
`
