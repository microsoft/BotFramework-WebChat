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
          '@type': 'Building',
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
              '@type': ['Building'],
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
