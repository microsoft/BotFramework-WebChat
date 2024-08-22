type ActivityDecoratorRequestType = {
  /**
   * Decorate the activity as it participate in a livestreaming session.
   *
   * - `"completing"` - decorate as the livestreaming is completing
   * - `"ongoing"` - decorate as the livestreaming is ongoing
   * - `"preparing"` - decorate as the livestreaming is being prepared
   * - `undefined` - not participated in a livestreaming session
   */
  decorateForLivestreaming: 'completing' | 'preparing' | 'ongoing' | undefined;

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
