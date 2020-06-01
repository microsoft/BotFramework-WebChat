import { post } from '../jobs';

export default async function sendKeys(...keys) {
  return await post({
    payload: {
      keys
    },
    type: 'send keys'
  });
}
