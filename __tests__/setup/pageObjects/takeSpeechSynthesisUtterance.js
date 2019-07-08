import executePromiseScript from './executePromiseScript';

export default async function takeSpeechSynthesisUtterance(driver) {
  return await executePromiseScript(driver, () => window.WebSpeechMock.mockSynthesize());
}
