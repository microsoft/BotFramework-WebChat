const {
  React: { createContext, useCallback, useEffect, useMemo, useState }
} = window;

const TRANSCRIPT_NAMES = ['simple-messages.json', 'stacked-layout.json'];

const GroupAvatarContext = createContext();

function createCustomActivityMiddleware(attachmentLayout) {
  return () => next => args => next({ ...args, activity: { ...args.activity, attachmentLayout } });
}

const GroupAvatarSurface = ({ children }) => {
  const [botAvatarInitials, setBotAvatarInitials] = useState(true);
  const [botNub, setBotNub] = useState(true);
  const [botOnTop, setBotOnTop] = useState(true);
  const [carouselLayout, setCarouselLayout] = useState(false);
  const [directLine, setDirectLine] = useState();
  const [rtl, setRTL] = useState(false);
  const [showAvatarForEveryActivity, setShowAvatarForEveryActivity] = useState(false);
  const [showAvatarInGroup, setShowAvatarInGroup] = useState('status');
  const [transcriptName, setTranscriptName] = useState(TRANSCRIPT_NAMES[0]);
  const [userAvatarInitials, setUserAvatarInitials] = useState(true);
  const [userNub, setUserNub] = useState(true);
  const [userOnTop, setUserOnTop] = useState(true);
  const [wide, setWide] = useState(false);

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
      showAvatarInGroup: showAvatarForEveryActivity ? true : showAvatarInGroup,
      transitionDuration: '.3s'
    }),
    [
      botAvatarInitials,
      botNub,
      botOnTop,
      showAvatarForEveryActivity,
      showAvatarInGroup,
      userAvatarInitials,
      userNub,
      userOnTop
    ]
  );

  const context = useMemo(
    () => ({
      activityMiddleware,
      botAvatarInitials,
      botNub,
      botOnTop,
      carouselLayout,
      directLine,
      rtl,
      setBotAvatarInitials,
      setBotNub,
      setBotOnTop,
      setCarouselLayout,
      setRTL,
      setShowAvatarForEveryActivity,
      setShowAvatarInGroup,
      setTranscriptName,
      setUserAvatarInitials,
      setUserNub,
      setUserOnTop,
      setWide,
      showAvatarForEveryActivity,
      showAvatarInGroup,
      styleOptions,
      transcriptName,
      userAvatarInitials,
      userNub,
      userOnTop,
      wide
    }),
    [
      activityMiddleware,
      botAvatarInitials,
      botNub,
      botOnTop,
      carouselLayout,
      directLine,
      rtl,
      setBotAvatarInitials,
      setBotNub,
      setBotOnTop,
      setCarouselLayout,
      setRTL,
      setShowAvatarForEveryActivity,
      setShowAvatarInGroup,
      setTranscriptName,
      setUserAvatarInitials,
      setUserNub,
      setUserOnTop,
      setWide,
      showAvatarForEveryActivity,
      showAvatarInGroup,
      styleOptions,
      transcriptName,
      userAvatarInitials,
      userNub,
      userOnTop,
      wide
    ]
  );

  return <GroupAvatarContext.Provider value={context}>{children}</GroupAvatarContext.Provider>;
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

const GroupAvatarPanel = ({ onChange }) => {
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
    setShowAvatarForEveryActivity,
    setShowAvatarInGroup,
    setTranscriptName,
    setUserAvatarInitials,
    setUserNub,
    setUserOnTop,
    setWide,
    showAvatarForEveryActivity,
    showAvatarInGroup,
    transcriptName,
    userAvatarInitials,
    userNub,
    userOnTop,
    wide
  } = useContext(window.WebChatTest.GroupAvatarContext);

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

  const setShowAvatarInGroupType = useCallback(sender => setShowAvatarInGroup('sender'), [setShowAvatarInGroup]);

  const groupingValueAndSetters = [
    [!showAvatarForEveryActivity && showAvatarInGroup === 'status', setShowAvatarInGroupType],
    [showAvatarForEveryActivity, setShowAvatarForEveryActivity]
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
      </section>
    </div>
  );
};

window.WebChatTest.GroupAvatarContext = GroupAvatarContext;
window.WebChatTest.GroupAvatarPanel = GroupAvatarPanel;
window.WebChatTest.GroupAvatarSurface = GroupAvatarSurface;
