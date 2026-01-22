import { CopilotMessageHeader, FluentThemeProvider, PartGroupDecorator, testIds } from './index';
import { SendBox as FluentSendBox } from './components/sendBox/index';

(globalThis as any).WebChat = {
  ...(globalThis as any).WebChat,
  CopilotMessageHeader,
  FluentSendBox,
  FluentThemeProvider,
  PartGroupDecorator,
  testIds: {
    ...(globalThis as any).WebChat?.testIds,
    ...testIds
  }
};
