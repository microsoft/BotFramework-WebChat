import { expect } from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import colorNode, { type SlantNode } from './colorNode';

function executeWhen([node]: [unknown, string | SlantNode]): [unknown] | [undefined, SlantNode] {
  let result: SlantNode;

  try {
    result = colorNode(node as any);
  } catch (error) {
    return [error];
  }

  return [undefined, result];
}

function executeThen([_, errorOrResult]: [unknown, string | SlantNode], result: [unknown] | [undefined, SlantNode]) {
  if (typeof result[0] === 'undefined') {
    expect(result[1]).toEqual(errorOrResult);
  } else {
    expect(() => {
      if (result[0]) {
        throw result[0];
      }
    }).toThrow(errorOrResult);
  }
}

scenario('Must have `@id`: every node in the graph must be identifiable', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with @id',
        () => [
          { '@id': '_:b1', '@type': ['Person'] },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with @id of empty string',
        () => [{ '@id': '' }, '@id is required and must be an IRI or blank node identifier']
      ],
      ['node without @id', () => [{}, '@id is required and must be an IRI or blank node identifier']]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});

scenario('Uniform getter/setter: every property value is an array, except `@context` and `@id`', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with literal value in plain',
        () => [
          { '@context': 'https://schema.org', '@id': '_:b1', '@type': ['Person'], name: 'John Doe' },
          { '@context': 'https://schema.org', '@id': '_:b1', '@type': ['Person'], name: ['John Doe'] }
        ]
      ],
      [
        'node with literal value in array',
        () => [
          { '@context': 'https://schema.org', '@id': '_:b1', '@type': ['Person'], name: ['John Doe'] },
          { '@context': 'https://schema.org', '@id': '_:b1', '@type': ['Person'], name: ['John Doe'] }
        ]
      ]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});

scenario('Uniform typing: node reference must be `{ "@id": string }` to reduce confusion with a plain string', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with reference',
        () => [
          { '@id': '_:b1', '@type': ['Person'], name: { '@id': '_:b2' } },
          { '@id': '_:b1', '@type': ['Person'], name: [{ '@id': '_:b2' }] }
        ]
      ]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});

scenario('Support multiple types: every `@type` must be an array of string', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with literal value in plain',
        () => [
          { '@id': '_:b1', '@type': 'Person' },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with literal value in array',
        () => [
          { '@id': '_:b1', '@type': ['Person'] },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});

scenario('Reduce confusion: empty array and `null` is removed', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with empty array',
        () => [
          { '@id': '_:b1', '@type': ['Person'], value: [] },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with null',
        () => [
          { '@id': '_:b1', '@type': ['Person'], value: null },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with array of null',
        () => [
          { '@id': '_:b1', '@type': ['Person'], value: [null] },
          'Invalid type: Expected (Array | Object | (boolean | number | string) | null) but received Array'
        ]
      ],
      [
        'node with hasPart of empty array',
        () => [
          { '@id': '_:b1', '@type': ['Person'], hasPart: [] },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with hasPart of null',
        () => [
          { '@id': '_:b1', '@type': ['Person'], hasPart: null },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with isPartOf of empty array',
        () => [
          { '@id': '_:b1', '@type': ['Person'], isPartOf: [] },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with isPartOf of null',
        () => [
          { '@id': '_:b1', '@type': ['Person'], isPartOf: null },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});

// scenario('Flattened: property values must be non-null literals or node reference, no nested objects', () => {
//   // TODO: Need to move flattenNodeObject into colorNode.
// });

scenario('Do not handle full JSON-LD spec: `@context` is an opaque string and the schema is not honored', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with @context of string',
        () => [
          { '@context': 'https://schema.org', '@id': '_:b1', '@type': ['Person'] },
          { '@context': 'https://schema.org', '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      [
        'node with @context of object',
        () => [
          { '@context': {}, '@id': '_:b1', '@type': ['Person'] },
          'Invalid type: Expected (Array | Object | (boolean | number | string) | null) but received Object'
        ]
      ]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});

// scenario('Auto-linking for Schema.org: `hasPart` and `isPartOf` are auto-inversed', bdd => {
//   // TODO: This is a feature of Graph.
// });

scenario('Debuggability: must have at least one `@type`', bdd => {
  bdd.given
    .oneOf<[unknown, string | SlantNode]>([
      [
        'node with @type',
        () => [
          { '@id': '_:b1', '@type': ['Person'] },
          { '@id': '_:b1', '@type': ['Person'] }
        ]
      ],
      ['node without @type', () => [{ '@id': '_:b1' }, 'Invalid key: Expected "@type" but received undefined']]
    ])
    .when('colored', executeWhen)
    .then('should match result', executeThen);
});
