import readCognitiveServicesAudioStreamAsWAVArrayBuffer from './readCognitiveServicesAudioStreamAsRiffWaveArrayBuffer';
import recognizeRiffWaveArrayBuffer from './recognizeRiffWaveArrayBuffer';

export default async function recognizeActivityAsText(activity) {
  const riffWAVBuffer = await readCognitiveServicesAudioStreamAsWAVArrayBuffer(
    activity.channelData.speechSynthesisUtterance.audioStream
  );

  return await recognizeRiffWaveArrayBuffer(riffWAVBuffer);
}
