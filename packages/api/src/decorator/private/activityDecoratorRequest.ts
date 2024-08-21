type ActivityDecoratorRequestType = {
  from: 'bot' | 'channel' | `user` | undefined;

  /**
   * Decorate the activity in a livestreaming session.
   *
   * - `"completing"` - decorate as the livestreaming is completing
   * - `"informative message"` - decorate as informative message in a livestreaming session
   * - `undefined` - not participated in a livestreaming session
   */
  livestreaming: 'completing' | 'informative message' | undefined;
};

export default ActivityDecoratorRequestType;
