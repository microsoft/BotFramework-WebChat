import executePromiseScript from './executePromiseScript';

export default async function errorSpeechSynthesize(driver, reason) {
  return await executePromiseScript(driver, reason => window.WebSpeechMock.mockErrorSynthesize(reason), reason);
}
