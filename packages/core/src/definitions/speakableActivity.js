export default function (activity) {
  return (
    activity
    && activity.from
    && activity.type === 'message'
  );
}
