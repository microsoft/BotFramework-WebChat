import host from '../proxies/host';
import rpc from '../../common/rpc';
import webDriverPort from './webDriverPort';

export default function () {
  return window.host || (window.host = rpc('host', host(), [window, webDriverPort()]));
}
