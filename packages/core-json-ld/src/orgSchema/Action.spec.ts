import { describe, expect, test } from '@jest/globals';
import { parse } from 'valibot';
import { actionSchema, parseAction } from './Action';
import { userReviewSchema } from './UserReview';

const actionTemplate = parse(actionSchema, {});
const userReviewTemplate = parse(userReviewSchema, {});

describe('Action', () => {
  describe('actionStatus', () => {
    test('should parse', () =>
      expect(
        parseAction({
          '@type': 'Action',
          actionStatus: 'ActiveActionStatus'
        })
      ).toEqual({
        ...actionTemplate,
        '@type': ['Action'],
        actionStatus: ['ActiveActionStatus']
      }));

    test('should change invalid into undefined', () => {
      try {
        expect(
          parseAction({
            '@type': 'Action',
            // @ts-expect-error
            actionStatus: 'ABC'
          })
        ).toEqual({
          ...actionTemplate,
          '@type': ['Action'],
          actionStatus: []
        });
      } catch (err) {
        console.error(err);
        // @ts-expect-error
        console.error(err.issues[0].input);

        throw err;
      }
    });

    test('should match snapshot', () => {
      expect(
        parse(actionSchema, {
          '@type': 'LikeAction',
          actionStatus: 'PotentialActionStatus',
          result: {
            '@type': 'UserReview',
            reviewAspect: 'Hello, World!'
          }
        })
      ).toEqual({
        ...actionTemplate,
        '@type': ['LikeAction'],
        actionStatus: ['PotentialActionStatus'],
        result: [
          {
            ...userReviewTemplate,
            '@type': ['UserReview'],
            reviewAspect: ['Hello, World!']
          }
        ]
      });
    });
  });
});
