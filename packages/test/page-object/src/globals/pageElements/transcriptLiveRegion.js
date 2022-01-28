import getTranscript from './transcript';

export default function transcriptLiveRegion() {
  return getTranscript().querySelector('[aria-roledescription="chat history"][role="log"]');
}
