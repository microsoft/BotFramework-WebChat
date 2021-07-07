export default function bytesPerSample(settings: MediaTrackSettings) {
  // eslint-disable-next-line no-magic-numbers
  return ((settings.sampleSize as number) >> 3) * (settings.channelCount as number) * (settings.sampleRate as number);
}
