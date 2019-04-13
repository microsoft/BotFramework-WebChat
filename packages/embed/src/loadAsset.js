import createElement from './createElement';

function loadScript(src) {
  return new Promise((resolve, reject) => {
    document.head.appendChild(createElement(
      'script',
      {
        async: true,
        onError: reject,
        onLoad: resolve,
        src
      }
    ));
  });
}

function loadStylesheet(href) {
  document.head.appendChild(createElement(
    'link',
    {
      href,
      rel: 'stylesheet'
    }
  ));
}

export default async function loadAsset(src) {
  return /\.css$/i.test(src) ? loadStylesheet(src) : await loadScript(src);
}
