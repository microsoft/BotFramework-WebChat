import consoleLogFlattener from './consoleLogFlattener';
import getConsoleLogs from './getConsoleLogs';

export default async function getConsoleErrors(driver) {
  const logs = await getConsoleLogs(driver);
  return logs.reduce(consoleLogFlattener('error'), []);
}
