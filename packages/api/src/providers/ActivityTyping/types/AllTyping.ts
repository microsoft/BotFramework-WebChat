export type AllTyping = {
  firstReceivedAt: number;
  lastActivityDuration: number;
  lastReceivedAt: number;
  name: string | undefined;
  role: 'bot' | 'user';
  type: 'busy' | 'livestream';
};
