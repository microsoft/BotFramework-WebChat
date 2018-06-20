import BasicWebChat from './BasicWebChat';

export default BasicWebChat

try {
  const { document } = global as any;

  if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
    const meta = document.createElement('meta');

    meta.setAttribute('name', 'botframework-webchat');
    meta.setAttribute('content', `version=${ '1.0.0' }`);

    document.head.appendChild(meta);
  }
} catch (err) {}
