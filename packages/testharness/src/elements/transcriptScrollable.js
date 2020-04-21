import getTranscriptElement from './transcript';

export default function transcriptScrollable() {
  return getTranscriptElement().querySelector('*');
}
