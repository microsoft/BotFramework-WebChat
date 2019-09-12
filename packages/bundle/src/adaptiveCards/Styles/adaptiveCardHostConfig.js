import { defaultStyleOptions } from 'botframework-webchat-component';
// https://docs.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config

export default ({ accent, primaryFont, subtle } = defaultStyleOptions) => ({
  containerStyles: {
    default: {
      backgroundColor: null,
      foregroundColors: {
        default: {
          default: null,
          subtle: subtle
        },
        accent: {
          default: null,
          subtle: accent
        }
      }
    },
    emphasis: {
      backgroundColor: null,
      foregroundColors: {
        default: {
          default: null,
          subtle: subtle
        }
      }
    }
  },
  supportsInteractivity: true,
  fontFamily: primaryFont,
  imageSizes: {
    small: 40,
    medium: 80,
    large: 160
  },
  actions: {
    actionAlignment: 'stretch',
    actionsOrientation: 'vertical',
    buttonSpacing: 8,
    maxActions: 100,
    showCard: {
      actionMode: 'inline',
      inlineTopMargin: 8
    },
    spacing: 'default'
  },
  adaptiveCard: {
    allowCustomStyle: false
  },
  imageSet: {
    imageSize: 'medium',
    maxImageHeight: 100
  },
  factSet: {
    title: {
      color: 'default',
      size: 'default',
      isSubtle: false,
      weight: 'bolder',
      wrap: true,
      maxWidth: 150
    },
    value: {
      color: 'default',
      size: 'default',
      isSubtle: false,
      weight: 'default',
      wrap: true
    },
    spacing: 8
  }
});
