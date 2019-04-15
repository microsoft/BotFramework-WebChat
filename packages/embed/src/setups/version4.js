import createElement from '../createElement';
import { log } from '../logger';

export default function setupVersionFamily4(
  {
    botIconURL,
    directLineURL: domain,
    userId,
    webSocket
  }, {
    secret,
    token,
    username
  }
) {
  const directLine = window.WebChat.createDirectLine({ domain, secret, token, webSocket });

  // TODO: Should we support Bing Speech in Web Chat v4?

  const root = createElement(
    'div',
    {
      style: {
        height: '100%'
      }
    }
  );

  window.WebChat.renderWebChat({
    directLine,
    locale: navigator.language,
    styleOptions: {
      // TODO: We could move this line inside ASP.NET handler.
      //       This is essentially filling it out with default URL if it is empty.
      //       But in Web Chat v4, we prefer it to be empty instead.
      botAvatarImage: botIconURL === '//bot-framework.azureedge.net/bot-icons-v1/bot-framework-default.png' ? null : botIconURL
    },
    userId,
    username
  }, root);

  document.body.appendChild(root);
  root.children[0].style.height = '100%';

  const webChatVersionMeta = document.querySelector('head > meta[name="botframework-webchat:bundle:version"]');

  webChatVersionMeta && log(`Web Chat v4 is loaded and reporting version "${ webChatVersionMeta.getAttribute('content') }".`);
}
