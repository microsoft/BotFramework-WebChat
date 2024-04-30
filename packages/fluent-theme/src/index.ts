import { injectMetaTag } from 'inject-meta-tag';

import FluentThemeProvider from './private/FluentThemeProvider';
import { injectStyle } from './styles';
import testIds from './testIds';

const buildTool = process.env['build_tool'];
const moduleFormat = process.env['module_format'];
const version = process.env['npm_package_version'];

const buildInfo = { buildTool, moduleFormat, version };

injectMetaTag(
  'botframework-webchat:fluent-theme',
  `version=${process.env['npm_package_version']}; build-tool=${process.env['build_tool']}; module-format=${process.env['module_format']}`
);

injectStyle();

export { FluentThemeProvider, buildInfo, testIds };
