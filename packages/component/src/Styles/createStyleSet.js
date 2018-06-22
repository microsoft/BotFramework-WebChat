import {
  monospaceSmallFont,
  primaryFont,
  primarySmallFont,
} from '../Styles';

const DEFAULT_OPTIONS = {
  accent: '#6CF',

  bubbleBackground: 'White',
  bubbleImageHeight: 240,
  bubbleMaxWidth: 480, // screen width = 600px
  bubbleMinWidth: 250, // min screen width = 300px, Edge requires 372px (https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/13621468/)

  timestampColor: 'rgba(0, 0, 0, .2)'
};

function createActivitiesStyle() {
  return {
    '& > ul': {
      margin: 0,
      padding: 0
    }
  };
}

function createAvatarStyle() {
  return {
    ...primaryFont,

    alignItems: 'center',
    backgroundColor: 'Black',
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    height: 40,
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    overflow: 'hidden',
    width: 40
  };
}

function createBubbleStyle({
  bubbleBackground
}) {
  return {
    background: bubbleBackground,

    '& > .content': {
      minHeight: 20,
      padding: 10
    }
  };
}

function createCodeCardStyle() {
  return {
    ...monospaceSmallFont,
    margin: 0
  };
}

function createMultipleCardActivityCardStyle() {
  return {
    marginBottom: 10,
    marginRight: 10,
    width: 240
  };
}

function createSingleCardActivityStyle({
  bubbleMaxWidth,
  bubbleMinWidth
}) {
  return {
    paddingBottom: 10,

    '& > .bubble-box': {
      maxWidth: bubbleMaxWidth,
      minWidth: bubbleMinWidth
    },

    '& > .filler': {
      minWidth: 10
    }
  };
}

function createTextCardStyle() {
  return {
    ...primaryFont
  };
}

function createTimestampStyle({
  timestampColor
}) {
  return {
    ...primarySmallFont,

    color: timestampColor,
    paddingTop: 5
  };
}

export default function createStyleSet(options = DEFAULT_OPTIONS) {
  return {
    activities: createActivitiesStyle(options),
    avatar: createAvatarStyle(options),
    bubble: createBubbleStyle(options),
    codeCard: createCodeCardStyle(options),
    multipleCardActivityCard: createMultipleCardActivityCardStyle(options),
    options,
    singleCardActivity: createSingleCardActivityStyle(options),
    textCard: createTextCardStyle(options),
    timestamp: createTimestampStyle(options)
  };
}
