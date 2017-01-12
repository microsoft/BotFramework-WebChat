export { App, AppProps } from './App';
export { Chat, ChatProps, FormatOptions } from './Chat';
export { DirectLineOptions, DirectLine } from './directLine';
export { IBotConnection } from './BotConnection';
// below are shims for compatibility with old browsers (IE 10 being the main culprit)
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.find-index';
