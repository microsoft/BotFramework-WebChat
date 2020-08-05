export default function getActivityUniqueId(activity) {
  return activity && ((activity.channelData && activity.channelData.clientActivityID) || activity.id);
}
