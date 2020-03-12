import { post } from '../jobs';

export default async function snapshot() {
  await post({
    type: 'snapshot'
  });
}
