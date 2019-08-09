import clickMicrophoneButton from './clickMicrophoneButton';
import dispatchAction from './dispatchAction';
import endSpeechSynthesize from './endSpeechSynthesize';
import executePromiseScript from './executePromiseScript';
import getNumActivitiesShown from './getNumActivitiesShown';
import getSendBoxText from './getSendBoxText';
import getStore from './getStore';
import hasPendingSpeechSynthesisUtterance from './hasPendingSpeechSynthesisUtterance';
import hasSpeechRecognitionStartCalled from './hasSpeechRecognitionStartCalled';
import isDictating from './isDictating';
import pingBot from './pingBot';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import sendFile from './sendFile';
import sendMessageViaMicrophone from './sendMessageViaMicrophone';
import sendMessageViaSendBox from './sendMessageViaSendBox';
import setSendBoxText from './setSendBoxText';
import startSpeechSynthesize from './startSpeechSynthesize';

function mapMap(map, mapper) {
  return Object.keys(map).reduce((final, key) => {
    final[key] = mapper.call(map, map[key], key);

    return final;
  }, {});
}

export default function pageObjects(driver) {
  // We will not export page objects under /elements/ folder
  // The /elements/ folder is designed to hold "get elements" function internal to page objects

  return mapMap(
    {
      clickMicrophoneButton,
      dispatchAction,
      endSpeechSynthesize,
      executePromiseScript,
      getNumActivitiesShown,
      getSendBoxText,
      getStore,
      hasPendingSpeechSynthesisUtterance,
      isDictating,
      hasSpeechRecognitionStartCalled,
      pingBot,
      putSpeechRecognitionResult,
      sendFile,
      sendMessageViaMicrophone,
      sendMessageViaSendBox,
      setSendBoxText,
      startSpeechSynthesize
    },
    fn => fn.bind(null, driver)
  );
}
