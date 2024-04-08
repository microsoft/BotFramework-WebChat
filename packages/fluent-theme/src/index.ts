import { injectMetaTag } from 'inject-meta-tag';

import FluentThemeProvider from './private/FluentThemeProvider';

declare const NPM_PACKAGE_VERSION: string;

injectMetaTag('botframework-webchat-fluent-theme:version', NPM_PACKAGE_VERSION);

export { FluentThemeProvider };
