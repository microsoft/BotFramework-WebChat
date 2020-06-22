import { post } from '../jobs';

export default async function sendShiftTab() {
  return await post({
    type: 'send shift tab'
  });
}
