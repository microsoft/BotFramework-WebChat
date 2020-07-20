const {
  React: { createContext, useCallback, useEffect, useMemo, useState },
  WebChatTest: { parseURLParams }
} = window;

const TRANSCRIPT_NAMES = [
  'simple-messages.json',
  'single-line-multiple-files.json',
  'single-line-no-files.json',
  'single-line-single-file.json',
  'stacked-layout.json',
  'user-upload.json'
];

const ActivityGroupingContext = createContext();

function createCustomActivityMiddleware(attachmentLayout) {
  return () => next => args =>
    next({
      ...args,
      activity: { ...args.activity, ...(args.activity.from.role === 'bot' ? { attachmentLayout } : {}) }
    });
}

const URL_QUERY_MAPPING = {
  bi: 'botAvatarInitials',
  bn: 'botNub',
  bt: 'botOnTop',
  g: 'showAvatarInGroup',
  l: 'carouselLayout',
  rtl: 'rtl',
  t: 'transcriptName',
  ui: 'userAvatarInitials',
  un: 'userNub',
  ut: 'userOnTop',
  w: 'wide'
};

function generateURL(state) {
  const params = {};

  Object.entries(URL_QUERY_MAPPING).forEach(([short, long]) => {
    const value = state[long];

    params[short] = value === true ? '1' : value === false ? '0' : value + '';
  });

  return '#' + new URLSearchParams(params).toString();
}

const DEFAULT_STATE = {
  botAvatarInitials: true,
  botNub: true,
  botOnTop: true,
  carouselLayout: false,
  rtl: false,
  showAvatarInGroup: 'status',
  transcriptName: TRANSCRIPT_NAMES[0],
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

const ActivityGroupingSurface = ({ children }) => {
  const initialState = useMemo(() => getInitialState(DEFAULT_STATE), []);
  const [botAvatarInitials, setBotAvatarInitials] = useState(initialState.botAvatarInitials);
  const [botNub, setBotNub] = useState(initialState.botNub);
  const [botOnTop, setBotOnTop] = useState(initialState.botOnTop);
  const [carouselLayout, setCarouselLayout] = useState(initialState.carouselLayout);
  const [directLine, setDirectLine] = useState();
  const [rtl, setRTL] = useState(initialState.rtl);
  const [showAvatarInGroup, setShowAvatarInGroup] = useState(initialState.showAvatarInGroup);
  const [transcriptName, setTranscriptName] = useState(initialState.transcriptName);
  const [userAvatarInitials, setUserAvatarInitials] = useState(initialState.userAvatarInitials);
  const [userNub, setUserNub] = useState(initialState.userNub);
  const [userOnTop, setUserOnTop] = useState(initialState.userOnTop);
  const [wide, setWide] = useState(initialState.wide);

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

  const activityMiddleware = useMemo(() => createCustomActivityMiddleware(carouselLayout ? 'carousel' : 'stacked'), [
    carouselLayout
  ]);

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
      botAvatarInitials,
      botNub,
      botOnTop,
      carouselLayout,
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
        botAvatarInitials,
        botNub,
        botOnTop,
        carouselLayout,
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
      setBotAvatarInitials,
      setBotNub,
      setBotOnTop,
      setCarouselLayout,
      setRTL,
      setShowAvatarInGroup,
      setTranscriptName,
      setUserAvatarInitials,
      setUserNub,
      setUserOnTop,
      setWide,
      showAvatarInGroup,
      styleOptions,
      url
    }),
    [
      activityMiddleware,
      contextState,
      directLine,
      setBotAvatarInitials,
      setBotNub,
      setBotOnTop,
      setCarouselLayout,
      setRTL,
      setShowAvatarInGroup,
      setTranscriptName,
      setUserAvatarInitials,
      setUserNub,
      setUserOnTop,
      setWide,
      showAvatarInGroup,
      styleOptions,
      url
    ]
  );

  return <ActivityGroupingContext.Provider value={context}>{children}</ActivityGroupingContext.Provider>;
};

function comboNumberSetter(value, setters) {
  setters.forEach((setter, index) => setter(!!(value & Math.pow(2, index))));
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
    botAvatarInitials,
    botNub,
    botOnTop,
    carouselLayout,
    rtl,
    setBotAvatarInitials,
    setBotNub,
    setBotOnTop,
    setCarouselLayout,
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

  const setCarouselLayout2 = useCallback(() => setCarouselLayout(true), [setCarouselLayout]);
  const setStackedLayout = useCallback(() => setCarouselLayout(false), [setCarouselLayout]);

  const styleValueAndSetters = [
    [botAvatarInitials, setBotAvatarInitials],
    [botNub, setBotNub],
    [botOnTop, setBotOnTop],
    [userAvatarInitials, setUserAvatarInitials],
    [userNub, setUserNub],
    [userOnTop, setUserOnTop],
    [carouselLayout, setCarouselLayout]
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

  return (
    <div className={classNames('group-avatar-panel', { 'group-avatar-panel--minimized': minimized })} dir="ltr">
      <header className="group-avatar-panel__header">
        <button className="group-avatar-panel__minimize-button" onClick={handleMinimizeClick}>
          Minimize
        </button>
      </header>
      <section className="group-avatar-panel__body">
        <div>
          <label>
            Transcript:{' '}
            <select onChange={handleTranscriptChange} value={transcriptName}>
              {TRANSCRIPT_NAMES.map(name => (
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
        <div>
          <input onChange={handleViewComboNumberChange} type="number" value={viewComboNumber} />
          <button onClick={handlePlusOneViewComboNumber}>+</button>
          <button onClick={handleMinusOneViewComboNumber}>-</button>
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
        <div>
          <input onChange={handleGroupingComboNumberChange} type="number" value={groupingComboNumber} />
          <button onClick={handlePlusOneGroupingComboNumber}>+</button>
          <button onClick={handleMinusOneGroupingComboNumber}>-</button>
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
          <Toggle checked={userOnTop} disabled={!userAvatarInitials && !userNub} onChange={setUserOnTop2} type="radio">
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
          <Toggle checked={!carouselLayout} onChange={setStackedLayout} type="radio">
            Layout: Stacked
          </Toggle>
        </div>
        <div>
          <Toggle checked={carouselLayout} onChange={setCarouselLayout2} type="radio">
            Layout: Carousel
          </Toggle>
        </div>
        <hr />
        <div>
          <input onChange={handleStyleComboNumberChange} type="number" value={styleComboNumber} />
          <button onClick={handlePlusOneStyleComboNumber}>+</button>
          <button onClick={handleMinusOneStyleComboNumber}>-</button>
        </div>
        <hr />
        <div>
          <a href={url} rel="noopener noreferrer" target="_blank">
            Open in new window
          </a>
        </div>
      </section>
    </div>
  );
};

window.WebChatTest.ActivityGroupingContext = ActivityGroupingContext;
window.WebChatTest.ActivityGroupingPanel = ActivityGroupingPanel;
window.WebChatTest.ActivityGroupingSurface = ActivityGroupingSurface;
