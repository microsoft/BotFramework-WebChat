import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Node } from '../node/Node.ts';
import createDirectLineJSStore from './createDirectLineJSStore.ts';
import type DirectLineJSStore from './DirectLineJSStore.ts';
import { getActivityIdentifier, getClientActivityIdentifier } from './private/activityIdentifier.ts';
import createMockDirectLine from './private/test/createMockDirectLine.ts';

const RAW_JSON = 'urn:microsoft:webchat:direct-line-activity:raw-json';

function createStore(userId?: string | undefined) {
  const { directLine, emitActivity } = createMockDirectLine();
  const store = createDirectLineJSStore({ directLine, ...(userId ? { userId } : {}) });

  return Object.freeze({ emitActivity, store });
}

function getSortedParts(store: DirectLineJSStore): readonly Node[] {
  return Array.from(store.getSortedParts(store.conversationId, { by: 'dateCreated' }));
}

function silenceConsole(method: 'error' | 'warn') {
  const { mock } = NodeTest.mock.method(console, method, () => undefined);

  return Object.freeze({
    get calls() {
      return mock.calls;
    },
    restore: () => mock.restore()
  });
}

scenario(
  'start',
  bdd => {
    bdd
      .given('a Direct Line store', () => createStore())
      .when('started', () => {
        // Intentionally left blank.
      })
      .then('should have a root Conversation node', ({ store }) => {
        const node = store.getSnapshot().get(store.conversationId);

        expect(store.conversationId).toMatch(/^_:/u);
        expect(node).toEqual({ '@id': store.conversationId, '@type': new Set(['Conversation']) });
      })
      .and('should have Audience nodes', ({ store }) => {
        expect(store.getSnapshot().get('_:audience/channel')).toEqual({
          '@id': '_:audience/channel',
          '@type': new Set(['Audience']),
          audienceType: ['channel']
        });
        expect(store.getSnapshot().get('_:audience/others')).toEqual({
          '@id': '_:audience/others',
          '@type': new Set(['Audience']),
          audienceType: ['others']
        });
        expect(store.getSnapshot().get('_:audience/self')).toEqual({
          '@id': '_:audience/self',
          '@type': new Set(['Audience']),
          audienceType: ['self']
        });
      })
      .and('should have no parts', ({ store }) => {
        expect(getSortedParts(store)).toEqual([]);
      });
  },
  NodeTest
);

