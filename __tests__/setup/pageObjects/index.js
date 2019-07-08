import dispatchAction from './dispatchAction';
import executePromiseScript from './executePromiseScript';
import getMicrophoneButton from './getMicrophoneButton';
import getSendBoxTextBox from './getSendBoxTextBox';
import isPendingSpeechSynthesis from './isPendingSpeechSynthesis';
import isRecognizingSpeech from './isRecognizingSpeech';
import peekSpeechSynthesisUtterance from './peekSpeechSynthesisUtterance';
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
      dispatchAction,
      executePromiseScript,
      getMicrophoneButton,
      getSendBoxTextBox,
      isPendingSpeechSynthesis,
      isRecognizingSpeech,
      peekSpeechSynthesisUtterance,
      pingBot,
      putSpeechRecognitionResult,
      sendMessageViaSendBox,
      takeSpeechSynthesizeUtterance
    },
    fn => fn.bind(null, driver)
  );
}
