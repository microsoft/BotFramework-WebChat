/**
 * All capabilities are optional as they depend on adapter/server support.
 */
type Capabilities = Readonly<{
  voiceConfiguration?: VoiceConfiguration | undefined;
}>;

/**
 * Optional for adapter/server to provide these configs for speech-to-speech.
 */
type VoiceConfiguration = Readonly<{
  chunkIntervalMs: number;
  sampleRate: number;
}>;

export type { Capabilities, VoiceConfiguration };
