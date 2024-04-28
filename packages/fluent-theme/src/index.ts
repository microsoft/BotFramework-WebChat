import { injectMetaTag } from 'inject-meta-tag';

import FluentThemeProvider from './private/FluentThemeProvider';
import testIds from './testIds';
import { injectStyle } from './styles';

injectMetaTag('botframework-webchat-fluent-theme:version', process.env['npm_package_version']);

injectStyle();

export { FluentThemeProvider, testIds };
