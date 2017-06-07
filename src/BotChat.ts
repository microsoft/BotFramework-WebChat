export { App, AppProps } from './App';
export { Chat, ChatProps, FormatOptions } from './Chat';
export * from 'botframework-directlinejs';
export { queryParams } from './Attachment';
export { BrowserSpeechRecognizer, BrowserSpeechSynthesizer } from './Speech/BrowserSpeech'
export { SpeechOptions } from './Speech/SpeechOptions'
export { ISpeechRecognizer, ISpeechSynthesizer } from './Speech/SpeechInterface'
// below are shims for compatibility with old browsers (IE 10 being the main culprit)
import 'core-js/modules/es6.string.starts-with';
import 'core-js/modules/es6.array.find';
import 'core-js/modules/es6.array.find-index';
