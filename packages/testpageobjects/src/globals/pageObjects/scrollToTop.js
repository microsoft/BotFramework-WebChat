import transcriptScrollable from '../pageElements/transcriptScrollable';

export default function scrollToTop(offset = 0) {
  transcriptScrollable().scrollTop = offset;
}
