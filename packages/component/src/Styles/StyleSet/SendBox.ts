import { type StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from './types/StyleSet';

function stringifyNumericPixel(value: number | string): string {
  if (typeof value === 'number') {
    return `${value}px`;
  }

  return value;
}

export default function createSendBoxStyle({
  paddingRegular,
  sendBoxBackground,
  sendBoxBorderBottom,
  sendBoxBorderLeft,
  sendBoxBorderRight,
  sendBoxBorderTop,
  sendBoxHeight
}: StrictStyleOptions) {
  return {
    '&.webchat__send-box': {
      '& .webchat__send-box__button--align-bottom': { alignSelf: 'flex-end' },
      '& .webchat__send-box__button--align-stretch': { alignSelf: 'stretch' },
      '& .webchat__send-box__button--align-top': { alignSelf: 'flex-start' },

      '& .webchat__send-box__main': {
        alignItems: 'stretch',
        backgroundColor: sendBoxBackground,
        borderBottom: stringifyNumericPixel(sendBoxBorderBottom),
        borderLeft: stringifyNumericPixel(sendBoxBorderLeft),
        borderRight: stringifyNumericPixel(sendBoxBorderRight),
        borderTop: stringifyNumericPixel(sendBoxBorderTop),
        display: 'grid',
        gridTemplateAreas: '"upload-button text-box send-button"',
        gridTemplateColumns: 'auto 1fr auto',
        gridTemplateRows: 'auto',
        minHeight: stringifyNumericPixel(sendBoxHeight),

        // For unknown reason, if the attachment bar does not exist, the second row is still occupying about 1px, we need to hide it.
        '&:has(.webchat__send-box__attachment-bar)': {
          gridTemplateAreas: '"attachment-bar attachment-bar attachment-bar" "upload-button text-box send-button"',
          gridTemplateRows: 'auto auto'
        }
      },

      '& .webchat__send-box__editable': {
        display: 'flex',
        flexDirection: 'column',
        // eslint-disable-next-line no-magic-numbers
        gap: `${paddingRegular / 2}px`,
        gridArea: 'text-box',
        // eslint-disable-next-line no-magic-numbers
        paddingBottom: `${paddingRegular / 2}px`,
        // eslint-disable-next-line no-magic-numbers
        paddingTop: `${paddingRegular / 2}px`,
        overflowX: 'hidden',
        width: '100%'
      },

      '& .webchat__send-box__attachment-bar': {
        padding: `${paddingRegular}px`,
        paddingBlockEnd: `0px`
      },

      '& .webchat__upload-button': {
        gridArea: 'upload-button'
      },

      '& .webchat__send-button': {
        gridArea: 'send-button'
      }
    }
  } satisfies StyleSet;
}
