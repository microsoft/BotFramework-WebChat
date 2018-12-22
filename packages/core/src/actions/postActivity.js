import { FULFILLED, PENDING, REJECTED } from 'redux-promise-middleware';

const POST_ACTIVITY = 'DIRECT_LINE/POST_ACTIVITY';
export const POST_ACTIVITY_FULFILLED = `${ POST_ACTIVITY }_${ FULFILLED }`;
export const POST_ACTIVITY_PENDING = `${ POST_ACTIVITY }_${ PENDING }`;
export const POST_ACTIVITY_REJECTED = `${ POST_ACTIVITY }_${ REJECTED }`;

export default function (activity, via = 'keyboard') {
  return {
    type: POST_ACTIVITY,
    meta: { via },
    payload: { activity }
  };
}

export {
  POST_ACTIVITY
}
