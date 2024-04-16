import { injectMetaTag } from 'inject-meta-tag';

import FluentThemeProvider from './private/FluentThemeProvider';
import testIds from './testIds';
import { injectStyle } from './styles';

declare const NPM_PACKAGE_VERSION: string;

injectMetaTag('botframework-webchat-fluent-theme:version', NPM_PACKAGE_VERSION);

injectStyle();

export { FluentThemeProvider, testIds };
