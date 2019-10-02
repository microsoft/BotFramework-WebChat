/**
 * @jest-environment jsdom
 */

const { default: fetchJSON } = require('./fetchJSON');

test('Fetch JSON failed', async () => {
  window.fetch = jest.fn(async () => ({
    ok: false,
    status: 404
  }));

  await expect(fetchJSON('http://example.com/', {})).rejects.toThrow('Server returned 404');
});

test('Fetch JSON succeeded', async () => {
  window.fetch = jest.fn(async () => ({
    ok: true,
    json: () => ({
      hello: 'World!'
    })
  }));

  const options = {};
  const json = await fetchJSON('http://example.com/', options);

  expect(json).toEqual({ hello: 'World!' });
  expect(window.fetch).toHaveBeenCalledTimes(1);
  expect(window.fetch).toHaveBeenCalledWith('http://example.com/', options);
});
