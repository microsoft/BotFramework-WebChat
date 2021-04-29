import createWebDriverProxy from '../../common/proxies/webDriverProxy';
import rpc from '../../common/rpc';
import webDriverPort from './webDriverPort';

export default function webDriverProxy() {
  return (
    window.webDriverProxy || (window.webDriverProxy = rpc('webDriverProxy', createWebDriverProxy(), [window, webDriverPort()]))
  );
}
