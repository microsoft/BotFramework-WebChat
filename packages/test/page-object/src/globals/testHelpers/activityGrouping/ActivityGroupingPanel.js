import ActivityGroupingContext from './ActivityGroupingContext';
import classNames from 'classnames';
import Toggle from './Toggle';

// Use React from window (UMD) instead of import.
const { React: { useCallback, useContext, useState } = {} } = window;

function comboNumberSetter(value, setters) {
  setters.forEach((setter, index) => setter && setter(!!(value & Math.pow(2, index)), value));
}

function getComboNumber(states) {
  return states.reduce((value, state, index) => value + (state ? Math.pow(2, index) : 0), 0);
}

const ActivityGroupingPanel = () => {
  const context = useContext(ActivityGroupingContext);

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
        setShowAvatarInGroup('status');
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
    [setAttachmentLayout]
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
  const styleSetters = styleValueAndSetters.map(([, setter]) => setter);

  const styleComboNumber = getComboNumber(styleValues);
  const setStyleComboNumber = useCallback(value => comboNumberSetter(value, styleSetters), [styleSetters]);

  const handleStyleComboNumberChange = useCallback(
    ({ target: { value } }) => setStyleComboNumber(value),
    [setStyleComboNumber]
  );

  const handlePlusOneStyleComboNumber = useCallback(
    () => setStyleComboNumber(styleComboNumber + 1),
    [styleComboNumber, setStyleComboNumber]
  );

  const handleMinusOneStyleComboNumber = useCallback(
    () => setStyleComboNumber(styleComboNumber - 1),
    [styleComboNumber, setStyleComboNumber]
  );

  const viewValueAndSetters = [
    [wide, setWide],
    [rtl, setRTL]
  ];

  const viewValues = viewValueAndSetters.map(([value]) => value);
  const viewSetters = viewValueAndSetters.map(([, setter]) => setter);

  const viewComboNumber = getComboNumber(viewValues);
  const setViewComboNumber = useCallback(value => comboNumberSetter(value, viewSetters), [viewSetters]);

  const handleViewComboNumberChange = useCallback(
    ({ target: { value } }) => setViewComboNumber(value),
    [setViewComboNumber]
  );

  const handlePlusOneViewComboNumber = useCallback(
    () => setViewComboNumber(viewComboNumber + 1),
    [viewComboNumber, setViewComboNumber]
  );

  const handleMinusOneViewComboNumber = useCallback(
    () => setViewComboNumber(viewComboNumber - 1),
    [viewComboNumber, setViewComboNumber]
  );

  const setShowAvatarInSenderGroup = useCallback(() => {
    setShowAvatarForEveryActivity(false);
    setShowAvatarInGroup('sender');
  }, [setShowAvatarForEveryActivity, setShowAvatarInGroup]);

  const setShowAvatarInStatusGroup = useCallback(() => {
    setShowAvatarForEveryActivity(false);
    setShowAvatarInGroup('status');
  }, [setShowAvatarForEveryActivity, setShowAvatarInGroup]);

  const setShowAvatarInGroupType = useCallback(
    value => setShowAvatarInGroup(value ? 'status' : 'sender'),
    [setShowAvatarInGroup]
  );

  const groupingValueAndSetters = [
    // [!showAvatarForEveryActivity && showAvatarInGroup === 'status', setShowAvatarInGroupType],
    [showAvatarInGroup === 'status', setShowAvatarInGroupType],
    [showAvatarInGroup === true, setShowAvatarForEveryActivity]
  ];

  const groupingValues = groupingValueAndSetters.map(([value]) => value);
  const groupingSetters = groupingValueAndSetters.map(([, setter]) => setter);

  const groupingComboNumber = getComboNumber(groupingValues);
  const setGroupingComboNumber = useCallback(value => comboNumberSetter(value, groupingSetters), [groupingSetters]);

  const handleGroupingComboNumberChange = useCallback(
    ({ target: { value } }) => setGroupingComboNumber(value),
    [setGroupingComboNumber]
  );

  const handlePlusOneGroupingComboNumber = useCallback(
    () => setGroupingComboNumber(groupingComboNumber + 1),
    [groupingComboNumber, setGroupingComboNumber]
  );

  const handleMinusOneGroupingComboNumber = useCallback(
    () => setGroupingComboNumber(groupingComboNumber - 1),
    [groupingComboNumber, setGroupingComboNumber]
  );

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
          <span className="activity-grouping-panel__header-title">{'Activity grouping'}</span>
          <button className="activity-grouping-panel__minimize-button" onClick={handleMinimizeClick} type="button">
            {minimized ? 'Restore' : 'Minimize'}
          </button>
        </header>
        <section className="activity-grouping-panel__body">
          <div>
            <label>
              {'Transcript: '}
              <select onChange={handleTranscriptChange} value={transcriptName || ''}>
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
              {'View: Wide'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={rtl} onChange={setRTL}>
              {'View: Right-to-left'}
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
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handlePlusOneViewComboNumber}
              type="button"
            >
              {'+'}
            </button>
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handleMinusOneViewComboNumber}
              type="button"
            >
              {'-'}
            </button>
          </div>
          <hr />
          <div>
            <Toggle
              checked={!showAvatarForEveryActivity && showAvatarInGroup === 'sender'}
              onChange={setShowAvatarInSenderGroup}
              type="radio"
            >
              {'Show avatar: On sender'}
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={!showAvatarForEveryActivity && showAvatarInGroup === 'status'}
              onChange={setShowAvatarInStatusGroup}
              type="radio"
            >
              {'Show avatar: On status'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={showAvatarForEveryActivity} onChange={setShowAvatarForEveryActivity} type="radio">
              {'Show avatar: On every activity'}
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
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handlePlusOneGroupingComboNumber}
              type="button"
            >
              {'+'}
            </button>
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handleMinusOneGroupingComboNumber}
              type="button"
            >
              {'-'}
            </button>
          </div>
          <hr />
          <div>
            <Toggle checked={botAvatarInitials} onChange={setBotAvatarInitials}>
              {'Bot: Avatar'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={botNub} onChange={setBotNub}>
              {'Bot: Nub'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={botOnTop} disabled={!botAvatarInitials && !botNub} onChange={setBotOnTop2} type="radio">
              {'Bot: On top'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={!botOnTop} disabled={!botAvatarInitials && !botNub} onChange={setBotOnBottom} type="radio">
              {'Bot: On bottom'}
            </Toggle>
          </div>
          <hr />
          <div>
            <Toggle checked={userAvatarInitials} onChange={setUserAvatarInitials}>
              {'User: Avatar'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={userNub} onChange={setUserNub}>
              {'User: Nub'}
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={userOnTop}
              disabled={!userAvatarInitials && !userNub}
              onChange={setUserOnTop2}
              type="radio"
            >
              {'User: On top'}
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={!userOnTop}
              disabled={!userAvatarInitials && !userNub}
              onChange={setUserOnBottom}
              type="radio"
            >
              {'User: On bottom'}
            </Toggle>
          </div>
          <hr />
          <div>
            <Toggle checked={!attachmentLayout} onChange={setAttachmentLayoutDefault} type="radio">
              {'Layout: Default'}
            </Toggle>
          </div>
          <div>
            <Toggle
              checked={attachmentLayout && attachmentLayout !== 'carousel'}
              onChange={setAttachmentLayoutStacked}
              type="radio"
            >
              {'Layout: Force stacked'}
            </Toggle>
          </div>
          <div>
            <Toggle checked={attachmentLayout === 'carousel'} onChange={setAttachmentLayoutCarousel} type="radio">
              {'Layout: Force carousel'}
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
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handlePlusOneStyleComboNumber}
              type="button"
            >
              {'+'}
            </button>
            <button
              className="activity-grouping-panel__combo-number-button"
              onClick={handleMinusOneStyleComboNumber}
              type="button"
            >
              {'-'}
            </button>
          </div>
          <hr />
          <div>
            <a href={url} rel="noopener noreferrer" target="_blank">
              {'Open in new window'}
            </a>
          </div>
        </section>
      </div>
    )
  );
};

export default ActivityGroupingPanel;
