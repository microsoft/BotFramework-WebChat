const UPSERT_ACTIVITY = 'DIRECT_LINE/UPSERT_ACTIVITY';

export default function (activity) {
  return {
    type: UPSERT_ACTIVITY,
    payload: { activity }
  };
}

export { UPSERT_ACTIVITY }
