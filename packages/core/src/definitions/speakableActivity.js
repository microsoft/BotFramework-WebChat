export default function speakableActivity(activity) {
  return activity && activity.from && activity.type === 'message';
}
