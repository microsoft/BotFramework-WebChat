export default function () {
  return {
    '&.webchat__thumb-button': {
      appearance: 'none',
      background: 'Transparent',
      border: 0,
      borderRadius: 2,
      height: 16,
      lineHeight: 0,
      /* The Fluent icon is larger than the button. We need to clip it.
      Without clipping, hover effect will appear on the edge of the button but not possible to click. */
      overflow: 'hidden',
      padding: 0,
      width: 16,

      '&:active': {
        background: 'var(--pva__palette__neutral-light)'
      },

      '&:focus-visible': {
        /* TODO: Verify with designer. This was #767676 (Gray ~120), this is now #8A8886 (Gray 110). */

        outline: 'solid 1px var(--pva__palette__neutral-secondary-alt)'
      },

      '& .webchat__thumb-button__image': {
        /* TODO: Remove "color" if we want a different hover color. */
        color: 'var(--pva__semantic-colors__link)',
        width: 14
      },

      '&:hover .webchat__thumb-button__image:not(.webchat__thumb-button__image--is-filled)': {
        display: 'none'
      },

      '&.webchat__thumb-button--is-pressed .webchat__thumb-button__image:not(.webchat__thumb-button__image--is-filled)':
        {
          display: 'none'
        },

      '&.webchat__thumb-button:not(:hover):not(.webchat__thumb-button--is-pressed) .webchat__thumb-button__image--is-filled':
        {
          display: 'none'
        }
    }
  };
}

// .webchat__thumb-button {
//   appearance: none;
//   background: Transparent;
//   border: 0;
//   border-radius: 2px;
//   height: 16px;
//   line-height: 0;
//   /* The Fluent icon is larger than the button. We need to clip it.
//   Without clipping, hover effect will appear on the edge of the button but not possible to click. */
//   overflow: hidden;
//   padding: 0;
//   width: 16px;
// }

// .webchat__thumb-button:active {
//   background: var(--pva__palette__neutral-light);
// }

// .webchat__thumb-button:focus-visible {
//   /* TODO: Verify with designer. This was #767676 (Gray ~120), this is now #8A8886 (Gray 110). */

//   outline: solid 1px var(--pva__palette__neutral-secondary-alt);
// }

// .webchat__thumb-button__image {
//   /* TODO: Remove "color" if we want a different hover color. */
//   color: var(--pva__semantic-colors__link);
//   width: 14px;
// }

// .webchat__thumb-button:hover
//   .webchat__thumb-button__image:not(.webchat__thumb-button__image--is-filled) {
//   display: none;
// }

// .webchat__thumb-button--is-pressed
//   .webchat__thumb-button__image:not(.webchat__thumb-button__image--is-filled) {
//   display: none;
// }

// .webchat__thumb-button:not(:hover):not(.webchat__thumb-button--is-pressed)
//   .webchat__thumb-button__image--is-filled {
//   display: none;
// }
