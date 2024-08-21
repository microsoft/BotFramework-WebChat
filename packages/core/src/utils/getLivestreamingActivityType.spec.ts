import getLivestreamingActivityType from './getLivestreamingActivityType';

test('activity with "streamType" of "streaming" should return "chunk"', () =>
  expect(
    getLivestreamingActivityType({
      channelData: {
        streamId: 'a-00001',
        streamSequence: 1,
        streamType: 'streaming'
      },
      from: { role: 'bot' },
      text: '',
      type: 'typing'
    } as any)
  ).toBe('chunk'));

test('activity with "streamType" of "informative" should return "informative"', () =>
  expect(
    getLivestreamingActivityType({
      channelData: {
        streamId: 'a-00001',
        streamSequence: 1,
        streamType: 'informative'
      },
      from: { role: 'bot' },
      text: '',
      type: 'typing'
    } as any)
  ).toBe('informative'));

test('activity with "streamType" of "final" should return "final"', () =>
  expect(
    getLivestreamingActivityType({
      channelData: {
        streamId: 'a-00001',
        streamSequence: 1,
        streamType: 'final'
      },
      from: { role: 'bot' },
      text: '',
      type: 'message'
    } as any)
  ).toBe('final'));

test('invalid activity should return undefined', () =>
  expect(getLivestreamingActivityType('invalid' as any)).toBeUndefined());

test('activity with "streamType" of "streaming" without critical fields should return undefined', () =>
  expect(
    getLivestreamingActivityType({
      channelData: {
        streamType: 'streaming'
      },
      type: 'typing'
    } as any)
  ).toBeUndefined());
