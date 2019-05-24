import createElement from './createElement';

export default function loadIFRAME(src) {
  return new Promise((resolve, reject) => {
    document.body.appendChild(
      createElement(
        'div',
        {
          style: {
            height: '100%',
            overflow: 'hidden'
          }
        },
        createElement('iframe', {
          onError: reject,
          onLoad: resolve,
          src,
          style: {
            border: '0',
            height: '100%',
            width: '100%'
          }
        })
      )
    );
  });
}
