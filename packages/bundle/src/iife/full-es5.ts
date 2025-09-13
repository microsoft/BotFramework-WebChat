import buildInfo from '../buildInfo';
import createDirectLineAppServiceExtensionWithBotAgent from '../overrides/createDirectLineAppServiceExtensionWithBotAgent';
import createDirectLineWithBotAgent from '../overrides/createDirectLineWithBotAgent';
import './full';
import './polyfill/es5';

// TODO: [P*] This would add "full" first, then replace it with "full-es5".
buildInfo.set('variant', 'full-es5');

window['WebChat'] = Object.freeze({
  ...window['WebChat'],
  createDirectLine: createDirectLineWithBotAgent(`WebChat/${buildInfo.version} (ES5)`),
  createDirectLineAppServiceExtension: createDirectLineAppServiceExtensionWithBotAgent(
    `WebChat/${buildInfo.version} (ES5)`
  )
});
