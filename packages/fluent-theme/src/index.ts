import { injectMetaTag } from 'inject-meta-tag';

import FluentThemeProvider from './private/FluentThemeProvider';
import { injectStyle } from './styles';
import testIds from './testIds';

injectMetaTag('botframework-webchat-fluent-theme:version', process.env['npm_package_version']);
injectMetaTag(
  'botframework-webchat-fluent-theme',
  `version=${process.env['npm_package_version']}; format=${process.env['module_format']}; transpiler=${process.env['transpiler']}`
);

injectStyle();

export { FluentThemeProvider, testIds };
