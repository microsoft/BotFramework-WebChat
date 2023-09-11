import { isReplyAction } from './ReplyAction';

test('should return true for ReplyAction', () =>
  expect(
    isReplyAction({ '@context': 'https://schema.org', '@type': 'ReplyAction', type: 'https://schema.org/ReplyAction' })
  ).toBe(true));

test('should return false for Person', () =>
  expect(
    isReplyAction({ '@context': 'https://schema.org', '@type': 'Person', type: 'https://schema.org/Person' })
  ).toBe(false));
