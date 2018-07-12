import {
  monospaceSmallFont,
  primaryFont,
  primarySmallFont,
} from './Fonts';

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
    margin: 0,
    padding: 0
  };
}

function createActivityStyle() {
  return {
    marginBottom: 10,

    '&:first-child': {
      marginTop: 10
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

function createMicrophoneStyle() {
  return {
    backgroundColor: 'Transparent',
    border: 0,
    cursor: 'pointer',
    padding: 0,
    width: 40,

    '&:disabled > svg': {
      fill: '#CCC'
    }
  };
}

function createMultipleCardActivityCardStyle() {
  return {
    marginRight: 10,
    width: 240
  };
}

function createSendBoxStyle() {
  return  {
    ...primaryFont,

    alignItems: 'center',

    '& > input': {
      border: 0,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%'
    },

    '& > .dictation, & > .status, & > input': {
      flex: 1,
      paddingBottom: 0,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 0
    },

    '& > .dictation > span:last-child': {
      opacity: .5
    },

    '& > button': {
      backgroundColor: 'Transparent',
      border: 0,
      cursor: 'pointer',
      height: '100%',
      padding: 0,
      width: 40
    }
  };
}

function createSingleCardActivityStyle({
  bubbleMaxWidth,
  bubbleMinWidth
}) {
  return {
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

function createUploadButtonStyle() {
  return {
    width: 40
  };
}

export default function createStyleSet(options = DEFAULT_OPTIONS) {
  return {
    activity: createActivityStyle(options),
    activities: createActivitiesStyle(options),
    avatar: createAvatarStyle(options),
    bubble: createBubbleStyle(options),
    codeCard: createCodeCardStyle(options),
    microphone: createMicrophoneStyle(options),
    multipleCardActivityCard: createMultipleCardActivityCardStyle(options),
    options,
    sendBox: createSendBoxStyle(options),
    singleCardActivity: createSingleCardActivityStyle(options),
    textCard: createTextCardStyle(options),
    timestamp: createTimestampStyle(options),
    uploadButton: createUploadButtonStyle(options)
  };
}
