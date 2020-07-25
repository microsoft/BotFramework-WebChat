import { post } from '../jobs';

export default async function done(options) {
  await post({
    type: 'done',
    payload: { ...options }
  });
}
