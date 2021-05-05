import host from '../proxies/host';
import rpc from '../../common/rpc';
import webDriverPort from './webDriverPort';

/** Assigns remote `host` object from Jest to global. */
export default function () {
  return window.host || (window.host = rpc('host', host(), [window, webDriverPort()]));
}
