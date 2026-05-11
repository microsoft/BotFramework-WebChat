import { expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { orgSchemaCreativeWorkSchema } from '@msinternal/botframework-webchat-core-json-ld';
import getOrgSchemaMessage from './getOrgSchemaMessage';

test('should get message', () => {
  const expected = {
    '@context': 'https://schema.org',
    '@id': '',
    '@type': 'Message',
    type: 'https://schema.org/Message'
  };

  expect(getOrgSchemaMessage([expected])).toEqual(parse(orgSchemaCreativeWorkSchema, expected));
});

test('should not get message without @id of empty string', () => {
  const expected = {
    '@context': 'https://schema.org',
    '@type': 'Message',
    type: 'https://schema.org/Message'
  };

  expect(getOrgSchemaMessage([expected])).toBeUndefined();
});
