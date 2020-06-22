import { post } from '../jobs';

export default async function sendTab() {
  return await post({
    type: 'send tab'
  });
}
