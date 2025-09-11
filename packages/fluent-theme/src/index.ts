import { SendBox as FluentSendBox } from './components/sendBox/index';
import FluentThemeProvider from './private/FluentThemeProvider';
import testIds from './testIds';

export { FluentSendBox, FluentThemeProvider, testIds };

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
