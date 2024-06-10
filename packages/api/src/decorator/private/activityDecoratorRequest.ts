type ActivityDecoratorRequestType = {
  from: 'user' | 'bot' | 'channel';
  state: 'completion' | 'informative' | undefined;
};

export default ActivityDecoratorRequestType;
