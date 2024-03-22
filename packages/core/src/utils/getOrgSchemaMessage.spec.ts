import getOrgSchemaMessage from './getOrgSchemaMessage';

test('should get message', () => {
  const expected = {
    '@context': 'https://schema.org',
    '@id': '',
    '@type': 'Message',
    type: 'https://schema.org/Message'
  };

  expect(getOrgSchemaMessage([expected])).toEqual(expected);
});

test('should not get message without @id of empty string', () => {
  const expected = {
    '@context': 'https://schema.org',
    '@type': 'Message',
    type: 'https://schema.org/Message'
  };

  expect(getOrgSchemaMessage([expected])).toBeUndefined();
});
