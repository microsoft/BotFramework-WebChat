import { describe, expect, test } from '@jest/globals';
import { parseVoteAction, voteActionSchema } from './VoteAction';
import { parse } from 'valibot';

const voteActionTemplate = parse(voteActionSchema, {});

describe('VoteAction', () => {
  describe('actionOption', () => {
    test('should parse', () =>
      expect(
        parseVoteAction({
          '@type': 'VoteAction',
          actionOption: 'upvote'
        })
      ).toEqual({
        ...voteActionTemplate,
        '@type': 'VoteAction',
        actionOption: ['upvote']
      }));

    test('should change invalid into undefined', () => {
      try {
        expect(
          parseVoteAction({
            '@type': 'Action',
            // @ts-expect-error
            actionOption: 123
          })
        ).toEqual({
          ...voteActionTemplate,
          '@type': 'Action',
          actionOption: []
        });
      } catch (err) {
        console.error(err);
        // @ts-expect-error
        console.error(err.issues[0].input);

        throw err;
      }
    });
  });
});
