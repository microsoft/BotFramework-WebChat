import ActivityGroupingContext from './ActivityGroupingContext';

const { React: { Fragment, useContext, useMemo } = {} } = window;

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
  } = useContext(ActivityGroupingContext);

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
        <Fragment key={badge}>
          <nobr className="badges__badge">{badge}</nobr>
          {/* Using zero-width space to break separate <nobr> into another line if needed. */}
          {'\u200B'}
        </Fragment>
      ))}
    </div>
  );
};

export default ActivityGroupingBadges;
