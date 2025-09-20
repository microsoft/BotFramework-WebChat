import buildInfo from '../../../buildInfo';
import defaultCreateDirectLineAppServiceExtension from '../../../createDirectLineAppServiceExtension';
import getBotAgent from './getBotAgent';

export default function createDirectLineAppServiceExtension(
  options: Omit<Parameters<typeof defaultCreateDirectLineAppServiceExtension>[0], 'botAgent'>
) {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: getBotAgent(buildInfo) });
}
