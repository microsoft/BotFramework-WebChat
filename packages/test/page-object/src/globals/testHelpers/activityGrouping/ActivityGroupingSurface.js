import PropTypes from 'prop-types';

import ActivityGroupingContext from './ActivityGroupingContext';
import createDirectLineWithTranscript from '../createDirectLineWithTranscript';

// Use React from window (UMD) instead of import.
const { React: { useEffect, useMemo, useState } = {} } = window;

// When modifying this list, make sure both side of this list does not contains
// forbidden property names, e.g. `__proto__`, `constructor`, or `prototype`.
const URL_QUERY_MAPPING = {
  bi: 'botAvatarInitials',
  bn: 'botNub',
  bt: 'botOnTop',
  g: 'showAvatarInGroup',
  l: 'attachmentLayout',
  rtl: 'rtl',
  t: 'transcriptName',
  ui: 'userAvatarInitials',
  un: 'userNub',
  ut: 'userOnTop',
  w: 'wide',
  wd: 'hide'
};

function createCustomActivityMiddleware(attachmentLayout) {
  return () =>
    next =>
    (arg0, ...args) =>
      next(
        {
          ...arg0,
          activity: {
            ...arg0.activity,
            ...(attachmentLayout && arg0.activity.from.role === 'bot' ? { attachmentLayout } : {})
          }
        },
        ...args
      );
}

function generateURL(state) {
  const params = {};

  Object.entries(URL_QUERY_MAPPING).forEach(([short, long]) => {
    // Both "long" and "short" should not contains forbidden property names.
    // eslint-disable-next-line security/detect-object-injection
    const value = state[long];

    // Do not set "wd=0" for easier copy and paste.
    if (short === 'wd' && !value) {
      return;
    }

    if (typeof value !== 'undefined') {
      // Both "long" and "short" should not contains forbidden property names.
      // eslint-disable-next-line security/detect-object-injection
      params[short] = value === true ? '1' : value === false ? '0' : value + '';
    }
  });

  return '#' + new URLSearchParams(params).toString();
}

const DEFAULT_STATE = {
  attachmentLayout: false,
  botAvatarInitials: true,
  botNub: true,
  botOnTop: true,
  hide: false,
  rtl: false,
  showAvatarInGroup: 'status',
  transcriptName: 'simple-messages.json',
  userAvatarInitials: true,
  userNub: true,
  userOnTop: true,
  wide: false
};

