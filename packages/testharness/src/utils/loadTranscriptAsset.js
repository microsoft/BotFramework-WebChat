export default async function loadTranscript(filename) {
  const path = `assets/transcripts/${encodeURI(filename)}`;
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load transcript "${path}".`);
  }

  const activities = await res.json();
  const now = Date.now();

  return activities.map(activity => ({
    ...activity,
    timestamp: new Date(now + (activity.timestamp || 0)).toISOString()
  }));
}
