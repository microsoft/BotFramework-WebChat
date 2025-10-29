// /// <reference types="jest" />

// import { scenario } from '@testduet/given-when-then';
// import { parse } from 'valibot';
// import { nodeObject } from './NodeObject';

// scenario('NodeObject', bdd => {
//   bdd.given
//     .oneOf<any>([
//       ['a boolean', () => [true, [true]]],
//       ['a number', () => [1, [1]]],
//       ['a string', () => ['abc', ['abc']]],
//       ['a null value', () => [null, [null]]],
//       ['a node object', () => [{ '@id': '_:2', value: 123 }, [{ '@id': '_:2', value: [123] }]]],
//       ['an array of boolean', () => [[true], [true]]],
//       ['an array of number', () => [[1], [1]]],
//       ['an array of string', () => [['abc'], ['abc']]],
//       ['an array of null value', () => [[null], [null]]],
//       ['an array of node object', () => [[{ '@id': '_:2', value: 123 }], [{ '@id': '_:2', value: [123] }]]]
//     ])
//     .when('parsing value in a NodeObject', ([value]) => parse(nodeObject(), { '@id': '_:1', value }))
//     .then('should return expected value', ([_, expected], { value }) => expect(value).toEqual(expected))
//     .and('node object should be frozen', (_, nodeObject) => expect(Object.isFrozen(nodeObject)).toBe(true))
//     .and('value should be frozen', (_, nodeObject) => {
//       expect(Object.isFrozen(nodeObject['value'])).toBe(true);
//     });
// });
