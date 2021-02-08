/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function createBasicTranscriptStyleSet({
  activeActivityOutlineColor,
  paddingRegular,
  primaryFont,
  transcriptTerminatorBackgroundColor,
  transcriptTerminatorColor,
  transcriptTerminatorFontSize
}) {
  return {
    '&.webchat__basic-transcript': {
      '&:focus': {
        outline: 0,

        '& .webchat__basic-transcript__activity-indicator.webchat__basic-transcript__activity-indicator--active': {
          borderColor: activeActivityOutlineColor,
          borderStyle: 'dashed',
          borderWidth: 1,
          boxSizing: 'border-box',
          left: 0,
          margin: paddingRegular / 2,
          pointerEvents: 'none',
          position: 'absolute',
          width: `calc(100% - ${paddingRegular}px)`,

          '&.webchat__basic-transcript__activity-indicator--first': {
            height: `calc(100% - ${paddingRegular}px)`,
            top: 0
          },

          '&:not(.webchat__basic-transcript__activity-indicator--first)': {
            height: '100%',
            top: -paddingRegular
          }
        }
      },

      '&:focus .webchat__basic-transcript__focus-indicator, .webchat__basic-transcript__terminator:focus + .webchat__basic-transcript__focus-indicator': {
        height: '100%',
        outlineColor: 'black',
        outlineOffset: -2,
        outlineStyle: 'solid',
        outlineWidth: 2,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        width: '100%'
      },

      '& .webchat__basic-transcript__activity': {
        paddingBottom: paddingRegular,
        position: 'relative',

        '&:first-child': {
          paddingTop: paddingRegular
        }
      },

      '& .webchat__basic-transcript__terminator': {
        bottom: 0,
        height: 0,
        outline: 0,
        position: 'relative',
        width: '100%'
      },

      '& .webchat__basic-transcript__terminator-body': {
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%'
      },

      '& .webchat__basic-transcript__terminator:not(:focus) .webchat__basic-transcript__terminator-body': {
        display: 'none'
      },

      '& .webchat__basic-transcript__terminator-text': {
        backgroundColor: transcriptTerminatorBackgroundColor,
        borderRadius: 5,
        color: transcriptTerminatorColor,
        fontFamily: primaryFont,
        fontSize: transcriptTerminatorFontSize,
        margin: paddingRegular / 2,
        padding: paddingRegular / 2
      }
    }
  };
}
