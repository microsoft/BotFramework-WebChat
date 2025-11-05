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
          'Only JSON literal, literal, node reference or null can be parsed into slant node'
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

scenario('Flattened: property values must be non-null literals, node reference, or JSON literals', bdd => {
  // TODO: Need to move flattenNodeObject into colorNode to test more scenarios in flattening.
  // Any array containing `null` is not supported and will throw unless it is JSON literal, as it is likely a bug in code
  bdd
    .given('an array with null value', () => ({
      '@id': '_:b1',
      '@type': 'Message',
      attachments: [null]
    }))
    .when('colored', node => {
      try {
        colorNode(node as any);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        if (error) {
          throw error;
        }
      }).toThrow('Only JSON literal, literal, node reference or null can be parsed into slant node');
    });
});

scenario("JSON literals will be kept as-is: `{ '@type': '@json', '@value': JSONValue }`", bdd => {
  bdd
    .given('a JSON literal with a plain object', () => ({
      '@id': '_:b1',
      '@type': 'Message',
      attachments: {
        '@type': '@json',
        '@value': { one: 1 }
      }
    }))
    .when('colored', node => colorNode(node as any))
    .then('should return a clean JSON literal', (_, result) => {
      expect(result).toEqual({
        '@id': '_:b1',
        '@type': ['Message'],
        attachments: [
          {
            '@type': '@json',
            '@value': { one: 1 }
          }
        ]
      });
    });

  bdd
    .given('a JSON literal with an array', () => ({
      '@id': '_:b1',
      '@type': 'Message',
      attachments: {
        '@type': '@json',
        '@value': [123]
      }
    }))
    .when('colored', node => colorNode(node as any))
    .then('should return a clean JSON literal', (_, result) => {
      expect(result).toEqual({
        '@id': '_:b1',
        '@type': ['Message'],
        attachments: [
          {
            '@type': '@json',
            '@value': [123]
          }
        ]
      });
    });

  bdd
    .given('a JSON literal with null', () => ({
      '@id': '_:b1',
      '@type': 'Message',
      attachments: {
        '@type': '@json',
        '@value': null
      }
    }))
    .when('colored', node => colorNode(node as any))
    .then('should return a clean JSON literal', (_, result) => {
      expect(result).toEqual({
        '@id': '_:b1',
        '@type': ['Message'],
        attachments: [
          {
            '@type': '@json',
            '@value': null
          }
        ]
      });
    });

  bdd
    .given('a JSON literal with extraneous properties', () => ({
      '@id': '_:b1',
      '@type': 'Message',
      attachments: {
        '@type': '@json',
        '@value': {},
        extraneous: 123
      }
    }))
    .when('colored', node => {
      try {
        colorNode(node as any);
      } catch (error) {
        return error;
      }

      return undefined;
    })
    .then('should throw', (_, error) => {
      expect(() => {
        if (error) {
          throw error;
        }
      }).toThrow('Only JSON literal, literal, node reference or null can be parsed into slant node');
    });
});

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
          'Only JSON literal, literal, node reference or null can be parsed into slant node'
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
