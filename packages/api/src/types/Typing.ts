export type Typing = {
  at: number;
  expireAt: number;
  name: string;
  role: 'bot' | 'user';
  type: 'indicator' | 'livestream';
};
