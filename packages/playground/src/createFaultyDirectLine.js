import { Observable } from 'rxjs';

import 'rxjs/observable/throw';

import { createDirectLine } from 'botframework-webchat';

export default function createFaultyDirectLine(directLineOptions) {
  const underlying = createDirectLine(directLineOptions);
  const { postActivity: workingPostActivity } = underlying;

  underlying.postActivity = activity => {
    if (underlying.faulty) {
      console.warn('Sending artificial error');

      return Observable.throw(new Error('artificial error'));
    } else {
      return workingPostActivity.call(underlying, activity);
    }
  };

  underlying.setFaulty = nextFaulty => {
    underlying.faulty = nextFaulty;
  };

  return underlying;
}
