import getTranscript from './getTranscript';

export default async function getScrollToBottomButton(driver) {
  const transcript = await getTranscript(driver);

  return await transcript.findElement('button:last-child');
}
