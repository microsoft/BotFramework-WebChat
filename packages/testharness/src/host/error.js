import { post } from '../jobs';

export default async function error({ message, stack }) {
  await post({
    type: 'error',
    payload: {
      error: {
        message,
        stack
      }
    }
  });
}
