import { buildInfo as minimalBuildInfo, version } from './exports-minimal';
import defaultCreateDirectLine from '../createDirectLine';
import defaultCreateDirectLineAppServiceExtension from '../createDirectLineAppServiceExtension';

export * from './exports';

export const buildInfo = Object.freeze({ ...minimalBuildInfo, variant: 'full-es5' });

export const createDirectLine = (options: Omit<Parameters<typeof createDirectLine>[0], 'botAgent'>) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${version} (ES5)` });
};

export const createDirectLineAppServiceExtension = options => {
  options.botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent in the createDirectLine function. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (ES5)` });
};
