import clickMicrophoneButton from './clickMicrophoneButton';
import clickScrollToBottomButton from './clickScrollToBottomButton';
import clickSendButton from './clickSendButton';
import clickSuggestedActionButton from './clickSuggestedActionButton';
import clickToasterHeader from './clickToasterHeader';
import dispatchAction from './dispatchAction';
import endSpeechSynthesize from './endSpeechSynthesize';
import errorSpeechSynthesize from './errorSpeechSynthesize';
import executePromiseScript from './executePromiseScript';
import getConsoleErrors from './getConsoleErrors';
import getConsoleLogs from './getConsoleLogs';
import getConsoleWarnings from './getConsoleWarnings';
import getNotificationText from './getNotificationText';
import getNumActivitiesShown from './getNumActivitiesShown';
import getSendBoxText from './getSendBoxText';
import getStore from './getStore';
import isDictating from './isDictating';
import pingBot from './pingBot';
import playMediaToCompletion from './playMediaToCompletion';
import putSpeechRecognitionResult from './putSpeechRecognitionResult';
import runHook from './runHook';
import scrollToTop from './scrollToTop';
import sendFile from './sendFile';
import sendMessageViaMicrophone from './sendMessageViaMicrophone';
import sendMessageViaSendBox from './sendMessageViaSendBox';
import sendTextToClipboard from './sendTextToClipboard';
import startSpeechSynthesize from './startSpeechSynthesize';
import switchToYouTubeIFRAME from './switchToYouTubeIFRAME';
import typeInSendBox from './typeInSendBox';
import updateProps from './updateProps';

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
      clickScrollToBottomButton,
      clickSendButton,
      clickSuggestedActionButton,
      clickToasterHeader,
      dispatchAction,
      endSpeechSynthesize,
      errorSpeechSynthesize,
      executePromiseScript,
      getConsoleErrors,
      getConsoleLogs,
      getConsoleWarnings,
      getNotificationText,
      getNumActivitiesShown,
      getSendBoxText,
      getStore,
      isDictating,
      pingBot,
      playMediaToCompletion,
      putSpeechRecognitionResult,
      runHook,
      scrollToTop,
      sendFile,
      sendMessageViaMicrophone,
      sendMessageViaSendBox,
      sendTextToClipboard,
      startSpeechSynthesize,
      switchToYouTubeIFRAME,
      typeInSendBox,
      updateProps
    },
    fn => fn.bind(null, driver)
  );
}
