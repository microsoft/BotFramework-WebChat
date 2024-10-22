import { buildInfo as minimalBuildInfo, version } from './exports-minimal';

export * from './exports';

export const buildInfo = Object.freeze({ ...minimalBuildInfo, variant: 'full-es5' });

export const createDirectLine = (options: Omit<Parameters<typeof createDirectLine>[0], 'botAgent'>) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return createDirectLine({ ...options, botAgent: `WebChat/${version} (ES5)` });
};

export const createDirectLineAppServiceExtension = (
  options: Omit<Parameters<typeof createDirectLineAppServiceExtension>[0], 'botAgent'>
) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return createDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${version} (ES5)` });
};
