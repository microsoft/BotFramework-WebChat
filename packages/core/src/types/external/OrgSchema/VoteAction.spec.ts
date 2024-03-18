import { parseVoteAction } from './VoteAction';

describe('VoteAction', () => {
  describe('actionOption', () => {
    test('should parse', () =>
      expect(
        parseVoteAction({
          '@type': 'VoteAction',
          actionOption: 'upvote'
        })
      ).toEqual({
        '@type': 'VoteAction',
        actionOption: 'upvote'
      }));

    test('should change invalid into undefined', () => {
      try {
        expect(
          parseVoteAction({
            '@type': 'Action',
            actionOption: 123
          })
        ).toEqual({
          '@type': 'Action',
          actionOption: undefined
        });
      } catch (err) {
        console.error(err);
        console.error(err.issues[0].input);

        throw err;
      }
    });
  });
});
