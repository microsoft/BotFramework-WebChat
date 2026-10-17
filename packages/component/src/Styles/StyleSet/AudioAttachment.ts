import CSSTokens from '../CSSTokens';

export default function AudioAttachment() {
  return {
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    minHeight: CSSTokens.SizeAvatar,
    position: 'relative',

    // The browser draws the focus ring of <audio> outside of the player, where the bubble clips it, and under the player controls.
    // Draw the focus indicator on top of the player instead, in the same pill shape as the player (Chromium uses `border-radius: 100px`).
    '& > audio:focus-visible': {
      outline: 0
    },

    '&:has(> audio:focus-visible)::after': {
      borderColor: CSSTokens.ColorTranscriptVisualKeyboardIndicator,
      borderRadius: '100px',
      borderStyle: CSSTokens.BorderStyleTranscriptVisualKeyboardIndicator,
      borderWidth: CSSTokens.BorderWidthTranscriptVisualKeyboardIndicator,
      content: '""',
      inset: 0,
      pointerEvents: 'none',
      position: 'absolute'
    }
  };
}
