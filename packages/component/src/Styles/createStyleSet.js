import {
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
      height: bubbleImageHeight
    },

    '& > .content': {
      background: bubbleBackground
    }
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
    avatar: createAvatarStyle(),
    bubble: createBubbleStyle(options),
    timestamp: createTimestampStyle(options)
  };
}
