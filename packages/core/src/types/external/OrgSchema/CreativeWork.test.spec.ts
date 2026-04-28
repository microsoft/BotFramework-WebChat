import { expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { creativeWorkSchema } from './CreativeWork';

// test('Testing', () => {
//   const one = object({
//     number: optional(arrayize(number()))
//   });

//   const two = intersect([
//     one,
//     objectWithRest(
//       {
//         string: optional(arrayize(string()))
//       },
//       arrayize()
//     )
//   ]);

//   try {
//     console.log(
//       parse(two, {
//         boolean: true,
//         number: [1],
//         string: 'abc'
//       })
//     );
//   } catch (error) {
//     console.error(error.issues);

//     throw error;
//   }
// });

// test('Test 2', () => {
//   try {
//     console.log(
//       parse(creativeWorkSchema, {
//         '@type': 'CreativeWork',
//         name: 'Alice in the Wonderland'
//       })
//     );
//   } catch (error) {
//     console.error(error.issues);

//     throw error;
//   }
// });

// test('valibot bug', () => {
//   console.log(
//     parse(
//       intersect([
//         union([
//           pipe(
//             any(),
//             // looseObject({ one: number() }),
//             transform(value => Object.freeze(value))
//           )
//         ]),
//         union([
//           pipe(
//             any(),
//             // looseObject({ two: number() }),
//             transform(value => Object.freeze(value))
//           )
//         ])
//       ]),
//       Object.freeze({ one: 1, two: 2 })
//     )
//   );
// });

test('Should parse recursively into claimInterpreter', () => {
  expect(
    parse(creativeWorkSchema, {
      '@context': 'https://schema.org',
      '@id': '',
      '@type': 'Message',
      keywords: ['AllowCopy'],
      type: 'https://schema.org/Message',
      citation: {
        '@id': 'https://bing.com/',
        '@type': 'Claim',
        claimInterpreter: {
          '@type': 'Project',
          slogan: 'Surfaced with Azure OpenAI',
          url: 'https://www.microsoft.com/en-us/ai/responsible-ai'
        },
        position: '1'
      }
    })
  ).toEqual({
    '@context': 'https://schema.org',
    '@id': '',
    '@type': 'Message',
    additionalType: [],
    alternateName: [],
    citation: [
      {
        '@id': 'https://bing.com/',
        '@type': 'Claim',
        abstract: [],
        additionalType: [],
        alternateName: [],
        appearance: [],
        author: [],
        citation: [],
        claimInterpreter: [
          {
            '@type': 'Project',
            additionalType: [],
            alternateName: [],
            description: [],
            name: [],
            potentialAction: [],
            slogan: ['Surfaced with Azure OpenAI'],
            url: ['https://www.microsoft.com/en-us/ai/responsible-ai']
          }
        ],
        creativeWorkStatus: [],
        description: [],
        isBasedOn: [],
        isPartOf: [],
        keywords: [],
        name: [],
        pattern: [],
        position: ['1'],
        potentialAction: [],
        text: [],
        url: [],
        usageInfo: []
      }
    ],
    abstract: [],
    author: [],
    creativeWorkStatus: [],
    description: [],
    isBasedOn: [],
    isPartOf: [],
    keywords: ['AllowCopy'],
    name: [],
    pattern: [],
    position: [],
    potentialAction: [],
    text: [],
    url: [],
    // type: ['https://schema.org/Message'],
    usageInfo: []
  });
});

// test('theory', () => {
//   console.log(parse(intersect([
// });
