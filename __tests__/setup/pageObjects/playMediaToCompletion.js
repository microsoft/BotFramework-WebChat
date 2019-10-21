import executePromiseScript from './executePromiseScript';

export default async function pingBot(driver, mediaElement) {
  await executePromiseScript(
    driver,
    mediaElement =>
      new Promise(resolve => {
        mediaElement.loop = false;
        mediaElement.play();
        mediaElement.onended = resolve;
      }),
    mediaElement
  );
}