function getInitialState(defaultValues = {}) {
  const initialState = {};
  const params = new URLSearchParams(location.hash.replace(/^#/u, ''));

  Object.entries(URL_QUERY_MAPPING).forEach(([short, long]) => {
    const value = params.get(short);

    if (typeof value === 'undefined') {
      // Both "long" and "short" should not contains forbidden property names.
      // eslint-disable-next-line security/detect-object-injection
      initialState[long] = defaultValues[long];
    } else if (value === '1') {
      // Both "long" and "short" should not contains forbidden property names.
      // eslint-disable-next-line security/detect-object-injection
      initialState[long] = true;
    } else if (value === '0') {
      // Both "long" and "short" should not contains forbidden property names.
      // eslint-disable-next-line security/detect-object-injection
      initialState[long] = false;
    } else {
      // Both "long" and "short" should not contains forbidden property names.
      // eslint-disable-next-line security/detect-object-injection
      initialState[long] = value;
    }
  });

  return initialState;
}

const ActivityGroupingSurface = ({ children }) => {
  const [transcriptNames, setTranscriptNames] = useState([]);
  const initialState = useMemo(() => getInitialState(DEFAULT_STATE), []);

  const [attachmentLayout, setAttachmentLayout] = useState(initialState.attachmentLayout);
  const [botAvatarInitials, setBotAvatarInitials] = useState(initialState.botAvatarInitials);
  const [botNub, setBotNub] = useState(initialState.botNub);
  const [botOnTop, setBotOnTop] = useState(initialState.botOnTop);
  const [directLine, setDirectLine] = useState();
  const [rtl, setRTL] = useState(initialState.rtl);
  const [showAvatarInGroup, setShowAvatarInGroup] = useState(initialState.showAvatarInGroup);
  const [transcriptName, setTranscriptName] = useState(initialState.transcriptName);
  const [userAvatarInitials, setUserAvatarInitials] = useState(initialState.userAvatarInitials);
  const [userNub, setUserNub] = useState(initialState.userNub);
  const [userOnTop, setUserOnTop] = useState(initialState.userOnTop);
  const [wide, setWide] = useState(initialState.wide);
  const { hide } = initialState;

  useEffect(() => {
    (async function () {
      const res = await fetch('/assets/transcripts/index.json');

      if (!res.ok) {
        throw new Error('Failed to fetch /assets/transcripts/index.json');
      }

      const { transcriptNames } = await res.json();

      setTranscriptNames(transcriptNames);
    })();
  }, [setTranscriptNames]);

  useEffect(() => {
    let aborted;
    let directLine;

    (async function () {
      directLine = await createDirectLineWithTranscript(transcriptName);

      aborted || setDirectLine(directLine);
    })();

    return () => {
      aborted = true;
      directLine && directLine.end();
    };
  }, [setDirectLine, transcriptName]);

  const activityMiddleware = useMemo(
    () =>
      attachmentLayout === 'carousel' || attachmentLayout === 'stacked'
        ? createCustomActivityMiddleware(attachmentLayout)
        : undefined,
    [attachmentLayout]
  );

  const styleOptions = useMemo(
    () => ({
      bubbleBackground: '#0063B1',
      bubbleBorderColor: '#0063B1',
      bubbleBorderRadius: 4,
      bubbleFromUserBackground: '#0063B1',
      bubbleFromUserBorderColor: '#0063B1',
      bubbleFromUserBorderRadius: 4,
      bubbleFromUserTextColor: 'White',
      bubbleTextColor: 'White',

      botAvatarInitials: botAvatarInitials ? 'WC' : undefined,
      bubbleFromUserNubOffset: userOnTop ? 0 : undefined,
      bubbleFromUserNubSize: userNub ? 10 : undefined,
      bubbleNubOffset: botOnTop ? 0 : undefined,
      bubbleNubSize: botNub ? 10 : undefined,
      userAvatarInitials: userAvatarInitials ? 'WW' : undefined,

      groupTimestamp: 5000,
      showAvatarInGroup,
      transitionDuration: '.3s'
    }),
    [botAvatarInitials, botNub, botOnTop, showAvatarInGroup, userAvatarInitials, userNub, userOnTop]
  );

  const contextState = useMemo(
    () => ({
      attachmentLayout,
      botAvatarInitials,
      botNub,
      botOnTop,
      hide,
      rtl,
      showAvatarInGroup,
      transcriptName,
      userAvatarInitials,
      userNub,
      userOnTop,
      wide
    }),
    [
      attachmentLayout,
      botAvatarInitials,
      botNub,
      botOnTop,
      hide,
      rtl,
      showAvatarInGroup,
      transcriptName,
      userAvatarInitials,
      userNub,
      userOnTop,
      wide
    ]
  );

  const url = useMemo(() => generateURL(contextState), [contextState]);

  const context = useMemo(
    () => ({
      ...contextState,
      activityMiddleware,
      directLine,
      setAttachmentLayout,
      setBotAvatarInitials,
      setBotNub,
      setBotOnTop,
      setRTL,
      setShowAvatarInGroup,
      setTranscriptName,
      setUserAvatarInitials,
      setUserNub,
      setUserOnTop,
      setWide,
      showAvatarInGroup,
      styleOptions,
      transcriptNames,
      url
    }),
    [
      activityMiddleware,
      contextState,
      directLine,
      setAttachmentLayout,
      setBotAvatarInitials,
      setBotNub,
      setBotOnTop,
      setRTL,
      setShowAvatarInGroup,
      setTranscriptName,
      setUserAvatarInitials,
      setUserNub,
      setUserOnTop,
      setWide,
      showAvatarInGroup,
      styleOptions,
      transcriptNames,
      url
    ]
  );

  return <ActivityGroupingContext.Provider value={context}>{children}</ActivityGroupingContext.Provider>;
};

ActivityGroupingSurface.defaultProps = {
  children: undefined
};

ActivityGroupingSurface.propTypes = {
  children: PropTypes.any
};

export default ActivityGroupingSurface;
