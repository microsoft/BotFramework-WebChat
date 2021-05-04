import createHost from '../../common/proxies/host';
import rpc from '../../common/rpc';
import webDriverPort from './webDriverPort';

export default function host() {
  return (
    window.host || (window.host = rpc('host', createHost(), [window, webDriverPort()]))
  );
}
