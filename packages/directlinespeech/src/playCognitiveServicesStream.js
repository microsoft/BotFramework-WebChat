import cognitiveServicesPromiseToESPromise from './cognitiveServicesPromiseToESPromise';

function createBufferSource(audioContext, { channels, samplesPerSec }, channelInterleavedAudioData) {
  const bufferSource = audioContext.createBufferSource();
  const frames = channelInterleavedAudioData.length / channels;
  const audioBuffer = audioContext.createBuffer(channels, frames, samplesPerSec);

  for (let channel = 0; channel < channels; channel++) {
    const perChannelAudioData = audioBuffer.getChannelData(channel);

    // We are copying channel-interleaved audio data, into per-channel audio data
    for (let perChannelIndex = 0; perChannelIndex < channelInterleavedAudioData.length; perChannelIndex++) {
      perChannelAudioData[perChannelIndex] = channelInterleavedAudioData[perChannelIndex * channels + channel];
    }
  }

  bufferSource.buffer = audioBuffer;

  return bufferSource;
}

function formatTypedBitArrayToFloatArray(audioData, maxValue) {
  const float32Data = new Float32Array(audioData.length);

  for (let i = 0; i < audioData.length; i++) {
    float32Data[i] = audioData[i] / maxValue;
  }

  return float32Data;
}

function formatAudioDataArrayBufferToFloatArray({ bitsPerSample }, arrayBuffer) {
  switch (bitsPerSample) {
    case 8:
      return formatTypedBitArrayToFloatArray(new Int8Array(arrayBuffer), 128);

    case 16:
      return formatTypedBitArrayToFloatArray(new Int16Array(arrayBuffer), 32768);

    case 32:
      return formatTypedBitArrayToFloatArray(new Int32Array(arrayBuffer), 2147483648);

    default:
      throw new InvalidOperationError('Only WAVE_FORMAT_PCM (8/16/32 bps) format supported at this time');
  }
}

export default function playCognitiveServicesStream(
  audioContext,
  audioFormat,
  streamReader,
  { signal = { aborted: false } } = {}
) {
  return new Promise(async (resolve, reject) => {
    try {
      let currentTime;
      let lastBufferSource;

      const read = () => cognitiveServicesPromiseToESPromise(streamReader.read());

      if (signal.aborted) {
        throw new Error('aborted');
      }

      for (
        let chunk = await read(), maxChunks = 0;
        !chunk.isEnd && maxChunks < 1000 && !signal.aborted;
        chunk = await read(), maxChunks++
      ) {
        if (signal.aborted) {
          break;
        }

        const audioData = formatAudioDataArrayBufferToFloatArray(audioFormat, chunk.buffer);
        const bufferSource = createBufferSource(audioContext, audioFormat, audioData);
        const { duration } = bufferSource.buffer;

        if (!currentTime) {
          currentTime = audioContext.currentTime;
        }

        bufferSource.connect(audioContext.destination);
        bufferSource.start(currentTime);

        lastBufferSource = bufferSource;
        currentTime += duration;
      }

      if (signal.aborted) {
        throw new Error('aborted');
      } else if (lastBufferSource) {
        lastBufferSource.onended = () => resolve();
      } else {
        resolve();
      }
    } catch (error) {
      reject(error);
    }
  });
}
