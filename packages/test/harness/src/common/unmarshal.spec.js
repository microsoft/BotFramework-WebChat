const unmarshal = require('./unmarshal');

const MARSHALLED_ERROR = {
  __type: 'error',
  message: 'message',
  stack: 'stack'
};

describe('Unmarshalling value of', () => {
  test('error', () => {
    const error = unmarshal(MARSHALLED_ERROR);

    expect(error).toHaveProperty('message', 'message');
    expect(error).toHaveProperty('stack', 'stack');
  });

  test('object', () => {
    expect(
      unmarshal({
        boolean: true,
        null: null,
        number: 123,
        string: 'string',
        undefined: {
          __type: 'undefined'
        }
      })
    ).toMatchInlineSnapshot(`
      Object {
        "boolean": true,
        "null": null,
        "number": 123,
        "string": "string",
        "undefined": undefined,
      }
    `);
  });

  test('array', () => {
    expect(
      unmarshal([
        true,
        // eslint-disable-next-line no-magic-numbers
        123,
        null,
        'string',
        {
          __type: 'undefined'
        }
      ])
    ).toMatchInlineSnapshot(`
      Array [
        true,
        123,
        null,
        "string",
        undefined,
      ]
    `);
  });
});
