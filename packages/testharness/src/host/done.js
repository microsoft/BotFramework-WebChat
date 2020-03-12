import { post } from '../jobs';

export default async function done() {
  await post({
    type: 'done'
  });
}
