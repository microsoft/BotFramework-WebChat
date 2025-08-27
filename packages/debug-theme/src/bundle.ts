import * as exports from './index';

(globalThis as any).WebChat = {
  ...(globalThis as any).WebChat,
  ...exports
};
