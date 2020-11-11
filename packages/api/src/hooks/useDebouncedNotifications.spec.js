import { getEarliestUpdateNotBefore } from './useDebouncedNotifications';

describe('getEarliestUpdateNotBefore', () => {
  describe('with two notifications', () => {
    describe('both outdated', () => {
      test('return the first one', () => {
        const actual = getEarliestUpdateNotBefore({
          first: {
            outOfDate: true,
            updateNotBefore: 100
          },
          second: {
            outOfDate: true,
            updateNotBefore: 200
          }
        });

        expect(actual).toBe(100);
      });

      test('return the last one', () => {
        const actual = getEarliestUpdateNotBefore({
          first: {
            outOfDate: true,
            updateNotBefore: 200
          },
          second: {
            outOfDate: true,
            updateNotBefore: 100
          }
        });

        expect(actual).toBe(100);
      });
    });

    describe('only one outdated', () => {
      test('return the first one', () => {
        const actual = getEarliestUpdateNotBefore({
          first: {
            outOfDate: true,
            updateNotBefore: 100
          },
          second: {
            outOfDate: false,
            updateNotBefore: 200
          }
        });

        expect(actual).toBe(100);
      });

      test('return the last one', () => {
        const actual = getEarliestUpdateNotBefore({
          first: {
            outOfDate: false,
            updateNotBefore: 200
          },
          second: {
            outOfDate: true,
            updateNotBefore: 100
          }
        });

        expect(actual).toBe(100);
      });
    });
  });

  describe('with no notifications', () => {
    const actual = getEarliestUpdateNotBefore({});

    expect(actual).toBeUndefined();
  });
});
