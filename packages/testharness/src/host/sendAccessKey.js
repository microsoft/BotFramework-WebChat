import { post } from '../jobs';

export default async function sendAccessKey(key) {
  return await post({
    payload: {
      key
    },
    type: 'send access key'
  });
}
