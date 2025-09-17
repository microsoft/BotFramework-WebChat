import defaultCreateDirectLine from '../package-preset/createDirectLine';

export default function createDirectLineWithBotAgent(botAgent: string) {
  return (options: Omit<Parameters<typeof defaultCreateDirectLine>[0], 'botAgent'>) => {
    (options as any).botAgent &&
      console.warn(
        'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
      );

    return defaultCreateDirectLine({ ...options, botAgent });
  };
}
