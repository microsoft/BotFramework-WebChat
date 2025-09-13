import { createDirectLineAppServiceExtension as defaultCreateDirectLineAppServiceExtension } from '@msinternal/botframework-webchat-preset';

export default function createDirectLineAppServiceExtensionWithBotAgent(botAgent: string) {
  return (options: Omit<Parameters<typeof defaultCreateDirectLineAppServiceExtension>[0], 'botAgent'>) => {
    (options as any).botAgent &&
      console.warn(
        'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
      );

    return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent });
  };
}
