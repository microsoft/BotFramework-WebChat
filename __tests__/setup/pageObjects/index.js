import clickMicrophoneButton from './clickMicrophoneButton';
import dispatchAction from './dispatchAction';
import pingBot from './pingBot';
import sendMessageViaSendBox from './sendMessageViaSendBox';

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
      sendMessageViaSendBox
    },
    fn => fn.bind(null, driver)
  );
}
