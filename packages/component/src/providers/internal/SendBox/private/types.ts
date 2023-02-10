export type ContextType = {
  submit: (options?: { setFocus?: 'sendBox' | 'sendBoxWithoutKeyboard' }) => void;
  submitErrorMessageIdState: readonly [string];
};

export type SendError = 'empty' | 'offline';
