export default function getActivityUniqueId(activity) {
  return (activity.channelData && activity.channelData.clientActivityID) || activity.id;
}
