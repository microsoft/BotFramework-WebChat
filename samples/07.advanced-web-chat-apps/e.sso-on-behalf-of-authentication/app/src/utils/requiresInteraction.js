export default function({ errorCode }) {
  if (!errorCode || !errorCode.length) {
    return false;
  }

  return (
    !!~errorCode.indexOf('consent_required') ||
    !!~errorCode.indexOf('interaction_required') ||
    !!~errorCode.indexOf('login_required')
  );
}
