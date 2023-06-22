const customAdaptiveCardsHostConfig = {
  containerStyles: {
    default: {
      foregroundColors: {
        default: {
          default: 'White',
          subtle: 'White'
        },
        accent: {
          default: '#0063B1',
          subtle: '#0078D4'
        },
        attention: {
          default: '#D13438',
          subtle: '#A4262C'
        },
        dark: {
          default: '#000000',
          subtle: '#646464'
        },
        good: {
          default: '#0B6A0B',
          subtle: '#028A02'
        },
        light: {
          default: '#FFFFFF',
          subtle: 'White'
        },
        warning: {
          default: '#B75C00',
          subtle: '#986F0B'
        }
      }
    },
    emphasis: {
      backgroundColor: '#F0F0F0',
      foregroundColors: {
        default: {
          default: '#000000',
          subtle: '#484644'
        }
      }
    },
    accent: {
      backgroundColor: '#C7DEF9',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#484644'
        }
      }
    },
    good: {
      backgroundColor: '#CCFFCC',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#484644'
        }
      }
    },
    attention: {
      backgroundColor: '#FFC5B2',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#484644'
        }
      }
    },
    warning: {
      backgroundColor: '#FFE2B2',
      foregroundColors: {
        default: {
          default: '#333333',
          subtle: '#484644'
        }
      }
    }
  },
  supportsInteractivity: true,
  fontFamily: "Calibri, 'Helvetica Neue', Arial, sans-serif",
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
  },
  textBlock: {
    headingLevel: 2
  }
};

export default customAdaptiveCardsHostConfig;
