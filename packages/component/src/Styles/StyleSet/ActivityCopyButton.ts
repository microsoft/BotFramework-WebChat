/**
 * @deprecated Not used for rendering since 4.19.0 (PR #5670), customizing it has no effect.
 * The live styles are in `packages/component/src/Attachment/Text/private/ActivityCopyButton.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createActivityButtonStyle() {
  return {
    '&.webchat__activity-copy-button': {
      overflow: ['clip', 'hidden'],
      position: 'relative',

      '& .webchat__activity-copy-button__copied-text': {
        alignItems: 'center',
        backgroundColor: '#fff',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        position: 'absolute',
        visibility: 'hidden',
        width: '100%'
      },

      '&.webchat__activity-copy-button--copied': {
        '.webchat__activity-copy-button__copied-text': {
          animation: 'webchat__activity-copy-button__copied-animation 0.7s linear'
        },

        '.webchat__activity-button__icon, .webchat__activity-button__text': {
          visibility: 'hidden'
        }
      },

      '@keyframes webchat__activity-copy-button__copied-animation': {
        '0%': {
          // This is set during the animation only hence shouldn't spill when hidden from the above tree
          visibility: 'visible'
        },

        '100%': {
          visibility: 'unset'
        }
      }
    }
  };
}
