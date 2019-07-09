// If true, the activity is in the queue and needs to be spoken.

export default function speakingActivity(activity) {
  return activity.channelData && activity.channelData.speak;
}
