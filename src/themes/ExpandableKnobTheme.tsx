import { ExpandableBarTheme } from './ExpandableBarTheme'
import { Theme } from '../App'

export const ExpandableKnobTheme = (theme: Theme) => `
  .feedbot-reset {
    all: revert
  }

  .feedbot-reset * {
    all: revert
  }

  body .feedbot-wrapper {
    bottom: 24px;
    right: 24px;
    border-radius: 15px;
  }

  body .feedbot-header {
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
  }

  body .feedbot-wrapper .wc-chatview-panel {
    border-bottom-right-radius: 15px;
    border-bottom-left-radius: 15px;
  }

  .wc-app .wc-console {
    background-color: white;
    border-width: 0px;
    border-top: 1px solid #dbdee1;
  }

  .wc-app .wc-console .wc-textbox {
    left: 20px;
  }

  .wc-app .wc-console.has-upload-button .wc-textbox {
    left: 48px;
  }

  .wc-app .wc-console .wc-send {
    top: 4px;
  }

  body .feedbot-wrapper.collapsed {
    border-radius: 40px;
    width: 75px;
    min-width: auto;
    height: 75px;
  }

  body .feedbot-wrapper.collapsed .feedbot-header {
    border-radius: 40px;
    height: 100%;
    padding: 0px;

    background-image: url(${(theme.template && theme.template.iconUrl)
	? theme.template.iconUrl
	: 'https://cdn.feedyou.ai/webchat/message-icon.png'
});
    background-size: 50px 50px;
    background-position: 12px 12px;
    background-repeat: no-repeat;

    text-indent: 999%;
    white-space: nowrap;
    overflow: hidden;
    font-size: 0px;
  }

  body .feedbot-wrapper {
    width: 420px;
    height: 565px;
  }

  .feedbot-wrapper.collapsed .feedbot-signature {
    display: none;
  }

  .feedbot-wrapper .feedbot-signature {
    position: absolute;
    bottom: -23px;
    font-size: 13px;
    right: 11px;
    opacity: 0.50;
    font-family: "Roboto", sans-serif;

    height: 22px;
    display: block;
    align-items: center;
    -webkit-transition: opacity 0.3s ease-in-out;
    -moz-transition: opacity 0.3s ease-in-out;
    -ms-transition: opacity 0.3s ease-in-out;
    -o-transition: opacity 0.3s ease-in-out;
    transition: opacity 0.3s ease-in-out;
  }

  .feedbot-wrapper .feedbot-signature:hover {
    opacity: 0.80;
  }

  .feedbot-signature a {
    transition: 0.3s;
    color: black;
    text-decoration: none;
    margin: 0 4px;
    display: flex;
    align-items: center;
  }

  .feedbot-signature a:hover {
    cursor: pointer;
  }

  .feedbot-signature a img {
    height: 22px;
  }
  
  .feedbot-signature-row{
    display: flex;
    height: 100%;
  }

  ${ExpandableBarTheme(theme)}
`
