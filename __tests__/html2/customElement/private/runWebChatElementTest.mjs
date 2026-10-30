// The steps of webChatElement.react16.html, .react17.html, .react18.html and .react19.html: the same on every React version,
// each page maps a different React in its import map.

import { waitFor } from '@testduet/wait-for';
import { createStoreWithOptions, testIds } from 'botframework-webchat';
import { WebChatElement } from 'botframework-webchat/custom-element.js';
import { version } from 'react';

export default function runWebChatElementTest({ reactMajorVersion }) {
  run(async function () {
    // TODO: This is for `createDirectLineEmulator` and `pageElements` only, should find ways to eliminate this line.
    window.WebChat = { createStoreWithOptions, testIds };

    const { directLine, store } = testHelpers.createDirectLineEmulator();
    const webChatElement = document.querySelector('webchat-element');

    // GIVEN: React from the import map.
    expect(version.split('.')[0]).toBe(reactMajorVersion);

    // WHEN: Props are set before the element is defined, then it is defined.
    webChatElement.props = { directLine, store, styleOptions: { disableFileUpload: true } };

    customElements.define('webchat-element', WebChatElement);

    const { shadowRoot } = webChatElement;

    pageElements.root(shadowRoot);

    await pageConditions.uiConnected();

    // THEN: Web Chat and all of its styles are inside the shadow root of the element, none in the document.
    expect(shadowRoot.contains(pageElements.transcript())).toBe(true);
    expect(shadowRoot.querySelectorAll('style[data-webchat-injected]').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('style[data-emotion], style[data-webchat-injected]')).toHaveLength(0);

    // THEN: Every style has the nonce of the element.
    expect(new Set(Array.from(shadowRoot.querySelectorAll('style'), ({ nonce }) => nonce))).toEqual(
      new Set(['a1b2c3'])
    );

    // WHEN: The user types a message and presses ENTER.
    const { activity: typedActivity, resolveAll: resolveTypedActivity } = await directLine.actPostActivity(async () => {
      await host.click(pageElements.sendBoxTextBox());
      await host.sendKeys('Hello, World!', 'ENTER');

      await pageConditions.numActivitiesShown(1);
    });

    await resolveTypedActivity();

    // THEN: The message is sent and the send box keeps the focus.
    expect(typedActivity).toHaveProperty('text', 'Hello, World!');
    expect(shadowRoot.activeElement).toBe(pageElements.sendBoxTextBox());

    // WHEN: The bot replies with a suggested action.
    await directLine.emulateIncomingActivity({
      suggestedActions: { actions: [{ title: 'USA', type: 'imBack', value: 'USA' }] },
      text: 'Where are you from?'
    });

    await pageConditions.suggestedActionsShown();

    // THEN: "Hello, World!" is sent, the bot asks "Where are you from?" and shows the "USA" suggested action.
    await host.snapshot('local');

    // WHEN: The user clicks the suggested action.
    const { activity: clickedActivity, resolveAll: resolveClickedActivity } = await directLine.actPostActivity(
      async () => {
        await pageObjects.clickNthSuggestedAction(1);
        await pageConditions.numActivitiesShown(3);
      }
    );

    await resolveClickedActivity();

    expect(clickedActivity).toHaveProperty('text', 'USA');

    await waitFor(() => expect(pageElements.suggestedActions()).toHaveLength(0));

    // THEN: "USA" is sent and the suggested action is gone.
    await host.snapshot('local');

    const transcript = pageElements.transcript();

    // WHEN: The element moves to another parent, then the bot sends a message.
    document.getElementById('other-parent').append(webChatElement);

    await directLine.emulateIncomingActivity('Thanks.');

    // THEN: The same Web Chat stays mounted and shows the message.
    await pageConditions.numActivitiesShown(4);

    expect(pageElements.transcript()).toBe(transcript);

    // WHEN: The element is removed from the document.
    webChatElement.remove();

    // THEN: Web Chat and its styles are removed from the shadow root.
    await waitFor(() => expect(shadowRoot.childNodes).toHaveLength(0));

    // WHEN: The element is added back.
    document.querySelector('main').append(webChatElement);

    // THEN: Web Chat renders again, with the same conversation and its styles in the shadow root.
    await pageConditions.numActivitiesShown(4);

    expect(pageElements.transcript()).not.toBe(transcript);
    expect(shadowRoot.querySelectorAll('style[data-webchat-injected]').length).toBeGreaterThan(0);

    // THEN: The same 4 messages show again, as before the element was removed.
    await host.snapshot('local');
  });
}
