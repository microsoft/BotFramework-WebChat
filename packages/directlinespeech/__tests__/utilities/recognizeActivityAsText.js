import readCognitiveServicesAudioStreamAsWAVArrayBuffer from './readCognitiveServicesAudioStreamAsRiffWaveArrayBuffer';
import recognizeRiffWaveArrayBuffer from './recognizeRiffWaveArrayBuffer';

export default async function recognizeActivityAsText(activity, { fetchCredentials }) {
  const { audioStream } = activity.channelData?.speechSynthesisUtterance;

  if (audioStream) {
    const riffWAVBuffer = await readCognitiveServicesAudioStreamAsWAVArrayBuffer(audioStream);

    return await recognizeRiffWaveArrayBuffer(riffWAVBuffer, { fetchCredentials });
  }
}
