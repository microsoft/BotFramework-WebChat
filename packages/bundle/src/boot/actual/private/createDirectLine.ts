import buildInfo from '../../../buildInfo';
import defaultCreateDirectLine from '../../../createDirectLine';
import getBotAgent from './getBotAgent';

export default function createDirectLine(options: Omit<Parameters<typeof defaultCreateDirectLine>[0], 'botAgent'>) {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  // TODO: Put the "botAgent" string in "define" could simplify code here..
  return defaultCreateDirectLine({ ...options, botAgent: getBotAgent(buildInfo) });
}
