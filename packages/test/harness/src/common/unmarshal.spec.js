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
      {
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
        123,
        null,
        'string',
        {
          __type: 'undefined'
        }
      ])
    ).toMatchInlineSnapshot(`
      [
        true,
        123,
        null,
        "string",
        undefined,
      ]
    `);
  });
});
