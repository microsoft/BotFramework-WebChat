import testIds from './testIds';
import CopilotMessageHeader from './components/activity/CopilotMessageHeader';
import PartGroupDecorator from './components/activity/PartGroupingDecorator';
import FluentThemeProvider from './private/FluentThemeProvider';
import { SendBox as FluentSendBox } from './components/sendBox/index';

export { CopilotMessageHeader, FluentSendBox, FluentThemeProvider, PartGroupDecorator, testIds };

// #region Build info
import buildInfo from './buildInfo';

const { object: buildInfoObject, version } = buildInfo;

export { buildInfoObject as buildInfo, version };
// #endregion
