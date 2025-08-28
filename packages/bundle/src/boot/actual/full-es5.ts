import defaultCreateDirectLine from '../../createDirectLine';
import defaultCreateDirectLineAppServiceExtension from '../../createDirectLineAppServiceExtension';
import ReactWebChat, { buildInfo as fullBuildInfo } from './full';

const buildInfo = Object.freeze({ ...fullBuildInfo, variant: 'full-es5' });

const createDirectLine = (options: Omit<Parameters<typeof defaultCreateDirectLine>[0], 'botAgent'>) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLine({ ...options, botAgent: `WebChat/${buildInfo.version} (ES5)` });
};

const createDirectLineAppServiceExtension = (
  options: Omit<Parameters<typeof defaultCreateDirectLineAppServiceExtension>[0], 'botAgent'>
) => {
  (options as any).botAgent &&
    console.warn(
      'Web Chat: Developers are not currently allowed to set botAgent. See https://github.com/microsoft/BotFramework-WebChat/issues/2119 for more details.'
    );

  return defaultCreateDirectLineAppServiceExtension({ ...options, botAgent: `WebChat/${buildInfo.version} (ES5)` });
};

// #region Re-exports
export * from './full';
// #endregion

// #region Local exports
export default ReactWebChat;

export { buildInfo, createDirectLine, createDirectLineAppServiceExtension };
// #endregion
