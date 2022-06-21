export default function bytesPerSample(settings: MediaTrackSettings) {
  // `channelCount` is not on @types/web@0.0.54 yet, related to https://github.com/microsoft/TypeScript-DOM-lib-generator/issues/1290.
  // @ts-ignore
  // eslint-disable-next-line no-magic-numbers
  return ((settings.sampleSize as number) >> 3) * (settings.channelCount as number) * (settings.sampleRate as number);
}
