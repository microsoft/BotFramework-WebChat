import CSSTokens from '../CSSTokens';

export default function createVideoAttachmentStyle() {
  return {
    // Same corners as the bubble, which clips the player.
    borderRadius: 'inherit',
    position: 'relative',

    // The browser draws the focus ring of <video> outside of the player, where the bubble clips it. The rest is not visible over a dark video.
    // Draw a two-tone focus indicator on top of the player instead: the ring, and a band in the bubble background color to separate it from the video.
    // The indicator follows the bubble corners. When the bubble has padding and does not clip the player, the player is rounded like the indicator.
    '& > video:focus-visible': {
      borderRadius: 'inherit',
      outline: 0
    },

    '&:has(> video:focus-visible)::after': {
      borderColor: CSSTokens.ColorTranscriptVisualKeyboardIndicator,
      borderRadius: 'inherit',
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
