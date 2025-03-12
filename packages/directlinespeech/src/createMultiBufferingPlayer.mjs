// Currently, Web Chat uses a triple-buffer approach.
const NUM_BUFFER = 3;

function zeroBuffer(buffer) {
  const channels = buffer.numberOfChannels;

  for (let channel = 0; channel < channels; channel++) {
    const audioData = buffer.getChannelData(channel);

    [].fill.call(audioData, 0);
  }
}

function copyBuffer(buffer, multiChannelArray) {
  const channels = buffer.numberOfChannels;

  for (let channel = 0; channel < channels; channel++) {
    const float32Array = multiChannelArray[+channel];

    // Note that Safari does not support AudioBuffer.copyToChannel yet.
    if (buffer.copyToChannel) {
      buffer.copyToChannel(float32Array, channel);
    } else {
      const { length: float32ArrayLength } = float32Array;
      const perChannelBuffer = buffer.getChannelData(channel);

      for (let offset = 0; offset < float32ArrayLength; offset++) {
        perChannelBuffer[+offset] = float32Array[+offset];
      }
    }
  }
}

// This is a multi-buffering player. Users can keep pushing buffer to Web Chat.
// The buffer, realized as BufferSource, is queued to AudioContext.
// Data will be queued as quickly and frequently as possible.
// Web Chat does not support progressive buffering (pushing a partial buffer) and there are currently no plans to implement.

export default function createMultiBufferingPlayer(audioContext, { channels, samplesPerSec }, numSamplePerBuffer) {
  const freeBuffers = new Array(NUM_BUFFER)
    .fill()
    .map(() => audioContext.createBuffer(channels, numSamplePerBuffer, samplesPerSec));
  let queuedBufferSources = [];
  let nextSchedule;

  const queue = [];

  const playNext = () => {
    if (typeof nextSchedule !== 'number') {
      nextSchedule = audioContext.currentTime;
    }

    const bufferSource = audioContext.createBufferSource();
    const multiChannelArray = queue.shift();

    if (typeof multiChannelArray === 'function') {
      // If the queued item is a function, it is because the user called "flush".
      // The "flush" function will callback when all queued buffers before the "flush" call have played.
      multiChannelArray();
    } else if (multiChannelArray) {
      const nextBuffer = freeBuffers.shift();

      // If all buffers are currently occupied, prepend the data back to the queue.
      // When one of the buffers finish, it will call playNext() again to pick up items from the queue.
      if (!nextBuffer) {
        queue.unshift(multiChannelArray);

        return;
      }

      zeroBuffer(nextBuffer);
      copyBuffer(nextBuffer, multiChannelArray);

      bufferSource.buffer = nextBuffer;
      bufferSource.connect(audioContext.destination);
      bufferSource.start(nextSchedule);

      // All BufferSource data that is currently queued will be stored at the AudioContext, via bufferSource.start().
      // This is for cancelAll() to effectively cancel all BufferSource queued at the AudioContext.
      queuedBufferSources.push(bufferSource);

      nextSchedule += nextBuffer.duration;

      bufferSource.addEventListener('ended', () => {
        queuedBufferSources = queuedBufferSources.filter(target => target !== bufferSource);

        // Declare the buffer is free to pick up on the next iteration.
        freeBuffers.push(nextBuffer);
        playNext();
      });
    }
  };

  return {
    cancelAll: () => {
      queue.splice(0);

      // Although all buffers are cleared, there are still some BufferSources queued at the AudioContext that need to be stopped.
      queuedBufferSources.forEach(bufferSource => bufferSource.stop());
    },
    flush: () => new Promise(resolve => queue.push(resolve)),
    push: multiChannelArray => {
      if (!multiChannelArray) {
        throw new Error('multiChannelArray must not be falsy.');
      }

      queue.push(multiChannelArray);

      playNext();
    }
  };
}
