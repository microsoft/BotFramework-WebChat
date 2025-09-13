import buildInfo from '../buildInfo';
import { ReactWebChat } from '../full';
import createDirectLineAppServiceExtensionWithBotAgent from '../overrides/createDirectLineAppServiceExtensionWithBotAgent';
import createDirectLineWithBotAgent from '../overrides/createDirectLineWithBotAgent';

buildInfo.set('variant', 'full');

const createDirectLine = createDirectLineWithBotAgent(`WebChat/${buildInfo.version} (Full)`);
const createDirectLineAppServiceExtension = createDirectLineAppServiceExtensionWithBotAgent(
  `WebChat/${buildInfo.version} (Full)`
);

export * from '../full';
export { buildInfo, createDirectLine, createDirectLineAppServiceExtension };
export default ReactWebChat;
