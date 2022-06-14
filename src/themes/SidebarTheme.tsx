import { ExpandableKnobTheme } from './ExpandableKnobTheme'
import { Theme } from '../App'

function getSidebarBackgroundColor(theme: Theme) {
	return '#e1e1e1'
	
	// TODO make background tint configurable in theme
	/*const color = theme.mainColor
	if(color.startsWith("rgb")){
		return rgb2hex(color).hex
	}
	return color*/
}

export const Sidebar = (theme: Theme) => `
  ${ExpandableKnobTheme(theme)}

  body .feedbot-wrapper:not(.collapsed) .feedbot-header {
    height: 35px;
    width: 35px;
    position: absolute;
    right: 10px;
    top: 20px;

    border-radius: 40px;
    padding: 0px;

    text-indent: 999%;
    white-space: nowrap;
    overflow: hidden;
    font-size: 0px;

    background-image: url('https://feedyou.blob.core.windows.net/webchat/times-solid.svg');
    background-repeat: no-repeat;
    background-size: 15px;
    background-position: center center;
  }

  .feedbot-wrapper.collapsed .feedbot-header {
    padding-top: 0;
  }

  body .feedbot-wrapper:not(.collapsed) {
    height: 100vh;
    bottom: 0;
    right: 0;
    border-radius: 0;
  }

  body .feedbot-wrapper .wc-chatview-panel  {
    border-radius: 0;
    ${theme.showSignature ? 'bottom: 14px;' : ''}
    top: 0;
  }

  .feedbot-wrapper .wc-suggested-actions {
    ${theme.showSignature ? 'bottom: 68px;' : ''}
  }

  body .wc-app .wc-console {
    border-radius: 16px;
    margin: 0 12px 10px;
    border: 1px solid #dbdee1;
  }


  body .feedbot-wrapper.collapsed {
    bottom: 30px;
    right: 30px;
  }

  /* slightly transparent fallback */
  .feedbot-wrapper {
    max-height: 100%;
    background: rgb(255, 255, 255);
  }

  /* if backdrop support: very transparent and blurred */
  @supports ((-webkit-backdrop-filter: blur(40px)) or (backdrop-filter: blur(40px))) {
    .feedbot-wrapper {
      max-height: 100%;
      background: linear-gradient(45deg, ${getSidebarBackgroundColor(theme)}33,  #E1E1E1CE);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
    }
  }

  .wc-app .wc-message-groups {
    background-color: transparent;
  }

  .wc-message-callout {
    display: none;
  }

  .feedbot-wrapper .wc-adaptive-card, .feedbot-wrapper .wc-card {
    max-width: 300px !important;
  }

  .wc-message-content {
    padding: 12px 14px;
    line-height: 1.25em;
  }

  .wc-message-from-bot .wc-message-content {
    border-radius: 0 16px 16px 16px;
    padding: 14px;
    background: linear-gradient(-45deg, rgba(255,255,255,0.5), rgba(255,255,255,0.9)) !important;
  }

  .wc-message-from-me .wc-message-content {
    border-radius: 16px 0 16px 16px;
    padding: 14px;
  }

  .format-markdown + div {
    margin-top: 0 !important;
  }

  .feedbot-wrapper .feedbot-signature {
    bottom: 0px;
    left: 0px;
    height: 24px;
    justify-content: center;
    text-shadow: 1px 1px 7px rgb(255 255 255 / 50%);
  }
  
  .feedbot-signature a {
    height: unset;
  }

  .feedbot-signature a img {
    height: 22px;
  }

  .feedbot-signature-row {
    justify-content: center;
  }
  
`
