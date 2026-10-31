// The steps of webChatElement.nonce.react18.html and .react19.html: the same on both React versions, each page maps a
// different React in its import map.

import { waitFor } from '@testduet/wait-for';
import { createStoreWithOptions, testIds } from 'botframework-webchat';
import { WebChatElement } from 'botframework-webchat/custom-element.js';
import { version } from 'react';

// Nonce of every `<style>` in the shadow root, deduplicated.
function getNonces(shadowRoot) {
  return new Set(Array.from(shadowRoot.querySelectorAll('style'), ({ nonce }) => nonce));
}

export default function runNonceChangeTest({ reactMajorVersion }) {
  run(async function () {
    // TODO: This is for `createDirectLineEmulator` and `pageElements` only, should find ways to eliminate this line.
    window.WebChat = { createStoreWithOptions, testIds };

    const { directLine, store } = testHelpers.createDirectLineEmulator();
    const webChatElement = document.querySelector('webchat-element');

    // GIVEN: React from the import map.
    expect(version.split('.')[0]).toBe(reactMajorVersion);

    // GIVEN: Web Chat rendered in the element, with the nonce attribute "a1b2c3".
    customElements.define('webchat-element', WebChatElement);

    webChatElement.props = { directLine, store, styleOptions: { disableFileUpload: true } };

    const { shadowRoot } = webChatElement;

    pageElements.root(shadowRoot);

    await pageConditions.uiConnected();

    await directLine.emulateIncomingActivity('Hello, World!');

    await pageConditions.numActivitiesShown(1);

    expect(getNonces(shadowRoot)).toEqual(new Set(['a1b2c3']));

    const transcript = pageElements.transcript();

    // WHEN: The nonce attribute changes after the element is connected.
    webChatElement.setAttribute('nonce', 'd4e5f6');

    // THEN: Web Chat is mounted again: it drops its styles when its nonce changes and does not add them all back.
    await waitFor(() => expect(pageElements.transcript()).not.toBe(transcript));

    await pageConditions.numActivitiesShown(1);

    // THEN: Every style in the shadow root has the new nonce, none has the old one.
    await waitFor(() => expect(getNonces(shadowRoot)).toEqual(new Set(['d4e5f6'])));

    // THEN: "Hello, World!" shows again from the same store, fully styled: the screen reader text stays hidden.
    await host.snapshot('local');
  });
}
