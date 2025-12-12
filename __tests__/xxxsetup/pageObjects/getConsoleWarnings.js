import consoleLogFlattener from './consoleLogFlattener';
import getConsoleLogs from './getConsoleLogs';

export default async function getConsoleWarnings(driver) {
  const logs = await getConsoleLogs(driver);
  return logs.reduce(consoleLogFlattener('warn'), []);
}
