import activityFromBot from '../definitions/activityFromBot';

describe('activityFromBot', () => {
  it('should return whether an activity is from a bot', () => {
    const activity = { from: { role: 'bot' } };

    expect(activityFromBot(activity)).toBe(true);
  });
});
