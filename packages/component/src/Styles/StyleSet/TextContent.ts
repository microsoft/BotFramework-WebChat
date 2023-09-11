/* eslint no-magic-numbers: "off" */

export default function createTextContentStyle() {
  return {
    '&.webchat__text-content': {
      fontFamily: 'var(--webchat__font--primary)',
      margin: 0,
      minHeight: 'calc(var(--webchat__min-height--bubble) - var(--webchat__padding--regular) * 2)',
      padding: 'var(--webchat__padding--regular)',

      '&.webchat__text-content--is-markdown': {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--webchat__padding--regular)'
      },

      '& .webchat__text-content__markdown > :first-child': {
        marginTop: 0
      },

      '& .webchat__text-content__markdown > :last-child': {
        marginBottom: 0
      },

      '& .webchat__text-content__markdown img:not(.webchat__render-markdown__external-link-icon)': {
        maxWidth: 'var(--webchat__max-width--bubble)',
        width: '100%'
      },

      '& .webchat__text-content__markdown pre': {
        overflow: 'hidden'
      },

      '& .webchat__text-content__open-in-new-window-icon': {
        height: '.75em'
      }
    }
  };
}
