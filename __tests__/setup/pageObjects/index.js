import dispatchAction from './dispatchAction';
import hideCursor from './hideCursor';
import pingBot from './pingBot';
import sendMessageViaSendBox from './sendMessageViaSendBox';

function mapMap(map, mapper) {
  return Object.keys(map).reduce((final, key) => {
    final[key] = mapper.call(map, map[key], key);

    return final;
  }, {});
}

export default function (driver) {
  return mapMap({
    dispatchAction,
    hideCursor,
    pingBot,
    sendMessageViaSendBox
  }, fn => fn.bind(null, driver));
}
