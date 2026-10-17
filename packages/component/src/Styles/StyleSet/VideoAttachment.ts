import CSSTokens from '../CSSTokens';

export default function createVideoAttachmentStyle() {
  return {
    position: 'relative',

    // The browser draws the focus ring of <video> outside of the player, where the bubble clips it. The rest is not visible over a dark video.
    // Draw a two-tone focus indicator on top of the player instead: the ring, and a band in the bubble background color to separate it from the video.
    '& > video:focus-visible': {
      outline: 0
    },

    '&:has(> video:focus-visible)::after': {
      borderColor: CSSTokens.ColorTranscriptVisualKeyboardIndicator,
      borderStyle: CSSTokens.BorderStyleTranscriptVisualKeyboardIndicator,
      borderWidth: CSSTokens.BorderWidthTranscriptVisualKeyboardIndicator,
      boxShadow: `inset 0 0 0 2px ${CSSTokens.BackgroundBubble}`,
      content: '""',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute'
    }
  };
}
