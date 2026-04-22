export default function isActivitySentFromBot(activity) {
  return (
    activity &&
    typeof activity === 'object' &&
    'from' in activity &&
    typeof activity.from === 'object' &&
    'role' in activity.from &&
    activity.from.role === 'bot'
  );
}
