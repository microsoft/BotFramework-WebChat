type ActivityDecoratorRequestType = {
  from: 'bot' | 'channel' | `user` | undefined;
  state: 'completion' | 'informative' | undefined;
};

export default ActivityDecoratorRequestType;
