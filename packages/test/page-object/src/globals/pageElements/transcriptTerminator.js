import transcript from './transcript';

export default function transcriptTerminator() {
  return transcript().getElementsByClassName('transcript-focus-area__terminator')[0];
}
