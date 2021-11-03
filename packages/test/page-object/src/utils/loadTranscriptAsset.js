export default async function loadTranscript(filename) {
  const path = `/assets/transcripts/${encodeURI(filename)}`;
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(`Failed to load transcript "${path}".`);
  }

  return res.json();
}
