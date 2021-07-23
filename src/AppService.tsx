import * as React from "react";
import * as ReactDOM from "react-dom";
import { Chat } from "./Chat";
import { AppProps } from "./App";

export function renderExpandableTemplate(props: AppProps) {
  let rendered = false;
  let container = document.createElement("div");
  container.className = "feedbot";

  const wrapper = document.createElement("div");
  wrapper.className = "feedbot-wrapper collapsed";
  wrapper.setAttribute("data-html2canvas-ignore", "")

  const signature = document.createElement("div");
  signature.classList.add("feedbot-signature");

  const feedyouLinkUrl = `https://feedyou.ai/?utm_source=webchat&utm_medium=chatbot&utm_campaign=${props.bot.id}`
  const partnerLinkUrl = props.theme && props.theme.signature && props.theme.signature.partnerLinkUrl ? `${props.theme.signature.partnerLinkUrl}?utm_source=webchat&utm_medium=chatbot&utm_campaign=${props.bot.id}` : feedyouLinkUrl
  if(props.theme && props.theme.signature && props.theme.signature.partnerLogoUrl && props.theme.signature.mode === "both"){
    signature.innerHTML = `<div class="feedbot-signature-row"><div style="align-self: center;">with ❤️ by</div><a class="signature-link" target="_blank" href="${partnerLinkUrl}"><img style="${props.theme.signature.partnerLogoStyle || ''}" src="${props.theme.signature.partnerLogoUrl}" alt="Logo" /></a><div style="align-self: center;">&</div><a class="signature-link" target="_blank" href="${feedyouLinkUrl}"><img src="https://cdn.feedyou.ai/webchat/feedyou_logo_red.png" alt="logo" /></a></div>`;
  } else if(props.theme && props.theme.signature && props.theme.signature.partnerLogoUrl && props.theme.signature.mode === "partner") {
    signature.innerHTML = `<div class="feedbot-signature-row"><div style="align-self: center;">with ❤️ by</div><a class="signature-link" target="_blank" href="${partnerLinkUrl}"><img style="${props.theme.signature.partnerLogoStyle || ''}" src="${props.theme.signature.partnerLogoUrl}" alt="Logo" /></a></div>`;
  } else {
    signature.innerHTML = `<div class="feedbot-signature-row"><div style="align-self: center;">with ❤️ by</div><a class="signature-link" target="_blank" href="${feedyouLinkUrl}"><img src="https://cdn.feedyou.ai/webchat/feedyou_logo_red.png" alt="Logo" /></a></div>`;
  }

  const header = document.createElement("div");
  header.className = "feedbot-header";
  header.style.backgroundColor =
    props.theme && props.theme.mainColor ? props.theme.mainColor : "#e51836";
  header.innerText = props.header
    ? props.header.textWhenCollapsed || props.header.text || "Chatbot"
    : "Chatbot";
  header.onclick = () => {
    wrapper.classList.toggle("collapsed");

    if (!rendered) {
      header.innerHTML =
        '<span class="feedbot-title">' +
        ((props.header && props.header.text) || "Chatbot") +
        '</span><a onclick="return false;" class="feedbot-minimize" href="#">_</a>';
      render(props, container);
    }

    // when closed manually, store flag to do not open automatically after reload
    localStorage &&
      (localStorage.feedbotClosed = wrapper.classList.contains("collapsed"));
  };

  wrapper.appendChild(header);
  wrapper.appendChild(container);
  props.theme && props.theme.showSignature && wrapper.appendChild(signature);
  
  document.body.appendChild(wrapper);

  const autoExpandTimeout = getAutoExpandTimeout(props.autoExpandTimeout, props.persist)
  if (autoExpandTimeout > 0) {
    setTimeout(() => {
      if (wrapper.className.indexOf("collapsed") >= 0) {
        header.click();
      }
    }, autoExpandTimeout);
  }
}

export function renderFullScreenTemplate(props: AppProps) {
    let container = document.createElement("div");
    container.className = "feedbot";
  
    const wrapper = document.createElement("div");
    wrapper.className = "feedbot-wrapper";
  
    const logo = document.createElement("div");
    logo.className = "feedbot-logo";
    
    const logoImg = document.createElement('img')
    logoImg.src = props.theme && props.theme.template && props.theme.template.logoUrl || "https://cdn.feedyou.ai/webchat/feedyou_logo_red.png"
    logoImg.alt = "Logo"
    logo.appendChild(logoImg)
    
    wrapper.appendChild(logo);

    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

    const customScript = props.theme && props.theme.template && props.theme.template.customScript
    if (customScript)  {
      const customScriptTag = document.createElement("script");
      customScriptTag.appendChild(document.createTextNode(customScript))
      document.body.appendChild(customScriptTag);
    }

    render(props, container);
  }

export const render = (props: AppProps, container?: HTMLElement) => {
  ReactDOM.render(React.createElement(AppContainer, props), container);
};

const AppContainer = (props: AppProps) => (
  <div className="wc-app">
    <Chat {...props} />
  </div>
);

function getAutoExpandTimeout(defaultTimeout: number, persist: string): number {
  if (window.location.href.includes('utm_source=Feedbot') && (persist === 'user' || persist === 'conversation')) {
    return 1
  }

  const wasManuallyClosed = localStorage && localStorage.feedbotClosed === "true"
  const isSmallScreen = window.matchMedia && !window.matchMedia("(min-width: 1024px)").matches
  if (wasManuallyClosed || isSmallScreen) {
    return 0
  }

  return defaultTimeout
}