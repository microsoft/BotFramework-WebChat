import dispatchAction from './dispatchAction';
import endSpeechSynthesize from './endSpeechSynthesize';
import executePromiseScript from './executePromiseScript';
import getMicrophoneButton from './getMicrophoneButton';
import getSendBoxTextBox from './getSendBoxTextBox';
import getStore from './getStore';
import hasPendingSpeechSynthesisUtterance from './hasPendingSpeechSynthesisUtterance';
import isRecognizingSpeech from './isRecognizingSpeech';
import pingBot from './pingBot';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import sendMessageViaMicrophone from './sendMessageViaMicrophone';
import sendMessageViaSendBox from './sendMessageViaSendBox';
import startSpeechSynthesize from './startSpeechSynthesize';

function mapMap(map, mapper) {
  return Object.keys(map).reduce((final, key) => {
    final[key] = mapper.call(map, map[key], key);

    return final;
  }, {});
}

export default function pageObjects(driver) {
  return mapMap(
    {
      dispatchAction,
      endSpeechSynthesize,
      executePromiseScript,
      getMicrophoneButton,
      getSendBoxTextBox,
      getStore,
      hasPendingSpeechSynthesisUtterance,
      isRecognizingSpeech,
      pingBot,
      putSpeechRecognitionResult,
      sendMessageViaMicrophone,
      sendMessageViaSendBox,
      startSpeechSynthesize
    },
    fn => fn.bind(null, driver)
  );
}
