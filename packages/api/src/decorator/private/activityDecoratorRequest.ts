type ActivityDecoratorRequestType = {
  /**
   * Decorate the activity as it participate in a livestreaming session.
   *
   * - `"completing"` - decorate as the livestreaming is completing
   * - `"informative message"` - decorate as informative message in a livestreaming session
   * - `undefined` - not participated in a livestreaming session
   */
  decorateForLivestreaming: 'completing' | 'informative message' | undefined;

  /**
   * Gets the role of the sender for the activity.
   *
   * - `"bot"` - the sender is a bot or other users
   * - `"channel"` - the sender is the channel service
   * - `"user"` - the sender is the current user
   * - `undefined` - the sender is unknown
   */
  from: 'bot' | 'channel' | `user` | undefined;
};

export default ActivityDecoratorRequestType;
