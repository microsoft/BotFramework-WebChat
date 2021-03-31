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
  signature.innerHTML = 'with ❤️ by <a class="signature-link" target="_blank" href="https://feedyou.ai/?utm_source=webchat&utm_medium=chatbot&utm_campaign='+props.bot.id+'"><img src="https://cdn.feedyou.ai/webchat/feedyou_logo_red.png" alt="logo" /></a>';

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

  if (
    props.autoExpandTimeout &&
    (!localStorage || localStorage.feedbotClosed !== "true") &&
    window.matchMedia &&
    window.matchMedia("(min-width: 1024px)").matches
  ) {
    setTimeout(() => {
      if (wrapper.className.indexOf("collapsed") >= 0) {
        header.click();
      }
    }, props.autoExpandTimeout);
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
    console.log('render fullscreen', props.theme)
    logoImg.src = props.theme && props.theme.template && props.theme.template.logoUrl || "https://cdn.feedyou.ai/webchat/feedyou_logo_red.png"
    logoImg.alt = "Logo"
    logo.appendChild(logoImg)
    
    wrapper.appendChild(logo);
  
    wrapper.appendChild(container);
    document.body.appendChild(wrapper);

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
