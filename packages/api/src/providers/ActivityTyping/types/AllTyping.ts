export type AllTyping = {
  firstAppearAt: number;
  lastActivityDuration: number;
  lastAppearAt: number;
  name: string | undefined;
  role: 'bot' | 'user';
  type: 'busy' | 'livestream';
};
