import {
  monospaceSmallFont,
  primaryFont,
  primarySmallFont,
} from '../Styles';

const DEFAULT_OPTIONS = {
  accent: '#6CF',

  bubbleBackground: 'White',
  bubbleImageHeight: 240,
  bubbleMaxWidth: 480,
  bubbleMinWidth: 240,

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

function createActivityStyle() {
  return {
    paddingBottom: 10
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
  bubbleBackground,
  bubbleImageHeight,
  bubbleMaxWidth,
  bubbleMinWidth
}) {
  return {
    maxWidth: bubbleMaxWidth,
    minWidth: bubbleMinWidth,

    '& > .header-image': {
      backgroundPosition: '50%',
      backgroundRepeat: 'no-repeat',
      backgroundSize: 'cover',
      height: bubbleImageHeight,
      width: '100%'
    },

    '& > .content': {
      background: bubbleBackground,
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
    activity: createActivityStyle(options),
    avatar: createAvatarStyle(options),
    bubble: createBubbleStyle(options),
    codeCard: createCodeCardStyle(options),
    timestamp: createTimestampStyle(options),
    textCard: createTextCardStyle(options)
  };
}
