import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import SlantGraph from './SlantGraph';

scenario('SlantGraph arrayize', bdd => {
  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting a node with literal properties', graph =>
      graph.act(graph =>
        graph.upsert({
          '@id': '_:b1',
          '@type': 'Person',
          name: 'John Doe'
        })
      )
    )
    .then('should arrayize all properties', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1',
              '@type': ['Person'],
              name: ['John Doe']
            }
          })
        )
      )
    );
});

scenario('SlantGraph handling JSON literals', bdd => {
  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting a node with JSON literal property', graph =>
      graph.act(graph =>
        graph.upsert({
          '@id': '_:b1',
          '@type': 'LandmarksOrHistoricalBuildings',
          description: 'The Empire State Building is a 102-story landmark in New York City.',
          geo: {
            '@type': '@json',
            '@value': {
              latitude: '40.75',
              longitude: '73.98'
            }
          },
          image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
          name: 'The Empire State Building'
        })
      )
    )
    .then('should arrayize the property', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:b1': {
              '@id': '_:b1',
              '@type': ['LandmarksOrHistoricalBuildings'],
              description: ['The Empire State Building is a 102-story landmark in New York City.'],
              geo: [
                {
                  '@type': '@json',
                  '@value': {
                    latitude: '40.75',
                    longitude: '73.98'
                  }
                }
              ],
              image: ['http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg'],
              name: ['The Empire State Building']
            }
          })
        )
      )
    );
});

scenario('SlantGraph handling blank node', bdd => {
  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting a node of address', graph =>
      graph.act(graph =>
        graph.upsert({
          '@id': '_:a1',
          '@type': 'PostalAddress',
          addressLocality: 'New York',
          addressRegion: 'NY',
          postalCode: '10118',
          streetAddress: '350 Fifth Avenue'
        })
      )
    )
    .then('should have the address in the graph', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:a1': {
              '@id': '_:a1',
              '@type': ['PostalAddress'],
              addressLocality: ['New York'],
              addressRegion: ['NY'],
              postalCode: ['10118'],
              streetAddress: ['350 Fifth Avenue']
            }
          })
        )
      )
    )
    .when('upserting a building linked to the address', graph => {
      graph.act(graph =>
        graph.upsert({
          '@id': '_:b1',
          '@type': 'LandmarksOrHistoricalBuildings',
          address: { '@id': '_:a1' },
          description: 'The Empire State Building is a 102-story landmark in New York City.',
          image: 'http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg',
          name: 'The Empire State Building'
        })
      );
    })
    .then('should have linked in the graph', graph => {
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:a1': {
              '@id': '_:a1',
              '@type': ['PostalAddress'],
              addressLocality: ['New York'],
              addressRegion: ['NY'],
              postalCode: ['10118'],
              streetAddress: ['350 Fifth Avenue']
            },
            '_:b1': {
              '@id': '_:b1',
              '@type': ['LandmarksOrHistoricalBuildings'],
              address: [{ '@id': '_:a1' }],
              description: ['The Empire State Building is a 102-story landmark in New York City.'],
              image: ['http://www.civil.usherbrooke.ca/cours/gci215a/empire-state-building.jpg'],
              name: ['The Empire State Building']
            }
          })
        )
      );
    });
});

scenario('SlantGraph auto-inversing', bdd => {
  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting 2 nodes with hasPart only', graph =>
      graph.act(graph =>
        graph.upsert(
          {
            '@id': '_:c1',
            '@type': 'Conversation',
            abstract: 'Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.',
            hasPart: [{ '@id': '_:m1' }]
          },
          {
            '@id': '_:m1',
            '@type': 'MessageLike',
            text: 'Hello, World!'
          }
        )
      )
    )
    .then('should perform auto-inversing', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:c1': {
              '@id': '_:c1',
              '@type': ['Conversation'],
              abstract: ['Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.'],
              hasPart: [{ '@id': '_:m1' }]
            },
            '_:m1': {
              '@id': '_:m1',
              '@type': ['MessageLike'],
              isPartOf: [{ '@id': '_:c1' }],
              text: ['Hello, World!']
            }
          })
        )
      )
    );

  bdd
    .given('a SlantGraph', () => new SlantGraph())
    .when('upserting 2 nodes with isPartOf only', graph =>
      graph.act(graph =>
        graph.upsert(
          {
            '@id': '_:c1',
            '@type': 'Conversation',
            abstract: 'Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.'
          },
          {
            '@id': '_:m1',
            '@type': 'MessageLike',
            isPartOf: [{ '@id': '_:c1' }],
            text: 'Hello, World!'
          }
        )
      )
    )
    .then('should perform auto-inversing', graph =>
      expect(graph.getState()).toEqual(
        new Map(
          Object.entries({
            '_:c1': {
              '@id': '_:c1',
              '@type': ['Conversation'],
              abstract: ['Adipisicing voluptate aute mollit culpa nostrud labore ea deserunt nulla culpa nisi ea.'],
              hasPart: [{ '@id': '_:m1' }]
            },
            '_:m1': {
              '@id': '_:m1',
              '@type': ['MessageLike'],
              isPartOf: [{ '@id': '_:c1' }],
              text: ['Hello, World!']
            }
          })
        )
      )
    );
});
