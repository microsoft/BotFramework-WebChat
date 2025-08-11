import { SendBox as FluentSendBox } from './components/sendBox/index';
import { FluentThemeProvider, testIds } from './index';

(globalThis as any).WebChat = {
  ...(globalThis as any).WebChat,
  FluentThemeProvider,
  FluentSendBox,
  testIds: {
    ...(globalThis as any).WebChat?.testIds,
    ...testIds
  }
};
