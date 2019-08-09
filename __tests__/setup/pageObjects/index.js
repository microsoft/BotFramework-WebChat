import clickMicrophoneButton from './clickMicrophoneButton';
import clickSendButton from './clickSendButton';
import clickSuggestedActionButton from './clickSuggestedActionButton';
import dispatchAction from './dispatchAction';
import endSpeechSynthesize from './endSpeechSynthesize';
import executePromiseScript from './executePromiseScript';
import getNumActivitiesShown from './getNumActivitiesShown';
import getSendBoxText from './getSendBoxText';
import getStore from './getStore';
import hasFocusOnSendBoxTextBox from './hasFocusOnSendBoxTextBox';
import hasPendingSpeechSynthesisUtterance from './hasPendingSpeechSynthesisUtterance';
import hasSpeechRecognitionStartCalled from './hasSpeechRecognitionStartCalled';
import isDictating from './isDictating';
import pingBot from './pingBot';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import sendFile from './sendFile';
import sendMessageViaMicrophone from './sendMessageViaMicrophone';
import sendMessageViaSendBox from './sendMessageViaSendBox';
import startSpeechSynthesize from './startSpeechSynthesize';
import typeOnSendBox from './typeOnSendBox';

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
      clickSendButton,
      clickSuggestedActionButton,
      dispatchAction,
      endSpeechSynthesize,
      executePromiseScript,
      getNumActivitiesShown,
      getSendBoxText,
      getStore,
      hasFocusOnSendBoxTextBox,
      hasPendingSpeechSynthesisUtterance,
      hasSpeechRecognitionStartCalled,
      isDictating,
      pingBot,
      putSpeechRecognitionResult,
      sendFile,
      sendMessageViaMicrophone,
      sendMessageViaSendBox,
      typeOnSendBox,
      startSpeechSynthesize
    },
    fn => fn.bind(null, driver)
  );
}
