import { SendBox as FluentSendBox } from './components/sendBox/index';
import FluentThemeProvider from './private/FluentThemeProvider';
import testIds from './testIds';

export { FluentSendBox, FluentThemeProvider, testIds };

// #region Build info
import buildInfo from './buildInfo';

const { readonlyObject, version } = buildInfo;

export { readonlyObject as buildInfo, version };
// #endregion
