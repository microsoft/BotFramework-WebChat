import createElement from './createElement';

// We enable Subresource Integrity to protect our assets on CDN.
// https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
// curl https://cdn.botframework.com/botframework-webchat/4.3.0/webchat.js | openssl dgst -sha384 -binary | openssl base64 -A

function loadScript(src, integrity) {
  return new Promise((resolve, reject) => {
    document.head.appendChild(
      createElement('script', {
        async: true,
        crossOrigin: 'anonymous',
        integrity,
        onError: reject,
        onLoad: resolve,
        src
      })
    );
  });
}

function loadStylesheet(href, integrity) {
  document.head.appendChild(
    createElement('link', {
      crossOrigin: 'anonymous',
      href,
      integrity,
      rel: 'stylesheet'
    })
  );
}

export default async function loadAsset(src) {
  const [assetURL, integrity] = Array.isArray(src) ? src : [src, undefined];

  return /\.css$/i.test(assetURL) ? loadStylesheet(assetURL, integrity) : await loadScript(assetURL, integrity);
}
