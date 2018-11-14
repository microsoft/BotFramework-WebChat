import { HostConfig } from 'adaptivecards';
import defaultStyleSetOptions from './defaultStyleSetOptions';
import { primaryFont } from './Fonts';

// https://docs.microsoft.com/en-us/adaptive-cards/rendering-cards/host-config

export default ({ accent } = defaultStyleSetOptions) => new HostConfig({
  containerStyles: {
    default: {
      foregroundColors: {
        accent: {
          default: accent,
          subtle: accent
        }
      }
    }
  },

  supportsInteractivity: true,
  // spacing: {
  //   default: 8,
  //   extraLarge: 32,
  //   large: 24,
  //   medium: 16,
  //   padding: 8,
  //   small: 4
  // },
  // separator: {
  //   lineThickness: 1,
  //   lineColor: '#cccccc'
  // },
  fontFamily: primaryFont.fontFamily,
  // fontSizes: {
  //   small: 12,
  //   default: 13,
  //   medium: 15,
  //   large: 17,
  //   extraLarge: 19
  // },
  // "fontWeights": {
  //   "lighter": 200,
  //   "default": 400,
  //   "bolder": 700
  // },
  // "containerStyles": {
  //   "default": {
  //     "backgroundColor": "#00000000",
  //     "foregroundColors": {
  //       "default": {
  //         "default": "#000000",
  //         "subtle": "#808c95"
  //       },
  //       "accent": {
  //         "default": "#2e89fc",
  //         "subtle": "#802E8901"
  //       },
  //       "attention": {
  //         "default": "#ffd800",
  //         "subtle": "#CCFFD800"
  //       },
  //       "good": {
  //         "default": "#00ff00",
  //         "subtle": "#CC00FF00"
  //       },
  //       "warning": {
  //         "default": "#ff0000",
  //         "subtle": "#CCFF0000"
  //       }
  //     }
  //   },
  //   "emphasis": {
  //     "backgroundColor": "#08000000",
  //     "foregroundColors": {
  //       "default": {
  //         "default": "#333333",
  //         "subtle": "#EE333333"
  //       },
  //       "accent": {
  //         "default": "#2e89fc",
  //         "subtle": "#882E89FC"
  //       },
  //       "attention": {
  //         "default": "#cc3300",
  //         "subtle": "#DDCC3300"
  //       },
  //       "good": {
  //         "default": "#54a254",
  //         "subtle": "#DD54A254"
  //       },
  //       "warning": {
  //         "default": "#e69500",
  //         "subtle": "#DDE69500"
  //       }
  //     }
  //   }
  // },
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
})
