export default async function hideCursor(driver) {
  await driver.executeScript(() => document.querySelector(':focus').blur());
}
