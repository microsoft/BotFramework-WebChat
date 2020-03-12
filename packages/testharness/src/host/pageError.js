import { post } from '../jobs';

export default async function pageError({ message, stack }) {
  await post({
    type: 'pageerror',
    payload: {
      error: {
        message,
        stack
      }
    }
  });
}
