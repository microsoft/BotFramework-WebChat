import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import Graph from './Graph2';
import './schemas/private/expectExtendValibot';
import './schemas/private/expectIsFrozen';

scenario('Graph.getState()', bdd => {
  bdd
    .given('a Graph object', () => new Graph(() => () => request => request))
    .when('getState() is called', graph => graph.getState())
    .then('should return empty Map', (_, state) => expect(state).toBeInstanceOf(Map))
    .and('should return frozen', (_, state) => expect(Object.isFrozen(state)).toBe(true));
});
