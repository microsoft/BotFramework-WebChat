import { parseAction } from './Action';

describe('Action', () => {
  describe('actionStatus', () => {
    test('should parse', () =>
      expect(
        parseAction({
          '@type': 'Action',
          actionStatus: 'ActiveActionStatus'
        })
      ).toEqual({
        '@type': 'Action',
        actionStatus: 'ActiveActionStatus'
      }));

    test('should change invalid into undefined', () => {
      try {
        expect(
          parseAction({
            '@type': 'Action',
            actionStatus: 'ABC'
          })
        ).toEqual({
          '@type': 'Action',
          actionStatus: undefined
        });
      } catch (err) {
        console.error(err);
        console.error(err.issues[0].input);

        throw err;
      }
    });
  });
});
