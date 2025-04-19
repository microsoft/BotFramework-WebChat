import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from './types/StyleSet';

export default function createSendBoxAttachmentBarItemStyle(_: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar-item': {
      border: 'solid 1px rgba(0, 0, 0, .25)', // Figma has border-width of 0.96px.
      borderRadius: '8px', // Figma is 7.68px.
      display: 'grid',
      flexShrink: '0',
      gridTemplateAreas: '"body"',
      height: '96px',
      overflow: 'hidden',
      width: '96px'
    },

    '& .webchat__send-box-attachment-bar-item__delete-button': {
      appearance: 'none',
      backgroundColor: 'White', // TODO: Dark theme.
      border: 'solid 1px rgba(0, 0, 0, .25)', // Figma has border-width of 0.96px.
      borderRadius: '4px', // BorderRadiusXS is not defined in Fluent UI, guessing it is 4px.
      fill: '#242424', // TODO: Dark theme.
      gridArea: 'body',
      height: '23px', // Figma is 23.04px.
      justifySelf: 'end',
      margin: '8px', // Figma is 7.68px.
      opacity: '0',
      padding: '0',
      transition: 'opacity 50ms', // Assume ultra-fast.
      width: '23px', // Figma is 23.04px.

      // TODO: Need to center the SVG better.
      alignItems: 'center',
      display: 'grid',
      justifyContent: 'center',

      '&:hover': {
        backgroundColor: '#F5F5F5',
        borderColor: '#C7C7C7'
      },

      '&:active': {
        backgroundColor: '#E0E0E0',
        borderColor: '#C7C7C7'
      },

      '&:disabled, &[aria-diabled]': {
        backgroundColor: '#F0F0F0',
        borderColor: '#E0E0E0',
        fill: '#BDBDBD'
      },

      '&:focus-visible': {
        opacity: '1'
      }
    },

    '&:hover .webchat__send-box-attachment-bar-item__delete-button': {
      opacity: '1'
    },

    '& .webchat__send-box-attachment-bar-item__preview': {
      gridArea: 'body',
      height: '100%',
      objectFit: 'cover',
      width: '100%'
    }
  } satisfies StyleSet;
}
