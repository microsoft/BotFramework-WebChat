export default function speakingActivity(activity) {
  return activity.channelData && activity.channelData.speak;
}
