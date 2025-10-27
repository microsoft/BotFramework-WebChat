import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';

import './expectExtendValibot';
import flattenNodeObject from './flattenNodeObject';
import identifier from './Identifier';
import { nodeReference } from './NodeReference';

scenario('flattenNodeObject()', bdd => {
  bdd
    .given(
      'spying console.warn',
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => jest.spyOn(console, 'warn').mockImplementation(() => {}),
      warn => warn.mockRestore()
    )
    .and('a Conversation object from Schema.org with `@id` added for cross-referencing', () => ({
      '@context': 'https://schema.org/',
      '@type': 'Conversation',
      name: 'Duck Season vs Rabbit Season',
      sameAs: 'https://www.youtube.com/watch?v=9-k5J4RxQdE',
      hasPart: [
        {
          '@type': 'Message',
          sender: { '@id': '_:bugs-bunny', '@type': 'Person', name: 'Bugs Bunny' },
          recipient: { '@id': '_:daffy-duck', '@type': 'Person', name: 'Daffy Duck' },
          about: { '@type': 'Thing', name: 'Duck Season' },
          datePublished: '2016-02-29'
        },
        {
          '@type': 'Message',
          sender: { '@id': '_:daffy-duck', '@type': 'Person', name: 'Daffy Duck' },
          recipient: { '@id': '_:bugs-bunny', '@type': 'Person', name: 'Bugs Bunny' },
          about: { '@type': 'Thing', name: 'Rabbit Season' },
          datePublished: '2016-03-01'
        }
      ]
    }))
    .when('when flattened', value => flattenNodeObject(value))
    .then('the first object should be the Conversation', (_, { graph }) => {
      expect(graph[0]).toEqual({
        '@context': 'https://schema.org/',
        '@id': expect.valibot(identifier()),
        '@type': 'Conversation',
        name: 'Duck Season vs Rabbit Season',
        sameAs: 'https://www.youtube.com/watch?v=9-k5J4RxQdE',
        hasPart: [expect.valibot(nodeReference()), expect.valibot(nodeReference())]
      });
    })
    .and('should return 7 objects', (_, { graph }) => {
      expect(graph).toEqual([
        {
          '@context': 'https://schema.org/',
          '@id': expect.valibot(identifier()),
          '@type': 'Conversation',
          name: 'Duck Season vs Rabbit Season',
          sameAs: 'https://www.youtube.com/watch?v=9-k5J4RxQdE',
          hasPart: [expect.valibot(nodeReference()), expect.valibot(nodeReference())]
        },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Message',
          sender: { '@id': '_:bugs-bunny' },
          recipient: { '@id': '_:daffy-duck' },
          about: expect.valibot(nodeReference()),
          datePublished: '2016-02-29'
        },
        { '@id': '_:bugs-bunny', '@type': 'Person', name: 'Bugs Bunny' },
        { '@id': '_:daffy-duck', '@type': 'Person', name: 'Daffy Duck' },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Thing',
          name: 'Duck Season'
        },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Message',
          sender: { '@id': '_:daffy-duck' },
          recipient: { '@id': '_:bugs-bunny' },
          about: expect.valibot(nodeReference()),
          datePublished: '2016-03-01'
        },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Thing',
          name: 'Rabbit Season'
        }
      ]);
    })
    .and('should warn about adding objects twice', () => {
      expect(console.warn).toHaveBeenCalledTimes(2);
      expect(console.warn).toHaveBeenNthCalledWith(1, 'Object [@id="_:daffy-duck"] has already added to the graph.');
      expect(console.warn).toHaveBeenNthCalledWith(2, 'Object [@id="_:bugs-bunny"] has already added to the graph.');
    });

  bdd
    .given(
      'spying console.warn',
      () => jest.spyOn(console, 'warn'),
      warn => warn.mockRestore()
    )
    .and('a Conversation object from Schema.org', () => {
      const bugsBunny = { '@type': 'Person', name: 'Bugs Bunny' };
      const daffyDuck = { '@type': 'Person', name: 'Daffy Duck' };

      return {
        '@context': 'https://schema.org/',
        '@type': 'Conversation',
        name: 'Duck Season vs Rabbit Season',
        sameAs: 'https://www.youtube.com/watch?v=9-k5J4RxQdE',
        hasPart: [
          {
            '@type': 'Message',
            sender: bugsBunny,
            recipient: daffyDuck,
            about: { '@type': 'Thing', name: 'Duck Season' },
            datePublished: '2016-02-29'
          },
          {
            '@type': 'Message',
            sender: daffyDuck,
            recipient: bugsBunny,
            about: { '@type': 'Thing', name: 'Rabbit Season' },
            datePublished: '2016-03-01'
          }
        ]
      };
    })
    .when('when flattened', value => flattenNodeObject(value))
    .then('the first object should be the Conversation', (_, { graph }) => {
      expect(graph[0]).toEqual({
        '@context': 'https://schema.org/',
        '@id': expect.valibot(identifier()),
        '@type': 'Conversation',
        name: 'Duck Season vs Rabbit Season',
        sameAs: 'https://www.youtube.com/watch?v=9-k5J4RxQdE',
        hasPart: [expect.valibot(nodeReference()), expect.valibot(nodeReference())]
      });
    })
    .and('should return 7 objects', (_, { graph }) => {
      expect(graph).toEqual([
        {
          '@context': 'https://schema.org/',
          '@id': expect.valibot(identifier()),
          '@type': 'Conversation',
          name: 'Duck Season vs Rabbit Season',
          sameAs: 'https://www.youtube.com/watch?v=9-k5J4RxQdE',
          hasPart: [expect.valibot(nodeReference()), expect.valibot(nodeReference())]
        },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Message',
          sender: expect.valibot(nodeReference()),
          recipient: expect.valibot(nodeReference()),
          about: { '@id': expect.valibot(identifier()) },
          datePublished: '2016-02-29'
        },
        { '@id': expect.valibot(identifier()), '@type': 'Person', name: 'Bugs Bunny' },
        { '@id': expect.valibot(identifier()), '@type': 'Person', name: 'Daffy Duck' },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Thing',
          name: 'Duck Season'
        },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Message',
          sender: expect.valibot(nodeReference()),
          recipient: expect.valibot(nodeReference()),
          about: expect.valibot(nodeReference()),
          datePublished: '2016-03-01'
        },
        {
          '@id': expect.valibot(identifier()),
          '@type': 'Thing',
          name: 'Rabbit Season'
        }
      ]);
    })
    .and('node reference should be linked properly', (_, { graph }) => {
      // Conversation.hasPart = [Message[0], Message[1]]
      // @ts-ignore
      expect(graph[0]['hasPart']).toEqual([{ '@id': graph[1]['@id'] }, { '@id': graph[5]['@id'] }]);

      // Message[0].sender = Message[name="Bug Bunny"]
      // @ts-ignore
      expect(graph[1]['sender']['@id']).toEqual(graph[2]['@id']);

      // Message[0].recipient = Message[name="Daffy Duck"]
      // @ts-ignore
      expect(graph[1]['recipient']['@id']).toEqual(graph[3]['@id']);

      // Message[0].about = Thing[name="Duck Season"]
      // @ts-ignore
      expect(graph[1]['about']['@id']).toEqual(graph[4]['@id']);

      // Message[1].sender = Message[name="Daffy Duck"]
      // @ts-ignore
      expect(graph[5]['sender']['@id']).toEqual(graph[3]['@id']);

      // Message[1].recipient = Message[name="Bugs Bunny"]
      // @ts-ignore
      expect(graph[5]['recipient']['@id']).toEqual(graph[2]['@id']);

      // Message[1].about = Thing[name="Rabbit Season"]
      // @ts-ignore
      expect(graph[5]['about']['@id']).toEqual(graph[6]['@id']);
    })
    .and('should not warn', () => {
      expect(console.warn).not.toHaveBeenCalled();
    });
});
