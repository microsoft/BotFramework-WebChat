export default async function hideCursor(driver) {
  await driver.executeScript(() => {
    const focusedElement = document.querySelector(':focus');

    focusedElement && focusedElement.blur();
  });
}