scenario(
  'invalid init',
  bdd => {
    bdd
      .given('an invalid Direct Line object', () => ({}))
      .when('creating a store', directLine => {
        try {
          createDirectLineJSStore({ directLine } as unknown as Parameters<typeof createDirectLineJSStore>[0]);
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => {
        expect(error).toBeInstanceOf(Error);
      });
  },
  NodeTest
);

scenario(
  'receiving a message activity from the bot',
  bdd => {
    const activity = Object.freeze({
      channelData: { hello: 'world' },
      from: { id: 'bot', role: 'bot' },
      id: 'a-00001',
      text: 'Hello, World!',
      timestamp: new Date(1_000).toISOString(),
      type: 'message'
    });

    bdd
      .given('a Direct Line store', () => createStore())
      .when('a message activity is received', ({ emitActivity, store }) => {
        emitActivity(activity);

        return store.queryByIdentifier(getActivityIdentifier('a-00001'));
      })
      .then('should have a Message node', ({ store }, node) => {
        expect(node).toEqual({
          '@id': expect.stringMatching(/^_:/u),
          '@type': new Set(['Message', 'urn:microsoft:webchat:direct-line-activity']),
          creativeWorkStatus: ['Published'],
          dateCreated: '1970-01-01T00:00:01.000Z',
          encodingFormat: ['text/markdown'],
          identifier: new Set(['_:activity:a-00001']),
          isPartOf: new Set([{ '@id': store.conversationId }]),
          sender: [{ '@id': '_:audience/others' }],
          text: ['Hello, World!'],
          [RAW_JSON]: [{ '@type': '@json', '@value': activity }],
          'urn:microsoft:webchat:direct-line-activity:type': ['message']
        });
      })
      .and('should not use activity ID as @id', (_, node) => {
        expect(node?.['@id']).not.toBe('_:activity:a-00001');
      })
      .and('should be part of the conversation', ({ store }, node) => {
        expect(getSortedParts(store)).toEqual([node]);
        expect(store.getSnapshot().get(store.conversationId)?.hasPart).toEqual(new Set([{ '@id': node?.['@id'] }]));
      });
  },
  NodeTest
);

scenario(
  'receiving a non-message activity',
  bdd => {
    bdd
      .given('a Direct Line store', () => createStore())
      .when('an event activity is received', ({ emitActivity, store }) => {
        emitActivity({ from: { id: 'bot' }, id: 'a-00001', name: 'ping', type: 'event' });

        return store.queryByIdentifier(getActivityIdentifier('a-00001'));
      })
      .then('should not be a Message node', (_, node) => {
        expect(node?.['@type']).toEqual(new Set(['urn:microsoft:webchat:direct-line-activity']));
      })
      .and('should not have text and encoding format', (_, node) => {
        expect(node).not.toHaveProperty('encodingFormat');
        expect(node).not.toHaveProperty('text');
      })
      .and('should patch "from.role" as "bot"', (_, node) => {
        expect(node).toHaveProperty('sender', [{ '@id': '_:audience/others' }]);
      })
      .and('should be part of the conversation', ({ store }, node) => {
        expect(getSortedParts(store)).toEqual([node]);
      });
  },
  NodeTest
);

scenario(
  'receiving a plain text message activity',
  bdd => {
    bdd
      .given('a Direct Line store', () => createStore())
      .when('a message activity with "textFormat" of "plain" is received', ({ emitActivity, store }) => {
        emitActivity({ from: { id: 'bot' }, id: 'a-00001', text: 'Hello', textFormat: 'plain', type: 'message' });

        return store.queryByIdentifier(getActivityIdentifier('a-00001'));
      })
      .then('should have "encodingFormat" of "text/plain"', (_, node) => {
        expect(node).toHaveProperty('encodingFormat', ['text/plain']);
      });
  },
  NodeTest
);

scenario(
  'receiving activities with null fields',
  bdd => {
    bdd
      .given('a Direct Line store', () => createStore())
      .when('an activity with null "from", "text", and "value" is received', ({ emitActivity, store }) => {
        emitActivity({ from: null, id: 'a-00001', text: null, type: 'message', value: null });

        return store.queryByIdentifier(getActivityIdentifier('a-00001'));
      })
      .then('should patch "from.role" as "channel"', (_, node) => {
        expect(node).toHaveProperty('sender', [{ '@id': '_:audience/channel' }]);
      })
      .and('should remove null "text" but keep null "value"', (_, node) => {
        expect(node).not.toHaveProperty('text');
        expect(node).toHaveProperty(
          [RAW_JSON],
          [{ '@type': '@json', '@value': { from: { role: 'channel' }, id: 'a-00001', type: 'message', value: null } }]
        );
      });
  },
  NodeTest
);

scenario(
  'receiving an activity from the user',
  bdd => {
    bdd
      .given('a Direct Line store with user ID', () => createStore('u-00001'))
      .when('an echo back activity without "from.role" is received', ({ emitActivity, store }) => {
        emitActivity({
          channelData: { clientActivityID: 'c-00001' },
          from: { id: 'u-00001' },
          id: 'a-00001',
          text: 'Hello',
          timestamp: new Date(1_000).toISOString(),
          type: 'message'
        });

        return store.queryByIdentifier(getClientActivityIdentifier('c-00001'));
      })
      .then('should patch "from.role" as "user"', (_, node) => {
        expect(node).toHaveProperty('sender', [{ '@id': '_:audience/self' }]);
      })
      .and('should have both server and client activity ID in "identifier"', (_, node) => {
        expect(node?.identifier).toEqual(new Set(['_:activity:a-00001', '_:client-activity:c-00001']));
      })
      .and('should be "Published"', (_, node) => {
        expect(node).toHaveProperty('creativeWorkStatus', ['Published']);
      })
      .and('should be queryable by server activity ID', ({ store }, node) => {
        expect(store.queryByIdentifier(getActivityIdentifier('a-00001'))).toBe(node);
      })
      .when('the same activity is received again with an updated text', ({ emitActivity, store }) => {
        emitActivity({
          channelData: { clientActivityID: 'c-00001' },
          from: { id: 'u-00001' },
          id: 'a-00001',
          text: 'Aloha',
          timestamp: new Date(1_000).toISOString(),
          type: 'message'
        });

        return store;
      })
      .then('should update the same node', (_, store) => {
        const parts = getSortedParts(store);

        expect(parts).toHaveLength(1);
        expect(parts[0]).toHaveProperty('text', ['Aloha']);
      });
  },
  NodeTest
);

scenario(
  'receiving an activity from the bot which copied "clientActivityID" from the user',
  bdd => {
    bdd
      .given('a Direct Line store with an activity from the user', () => {
        const { emitActivity, store } = createStore('u-00001');

        emitActivity({
          channelData: { clientActivityID: 'c-00001' },
          from: { id: 'u-00001' },
          id: 'a-00001',
          text: 'Hello',
          timestamp: new Date(1_000).toISOString(),
          type: 'message'
        });

        return { emitActivity, store };
      })
      .when('the bot replied with the same "clientActivityID"', ({ emitActivity, store }) => {
        emitActivity({
          channelData: { clientActivityID: 'c-00001' },
          from: { id: 'bot' },
          id: 'a-00002',
          text: 'Aloha',
          timestamp: new Date(2_000).toISOString(),
          type: 'message'
        });

        return store;
      })
      .then('should have 2 nodes', (_, store) => {
        expect(getSortedParts(store).map(({ text }) => text)).toEqual([['Hello'], ['Aloha']]);
      })
      .and('should not put client activity ID in "identifier" of the bot activity', (_, store) => {
        expect(store.queryByIdentifier(getActivityIdentifier('a-00002'))?.identifier).toEqual(
          new Set(['_:activity:a-00002'])
        );
      });
  },
  NodeTest
);

scenario(
  'receiving an activity from the bot without ID',
  bdd => {
    bdd
      .given('a Direct Line store', () => ({ ...createStore(), warn: silenceConsole('warn') }))
      .when(
        'an activity without ID is received',
        ({ emitActivity, store }) => {
          emitActivity({ from: { id: 'bot' }, text: 'Hello', type: 'message' });

          return store;
        },
        ({ warn }) => warn.restore()
      )
      .then('should assign a random ID', (_, store) => {
        const [node] = getSortedParts(store);

        expect(node?.identifier).toEqual(new Set([expect.stringMatching(/^_:activity:./u)]));
      })
      .and('should warn', ({ warn }) => {
        expect(warn.calls).toHaveLength(1);
      });
  },
  NodeTest
);

scenario(
  'receiving an invalid activity',
  bdd => {
    bdd
      .given('a Direct Line store', () => ({ ...createStore(), error: silenceConsole('error') }))
      .when(
        'an activity without "type" is received, followed by a valid activity',
        ({ emitActivity, store }) => {
          emitActivity({ from: { id: 'bot' }, id: 'a-00001', text: 'Hello' });
          emitActivity({ from: { id: 'bot' }, id: 'a-00002', text: 'Aloha', type: 'message' });

          return store;
        },
        ({ error }) => error.restore()
      )
      .then('should ignore the invalid activity', (_, store) => {
        expect(getSortedParts(store).map(({ text }) => text)).toEqual([['Aloha']]);
      })
      .and('should log an error', ({ error }) => {
        expect(error.calls).toHaveLength(1);
      });
  },
  NodeTest
);

scenario(
  'receiving a "messageUpdate" activity',
  bdd => {
    bdd
      .given('a Direct Line store with an activity', () => {
        const { emitActivity, store } = createStore();

        emitActivity({ from: { id: 'bot' }, id: 'a-00001', text: 'Hello', type: 'message' });

        return { emitActivity, store };
      })
      .when('a "messageUpdate" activity is received', ({ emitActivity, store }) => {
        emitActivity({ from: { id: 'bot' }, id: 'a-00001', text: 'Aloha', type: 'messageUpdate' });

        return store.queryByIdentifier(getActivityIdentifier('a-00001'));
      })
      .then('should update the node as a message', ({ store }, node) => {
        expect(getSortedParts(store)).toEqual([node]);
        expect(node).toHaveProperty('text', ['Aloha']);
        expect(node?.['urn:microsoft:webchat:direct-line-activity:type']).toEqual(['message']);
      });
  },
  NodeTest
);

scenario(
  'receiving a "messageDelete" activity',
  bdd => {
    bdd
      .given('a Direct Line store with 2 activities', () => {
        const { emitActivity, store } = createStore();

        emitActivity({ from: { id: 'bot' }, id: 'a-00001', text: 'Hello', type: 'message' });
        emitActivity({ from: { id: 'bot' }, id: 'a-00002', text: 'Aloha', type: 'message' });

        return { emitActivity, store };
      })
      .when('a "messageDelete" activity is received', ({ emitActivity, store }) => {
        const node = store.queryByIdentifier(getActivityIdentifier('a-00001'));

        emitActivity({ from: { id: 'bot' }, id: 'a-00001', type: 'messageDelete' });

        return node;
      })
      .then('should remove the node from the graph', ({ store }, node) => {
        expect(store.getSnapshot().has(node?.['@id'] ?? '')).toBe(false);
        expect(store.queryByIdentifier(getActivityIdentifier('a-00001'))).toBeUndefined();
      })
      .and('should remove the node from the conversation', ({ store }) => {
        expect(getSortedParts(store).map(({ text }) => text)).toEqual([['Aloha']]);
      })
      .when('a "messageDelete" activity of unknown activity is received', ({ emitActivity, store }) => {
        const snapshot = store.getSnapshot();

        emitActivity({ from: { id: 'bot' }, id: 'a-99999', type: 'messageDelete' });

        return snapshot;
      })
      .then('should not change the graph', ({ store }, snapshot) => {
        expect(store.getSnapshot()).toBe(snapshot);
      });
  },
  NodeTest
);

scenario(
  'subscribing to changes',
  bdd => {
    bdd
      .given('a Direct Line store with a listener', () => {
        const { emitActivity, store } = createStore();
        const calls: ReadonlySet<string>[] = [];

        store.subscribe(affectedIds => calls.push(affectedIds));

        return { calls, emitActivity, store };
      })
      .when('an activity is received', ({ emitActivity, store }) => {
        emitActivity({ from: { id: 'bot' }, id: 'a-00001', text: 'Hello', type: 'message' });

        return store.queryByIdentifier(getActivityIdentifier('a-00001'));
      })
      .then('should notify once with the node and the conversation', ({ calls, store }, node) => {
        expect(calls).toHaveLength(1);
        expect(calls[0]).toEqual(new Set([node?.['@id'], store.conversationId, '_:activity:a-00001']));
      });
  },
  NodeTest
);
