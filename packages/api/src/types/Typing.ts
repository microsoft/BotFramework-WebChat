type Typing = {
  at: number;
  expireAt: number;
  informativeMessage?: string | undefined;
  name: string;
  role: 'bot' | 'user';
};

export type { Typing };
