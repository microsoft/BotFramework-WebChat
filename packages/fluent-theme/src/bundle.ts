import { FluentThemeProvider, testIds } from './index';

(globalThis as any).WebChat = {
  ...(globalThis as any).WebChat,
  FluentThemeProvider,
  testIds: {
    ...(globalThis as any).WebChat?.testIds,
    ...testIds
  }
};
