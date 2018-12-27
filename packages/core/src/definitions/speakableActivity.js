export default function (activity, userID) {
  return (
    activity
    && activity.from
    && activity.from.id !== userID
    && activity.type === 'message'
  );
}
