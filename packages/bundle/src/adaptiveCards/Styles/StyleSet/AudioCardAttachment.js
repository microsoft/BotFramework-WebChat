// Not used for rendering since #5666, no component reads `styleSet.audioCardAttachment`.
// The live styles are in `AudioCardContent.module.css` and `VideoCardContent.module.css` in `../../Attachment/`.

// TODO: [P4] We are moving attachments related to Adaptive Cards out of "component"
//       Later, we will rewrite these attachments without Adaptive Cards
//       We are leaving the CSS here as-is for now

export default function AudioCardAttachment({ paddingRegular = undefined }) {
  return {
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    flexDirection: 'column',

    '& > ul.media-list': {
      // TODO: [P2] We should not set "listStyleType" in styleSet, the user have no good reasons to change this.
      listStyleType: 'none',
      margin: paddingRegular,
      padding: 0
    }
  };
}
