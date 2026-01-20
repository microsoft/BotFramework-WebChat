import { createContext } from 'react';

type ActivityBorderDecoratorRequest = Readonly<{
  /**
   * Decorate the activity as it participate in a livestreaming session.
   *
   * - `"completing"` - decorate as the livestreaming is completing
   * - `"ongoing"` - decorate as the livestreaming is ongoing
   * - `"preparing"` - decorate as the livestreaming is being prepared
   * - `undefined` - not participated in a livestreaming session
   */
  livestreamingState: 'completing' | 'ongoing' | 'preparing' | undefined;

  /**
   * Gets the role of the sender for the activity.
   *
   * - `"bot"` - the sender is a bot or other users
   * - `"channel"` - the sender is the channel service
   * - `"user"` - the sender is the current user
   * - `undefined` - the sender is unknown
   */
  from: 'bot' | 'channel' | `user` | undefined;

  /**
   * Gets the role of the voice transcript activity sender.
   *
   * - `"bot"` - the voice transcript is from the bot/agent
   * - `"user"` - the voice transcript is from the user
   * - `undefined` - the activity is not a voice transcript
   */
  voiceTranscriptRole: 'bot' | 'user' | undefined;
}>;

type ActivityBorderDecoratorRequestContextType = Readonly<{
  request: ActivityBorderDecoratorRequest;
}>;

const ActivityBorderDecoratorRequestContext = createContext<ActivityBorderDecoratorRequestContextType>(
  Object.freeze({
    request: Object.freeze({
      from: undefined,
      voiceTranscriptRole: undefined,
      livestreamingState: undefined
    })
  })
);

export default ActivityBorderDecoratorRequestContext;
export { type ActivityBorderDecoratorRequestContextType, type ActivityBorderDecoratorRequest };
