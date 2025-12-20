import InternalNativeAPI from './InternalNativeAPI';

function createNativeAPI(): InternalNativeAPI {
  return new InternalNativeAPI();
}

export default createNativeAPI;
