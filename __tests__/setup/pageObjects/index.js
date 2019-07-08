import clickMicrophoneButton from './clickMicrophoneButton';
import dispatchAction from './dispatchAction';
import pingBot from './pingBot';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import sendMessageViaSendBox from './sendMessageViaSendBox';
import takeSpeechSynthesizeUtterance from './takeSpeechSynthesizeUtterance';

function mapMap(map, mapper) {
  return Object.keys(map).reduce((final, key) => {
    final[key] = mapper.call(map, map[key], key);

    return final;
  }, {});
}

export default function pageObjects(driver) {
  return mapMap(
    {
      clickMicrophoneButton,
      dispatchAction,
      pingBot,
      putSpeechRecognitionResult,
      sendMessageViaSendBox,
      takeSpeechSynthesizeUtterance
    },
    fn => fn.bind(null, driver)
  );
}
