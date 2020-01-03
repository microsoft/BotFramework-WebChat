module.exports = ({ access_token, error }, origin) =>
  error
    ? // Instead of alerting the error (e.g. user cancelled, organization denied access), you should handle the error and escalate the problem.
      `<!DOCTYPE html><html><head><title></title><script>alert('${error}');</script></head><body></body></html>`
    : `<!DOCTYPE html><html><head><title></title><script>sessionStorage.setItem('OAUTH_ACCESS_TOKEN', '${access_token}', '${origin}');location.href='/';</script></head><body></body></html>`;
