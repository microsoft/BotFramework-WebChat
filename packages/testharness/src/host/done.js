import { post } from '../jobs';

export default async function done({ ignoreConsoleError = false } = {}) {
  await post({
    type: 'done',
    payload: {
      ignoreConsoleError
    }
  });
}
