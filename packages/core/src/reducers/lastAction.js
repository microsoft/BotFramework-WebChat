/* eslint-disable default-case */
import { POST_ACTIVITY_FULFILLED, POST_ACTIVITY_PENDING, POST_ACTIVITY_REJECTED } from '../actions/postActivity';

const DEFAULT_STATE = '';

// eslint-disable-next-line no-unused-vars
export default function(state = DEFAULT_STATE, { payload, type }) {
  switch (type) {
    case POST_ACTIVITY_FULFILLED:
    case POST_ACTIVITY_PENDING:
    case POST_ACTIVITY_REJECTED:
      state = type;
  }

  return state;
}
