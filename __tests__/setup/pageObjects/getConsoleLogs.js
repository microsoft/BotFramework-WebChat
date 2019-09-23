export default async function getConsoleLogs(driver) {
  return await driver.executeScript(() => window.__console__);
}
