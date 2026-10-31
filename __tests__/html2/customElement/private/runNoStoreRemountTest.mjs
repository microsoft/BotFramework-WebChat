// The steps of webChatElement.noStore.react18.html and .react19.html: the same on both React versions, each page maps a
// different React in its import map.

import { waitFor } from '@testduet/wait-for';
import { testIds } from 'botframework-webchat';
import { WebChatElement } from 'botframework-webchat/custom-element.js';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';
import { version } from 'react';

// A chat adapter that behaves like DirectLineJS where it matters here: after end(), it delivers nothing and a new
// connection reports "ended". `createDirectLineEmulator()` cannot be used: it needs Web Chat to use its own store.
function createEndableDirectLine() {
  const activityObservers = new Set();
  const postedTexts = [];
  let nextId = 0;
  let numEnded = 0;

  const emit = activity => numEnded || activityObservers.forEach(({ next }) => next(activity));

  // Emits the values asynchronously, as DirectLineJS does.
  const observableOf = (...values) =>
    Object.freeze({
      subscribe: ({ complete, next }) => {
        const timeout = setTimeout(() => {
          values.forEach(value => next(value));
          complete?.();
        });

        return Object.freeze({ unsubscribe: () => clearTimeout(timeout) });
      }
    });

  return {
    directLine: Object.freeze({
      activity$: Object.freeze({
        subscribe: observer => {
          activityObservers.add(observer);

          return Object.freeze({ unsubscribe: () => activityObservers.delete(observer) });
        }
      }),
      // Uninitialized, connecting, online; or ended (5) once end() was called, as DirectLineJS does.
      get connectionStatus$() {
        return numEnded ? observableOf(5) : observableOf(0, 1, 2);
      },
      end: () => {
        numEnded++;
      },
      postActivity: activity => {
        const id = `user-${++nextId}`;

        postedTexts.push(activity.text);

        // Echoes the activity back, as the Direct Line service does.
        setTimeout(() => emit({ ...activity, id, timestamp: new Date().toISOString() }));

        return observableOf(id);
      }
    }),
    emitBotMessage: text =>
      emit({
        from: { id: 'bot', role: 'bot' },
        id: `bot-${++nextId}`,
        text,
        timestamp: new Date().toISOString(),
        type: 'message'
      }),
    getNumEnded: () => numEnded,
    getPostedTexts: () => Object.freeze([...postedTexts]),
    hasActivityObserver: () => !!activityObservers.size
  };
}

export default function runNoStoreRemountTest({ reactMajorVersion }) {
  run(async function () {
    // TODO: This is for `pageElements` only, should find ways to eliminate this line.
    window.WebChat = { testIds };

    const { directLine, emitBotMessage, getNumEnded, getPostedTexts, hasActivityObserver } = createEndableDirectLine();
    const webChatElement = document.querySelector('webchat-element');

    // GIVEN: React from the import map.
    expect(version.split('.')[0]).toBe(reactMajorVersion);

    // GIVEN: Web Chat in the element, with props that have no store: the element creates one.
    customElements.define('webchat-element', WebChatElement);

    webChatElement.props = { directLine, styleOptions: { disableFileUpload: true } };

    const { shadowRoot } = webChatElement;

    pageElements.root(shadowRoot);

    await waitFor(() => expect(hasActivityObserver()).toBe(true));

    // GIVEN: The bot and the user exchange a message.
    emitBotMessage('Hello from the bot.');

    await pageConditions.numActivitiesShown(1);

    await host.click(pageElements.sendBoxTextBox());
    await host.sendKeys('Hi!', 'ENTER');

    await pageConditions.numActivitiesShown(2);
    await pageConditions.allOutgoingActivitiesSent();

    const transcriptBeforeNonce = pageElements.transcript();

    // WHEN: The nonce attribute changes, which mounts Web Chat again.
    webChatElement.setAttribute('nonce', 'd4e5f6');

    await waitFor(() => expect(pageElements.transcript()).not.toBe(transcriptBeforeNonce));

    // THEN: The 2 messages are kept and the Direct Line was not ended.
    await pageConditions.numActivitiesShown(2);

    expect(getNumEnded()).toBe(0);

    // WHEN: The bot sends another message.
    emitBotMessage('Still here after the nonce changed.');

    // THEN: It shows.
    await pageConditions.numActivitiesShown(3);

    const transcriptBeforeTheme = pageElements.transcript();

    // WHEN: The theme changes to the Fluent theme, which mounts Web Chat again.
    webChatElement.themeProvider = FluentThemeProvider;

    await waitFor(() => expect(pageElements.transcript()).not.toBe(transcriptBeforeTheme));

    // THEN: The 3 messages are kept and the Direct Line was not ended.
    await pageConditions.numActivitiesShown(3);

    expect(getNumEnded()).toBe(0);

    // WHEN: The user sends a message and the bot replies.
    await host.click(pageElements.sendBoxTextBox());
    await host.sendKeys('Still there?', 'ENTER');

    await pageConditions.numActivitiesShown(4);
    await pageConditions.allOutgoingActivitiesSent();

    emitBotMessage('Yes, after the theme changed too.');

    await pageConditions.numActivitiesShown(5);

    // THEN: Both user messages went through the same Direct Line.
    expect(getPostedTexts()).toEqual(['Hi!', 'Still there?']);

    // THEN: The Fluent theme shows all 5 messages: 2 before and 1 after the nonce changed, 2 after the theme changed.
    await host.snapshot('local');
  });
}
