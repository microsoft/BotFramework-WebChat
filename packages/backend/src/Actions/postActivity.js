const POST_ACTIVITY = 'DIRECT_LINE/POST_ACTIVITY';

export default function (activity) {
  return {
    type: POST_ACTIVITY,
    payload: { activity }
  };
}

export { POST_ACTIVITY }
