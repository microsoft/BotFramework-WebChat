import transcript from './transcript';

export default function transcriptTerminator() {
  return transcript().getElementsByClassName('webchat__basic-transcript__terminator')[0];
}
