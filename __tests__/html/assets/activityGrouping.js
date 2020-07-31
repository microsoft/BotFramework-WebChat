const {
  React: { createContext, useCallback, useEffect, useMemo, useState },
  WebChatTest: { parseURLParams }
} = window;

const ActivityGroupingContext = createContext();

function createCustomActivityMiddleware(attachmentLayout) {
  return () => next => (arg0, ...args) =>
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

function generateURL(state) {
  const params = {};

  Object.entries(URL_QUERY_MAPPING).forEach(([short, long]) => {
    const value = state[long];

    // Do not set "wd=0" for easier copy and paste.
    if (short === 'wd' && !value) {
      return;
    }

    if (typeof value !== 'undefined') {
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
  const params = parseURLParams(location.hash);

  Object.entries(URL_QUERY_MAPPING).forEach(([short, long]) => {
    const value = params[short];

    if (typeof value === 'undefined') {
      initialState[long] = defaultValues[long];
    } else if (value === '1') {
      initialState[long] = true;
    } else if (value === '0') {
      initialState[long] = false;
    } else {
      initialState[long] = value;
    }
  });

  return initialState;
}

const ActivityGroupingBadges = () => {
  const {
    attachmentLayout,
    botAvatarInitials,
    botNub,
    botOnTop,
    rtl,
    showAvatarInGroup,
    transcriptName,
    userAvatarInitials,
    userNub,
    userOnTop,
    wide
  } = useContext(window.WebChatTest.ActivityGroupingContext);

  const badges = useMemo(() => {
    const badges = [];

    if (attachmentLayout === 'stacked') {
      badges.push('layout:stacked');
    } else if (attachmentLayout === 'carousel') {
      badges.push('layout:carousel');
    }

    botAvatarInitials && badges.push('bot:initials');
    botNub && badges.push('bot:nub');
    botOnTop && badges.push('bot:on-top');
    rtl && badges.push('view:rtl');

    if (showAvatarInGroup === 'sender') {
      badges.push('avatar-group:sender');
    } else if (showAvatarInGroup === true) {
      badges.push('avatar-group:every');
    }

    badges.push(`transcript:${transcriptName}`);

    userAvatarInitials && badges.push('user:initials');
    userNub && badges.push('user:nub');
    userOnTop && badges.push('user:on-top');

    wide && badges.push('view:wide');

    return badges.sort();
  }, [
    attachmentLayout,
    botAvatarInitials,
    botNub,
    botOnTop,
    rtl,
    showAvatarInGroup,
    transcriptName,
    userAvatarInitials,
    userNub,
    userOnTop,
    wide
  ]);

  return (
    <div className="badges" dir="ltr">
      {badges.map(badge => (
        <React.Fragment key={badge}>
          <nobr className="badges__badge">{badge}</nobr>
          {/* Using zero-width space to break separate <nobr> into another line if needed. */}
          {'\u200B'}
        </React.Fragment>
      ))}
    </div>
  );
};

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
    (async function() {
      const res = await fetch('./assets/transcripts/index.json');

      if (!res.ok) {
        throw new Error('Failed to fetch ./assets/transcripts/index.json');
      }

      const { transcriptNames } = await res.json();

      setTranscriptNames(transcriptNames);
    })();
  }, [setTranscriptNames]);

  useEffect(() => {
    let aborted;
    let directLine;

    (async function() {
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
      {
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
      }
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

function comboNumberSetter(value, setters) {
  setters.forEach((setter, index) => setter && setter(!!(value & Math.pow(2, index)), value));
}

function getComboNumber(states) {
  return states.reduce((value, state, index) => value + (state ? Math.pow(2, index) : 0), 0);
}

const Toggle = ({ checked, children, disabled, onChange, type }) => {
  const handleChange = useCallback(({ target: { checked } }) => onChange(checked), [onChange]);
  const style = useMemo(() => ({ userSelect: 'none' }), []);

  return (
    <label style={style}>
      <input checked={checked} disabled={disabled} onChange={handleChange} type={type || 'checkbox'} />
      {children}
    </label>
  );
};

const ActivityGroupingPanel = () => {
  const context = useContext(window.WebChatTest.ActivityGroupingContext);

  const {
    attachmentLayout,
    botAvatarInitials,
    botNub,
    botOnTop,
    hide,
    rtl,
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
    transcriptName,
    url,
    userAvatarInitials,
    userNub,
    userOnTop,
    transcriptNames,
    wide
  } = context;

  const showAvatarForEveryActivity = showAvatarInGroup === true;
  const setShowAvatarForEveryActivity = useCallback(
    value => {
      if (value) {
        setShowAvatarInGroup(true);
      } else if (showAvatarInGroup === true) {
        setShowAvatarInGroup(DEFAULT_STATE.showAvatarInGroup);
      }
    },
    [setShowAvatarInGroup, showAvatarInGroup]
  );

  const setBotOnTop2 = useCallback(() => setBotOnTop(true), [setBotOnTop]);
  const setBotOnBottom = useCallback(() => setBotOnTop(false), [setBotOnTop]);
  const setUserOnTop2 = useCallback(() => setUserOnTop(true), [setUserOnTop]);
  const setUserOnBottom = useCallback(() => setUserOnTop(false), [setUserOnTop]);

  const setAttachmentLayoutCarousel = useCallback(() => setAttachmentLayout('carousel'), [setAttachmentLayout]);
  const setAttachmentLayoutDefault = useCallback(() => setAttachmentLayout(false), [setAttachmentLayout]);
  const setAttachmentLayoutStacked = useCallback(() => setAttachmentLayout('stacked'), [setAttachmentLayout]);

  const setAttachmentLayoutComboNumber = useCallback(
    (_, value) =>
      setAttachmentLayout(
        (value & 192) === 192 && value !== -1 ? false : value & 128 ? 'carousel' : value & 64 ? 'stacked' : false
      ),
    [attachmentLayout, setAttachmentLayout]
  );

  const styleValueAndSetters = [
    [botAvatarInitials, setBotAvatarInitials],
    [botNub, setBotNub],
    [botOnTop, setBotOnTop],
    [userAvatarInitials, setUserAvatarInitials],
    [userNub, setUserNub],
    [userOnTop, setUserOnTop],
    [attachmentLayout === 'stacked', setAttachmentLayoutComboNumber],
    [attachmentLayout === 'carousel']
  ];

  const styleValues = styleValueAndSetters.map(([value]) => value);
  const styleSetters = styleValueAndSetters.map(([_, setter]) => setter);

  const styleComboNumber = getComboNumber(styleValues);
  const setStyleComboNumber = useCallback(value => comboNumberSetter(value, styleSetters), [...styleSetters]);

  const handleStyleComboNumberChange = useCallback(({ target: { value } }) => setStyleComboNumber(value), [
    setStyleComboNumber
  ]);

  const handlePlusOneStyleComboNumber = useCallback(() => setStyleComboNumber(styleComboNumber + 1), [
    styleComboNumber,
    setStyleComboNumber
  ]);

  const handleMinusOneStyleComboNumber = useCallback(() => setStyleComboNumber(styleComboNumber - 1), [
    styleComboNumber,
    setStyleComboNumber
  ]);

  const viewValueAndSetters = [
    [wide, setWide],
    [rtl, setRTL]
  ];

  const viewValues = viewValueAndSetters.map(([value]) => value);
  const viewSetters = viewValueAndSetters.map(([_, setter]) => setter);

  const viewComboNumber = getComboNumber(viewValues);
  const setViewComboNumber = useCallback(value => comboNumberSetter(value, viewSetters), [...viewSetters]);

  const handleViewComboNumberChange = useCallback(({ target: { value } }) => setViewComboNumber(value), [
    setViewComboNumber
  ]);

  const handlePlusOneViewComboNumber = useCallback(() => setViewComboNumber(viewComboNumber + 1), [
    viewComboNumber,
    setViewComboNumber
  ]);

  const handleMinusOneViewComboNumber = useCallback(() => setViewComboNumber(viewComboNumber - 1), [
    viewComboNumber,
    setViewComboNumber
  ]);

  const setShowAvatarInSenderGroup = useCallback(() => {
    setShowAvatarForEveryActivity(false);
    setShowAvatarInGroup('sender');
  }, [setShowAvatarForEveryActivity, setShowAvatarInGroup]);

  const setShowAvatarInStatusGroup = useCallback(() => {
    setShowAvatarForEveryActivity(false);
    setShowAvatarInGroup('status');
  }, [setShowAvatarForEveryActivity, setShowAvatarInGroup]);

  const setShowAvatarInGroupType = useCallback(value => setShowAvatarInGroup(value ? 'status' : 'sender'), [
    setShowAvatarInGroup
  ]);

  const groupingValueAndSetters = [
    // [!showAvatarForEveryActivity && showAvatarInGroup === 'status', setShowAvatarInGroupType],
    [showAvatarInGroup === 'status', setShowAvatarInGroupType],
    [showAvatarInGroup === true, setShowAvatarForEveryActivity]
  ];

  const groupingValues = groupingValueAndSetters.map(([value]) => value);
  const groupingSetters = groupingValueAndSetters.map(([_, setter]) => setter);

  const groupingComboNumber = getComboNumber(groupingValues);
  const setGroupingComboNumber = useCallback(value => comboNumberSetter(value, groupingSetters), [...groupingSetters]);

  const handleGroupingComboNumberChange = useCallback(({ target: { value } }) => setGroupingComboNumber(value), [
    setGroupingComboNumber
  ]);

  const handlePlusOneGroupingComboNumber = useCallback(() => setGroupingComboNumber(groupingComboNumber + 1), [
    groupingComboNumber,
    setGroupingComboNumber
  ]);

  const handleMinusOneGroupingComboNumber = useCallback(() => setGroupingComboNumber(groupingComboNumber - 1), [
    groupingComboNumber,
    setGroupingComboNumber
  ]);

  const handleTranscriptChange = useCallback(({ target: { value } }) => setTranscriptName(value), [setTranscriptName]);

  const [minimized, setMinimized] = useState(false);
  const handleMinimizeClick = useCallback(() => setMinimized(!minimized), [minimized, setMinimized]);

  const handleComboNumberFocus = useCallback(({ target }) => target.select(), []);

  return (
    !hide && (
      <div
        className={classNames('activity-grouping-panel', { 'activity-grouping-panel--minimized': minimized })}
        dir="ltr"
      >
        <header className="activity-grouping-panel__header">
          <span className="activity-grouping-panel__header-title">Activity grouping</span>
          <button className="activity-grouping-panel__minimize-button" onClick={handleMinimizeClick}>
            {minimized ? 'Restore' : 'Minimize'}
          </button>
        </header>
        <section className="activity-grouping-panel__body">
          <div>
            <label>
              Transcript:{' '}
              <select onChange={handleTranscriptChange} value={transcriptName}>
                {transcriptNames.map(name => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <hr />
          <div>
            <Toggle checked={wide} onChange={setWide}>
              View: Wide
            </Toggle>
          </div>
          <div>
            <Toggle checked={rtl} onChange={setRTL}>
              View: Right-to-left
            </Toggle>
          </div>
          <hr />
          <div className="activity-grouping-panel__combo-number-row">
            <input
              className="activity-grouping-panel__combo-number-input"
              onChange={handleViewComboNumberChange}
              onFocus={handleComboNumberFocus}
              type="number"
              value={viewComboNumber}
            />
            <button className="activity-grouping-panel__combo-number-button" onClick={handlePlusOneViewComboNumber}>
              +
            </button>
            <button className="activity-grouping-panel__combo-number-button" onClick={handleMinusOneViewComboNumber}>
              -
            </button>
          </div>
          <hr />
          <div>
            <Toggle
              checked={!showAvatarForEveryActivity && showAvatarInGroup === 'sender'}
              onChange={setShowAvatarInSenderGroup}
              type="radio"
            >
              Show avatar: On sender
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={!showAvatarForEveryActivity && showAvatarInGroup === 'status'}
              onChange={setShowAvatarInStatusGroup}
              type="radio"
            >
              Show avatar: On status
            </Toggle>
          </div>
          <div>
            <Toggle checked={showAvatarForEveryActivity} onChange={setShowAvatarForEveryActivity} type="radio">
              Show avatar: On every activity
            </Toggle>
          </div>
          <hr />
          <div className="activity-grouping-panel__combo-number-row">
            <input
              className="activity-grouping-panel__combo-number-input"
              onChange={handleGroupingComboNumberChange}
              onFocus={handleComboNumberFocus}
              type="number"
              value={groupingComboNumber}
            />
            <button className="activity-grouping-panel__combo-number-button" onClick={handlePlusOneGroupingComboNumber}>
              +
            </button>
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handleMinusOneGroupingComboNumber}
            >
              -
            </button>
          </div>
          <hr />
          <div>
            <Toggle checked={botAvatarInitials} onChange={setBotAvatarInitials}>
              Bot: Avatar
            </Toggle>
          </div>
          <div>
            <Toggle checked={botNub} onChange={setBotNub}>
              Bot: Nub
            </Toggle>
          </div>
          <div>
            <Toggle checked={botOnTop} disabled={!botAvatarInitials && !botNub} onChange={setBotOnTop2} type="radio">
              Bot: On top
            </Toggle>
          </div>
          <div>
            <Toggle checked={!botOnTop} disabled={!botAvatarInitials && !botNub} onChange={setBotOnBottom} type="radio">
              Bot: On bottom
            </Toggle>
          </div>
          <hr />
          <div>
            <Toggle checked={userAvatarInitials} onChange={setUserAvatarInitials}>
              User: Avatar
            </Toggle>
          </div>
          <div>
            <Toggle checked={userNub} onChange={setUserNub}>
              User: Nub
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={userOnTop}
              disabled={!userAvatarInitials && !userNub}
              onChange={setUserOnTop2}
              type="radio"
            >
              User: On top
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={!userOnTop}
              disabled={!userAvatarInitials && !userNub}
              onChange={setUserOnBottom}
              type="radio"
            >
              User: On bottom
            </Toggle>
          </div>
          <hr />
          <div>
            <Toggle checked={!attachmentLayout} onChange={setAttachmentLayoutDefault} type="radio">
              Layout: Default
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={attachmentLayout && attachmentLayout !== 'carousel'}
              onChange={setAttachmentLayoutStacked}
              type="radio"
            >
              Layout: Force stacked
            </Toggle>
          </div>
          <div>
            <Toggle checked={attachmentLayout === 'carousel'} onChange={setAttachmentLayoutCarousel} type="radio">
              Layout: Force carousel
            </Toggle>
          </div>
          <hr />
          <div className="activity-grouping-panel__combo-number-row">
            <input
              className="activity-grouping-panel__combo-number-input"
              onChange={handleStyleComboNumberChange}
              onFocus={handleComboNumberFocus}
              type="number"
              value={styleComboNumber}
            />
            <button className="activity-grouping-panel__combo-number-button" onClick={handlePlusOneStyleComboNumber}>
              +
            </button>
            <button className="activity-grouping-panel__combo-number-button" onClick={handleMinusOneStyleComboNumber}>
              -
            </button>
          </div>
          <hr />
          <div>
            <a href={url} rel="noopener noreferrer" target="_blank">
              Open in new window
            </a>
          </div>
        </section>
      </div>
    )
  );
};

window.WebChatTest.ActivityGroupingBadges = ActivityGroupingBadges;
window.WebChatTest.ActivityGroupingContext = ActivityGroupingContext;
window.WebChatTest.ActivityGroupingPanel = ActivityGroupingPanel;
window.WebChatTest.ActivityGroupingSurface = ActivityGroupingSurface;
