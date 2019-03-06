import speakableActivity from '../definitions/speakableActivity';

describe('speakableActivity', () => {
  it('should determine whether an activity is speakable', () => {
    const activity = { from: {}, type: 'message' };

    expect(speakableActivity(activity)).toBe(true);
  });
});
