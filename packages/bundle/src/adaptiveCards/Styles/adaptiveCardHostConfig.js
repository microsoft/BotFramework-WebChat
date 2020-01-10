import { defaultStyleOptions } from 'botframework-webchat-component';
// https://docs.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config

export default ({
  accent,
  bubbleTextColor,
  cardEmphasisBackgroundColor,
  primaryFont,
  subtle
} = defaultStyleOptions) => ({
  containerStyles: {
    default: {
      foregroundColors: {
        default: {
          default: bubbleTextColor,
          subtle
        },
        accent: {
          default: accent,
          subtle: accent
        }
      }
    },
    emphasis: {
      backgroundColor: cardEmphasisBackgroundColor,
      foregroundColors: {
        default: {
          default: bubbleTextColor,
          subtle
        }
      }
    },
    accent: {
      backgroundColor: '#C7DEF9',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#EE333333'
        }
      }
    },
    good: {
      backgroundColor: '#CCFFCC',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#EE333333'
        }
      }
    },
    attention: {
      backgroundColor: '#FFC5B2',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#EE333333'
        }
      }
    },
    warning: {
      backgroundColor: '#FFE2B2',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#EE333333'
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
