type Typing = {
  at: number;
  expireAt: number;
  name: string;
  role: 'bot' | 'user';
  tag: string;
};

export default Typing;
