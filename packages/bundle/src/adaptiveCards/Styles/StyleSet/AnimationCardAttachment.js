// TODO: [P4] We are moving attachments related to Adaptive Cards out of "component"
//       Later, we will rewrite these attachments without Adaptive Cards
//       We are leaving the CSS here as-is for now

/**
 * @deprecated Not used for rendering since 4.19.0 (PR #5666), customizing it has no effect.
 * The live styles are in `AnimationCardContent.module.css` and `SignInCardContent.module.css` under `packages/bundle/src/adaptiveCards/Attachment/`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function AnimationCardAttachment() {
  return {
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    flexDirection: 'column',

    '& > ul.media-list': {
      // TODO: [P2] We should not set "listStyleType" in styleSet, the user have no good reasons to change this.
      listStyleType: 'none',
      margin: 0,
      padding: 0
    }
  };
}
