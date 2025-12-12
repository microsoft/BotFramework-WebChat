import executePromiseScript from './executePromiseScript';

export default async function endSpeechSynthesize(driver) {
  return await executePromiseScript(driver, () => window.WebSpeechMock.mockEndSynthesize());
}
