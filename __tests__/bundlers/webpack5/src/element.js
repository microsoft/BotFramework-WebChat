// Same in every app folder (CI diffs them): Web Chat as a custom element with the Fluent theme, for element.html. The
// element finds React DOM itself: no entry per React version. webpack 4 does not build it: it ignores "exports" in
// package.json, and the element is only there, as an ES module.

import { WebChatElement } from 'botframework-webchat/custom-element.js';
import { FluentThemeProvider } from 'botframework-webchat-fluent-theme';

import createFakeDirectLine from './createFakeDirectLine.js';

customElements.define('webchat-element', WebChatElement);

const element = document.querySelector('webchat-element');

element.themeProvider = FluentThemeProvider;
element.props = { directLine: createFakeDirectLine() };
