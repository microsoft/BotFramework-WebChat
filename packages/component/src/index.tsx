import React from 'react';

export default class MyComponent extends React.Component {
  render() {
    return (
      <div>This is my component</div>
    );
  }
}

const { document } = global as any;

if (typeof document !== 'undefined' && document.createElement && document.head && document.head.appendChild) {
  try {
    const meta = document.createElement('meta');

    meta.setAttribute('name', 'botframework-webchat');
    meta.setAttribute('content', `version=${ '1.0.0' }`);

    document.head.appendChild(meta);
  } catch (err) {}
}
