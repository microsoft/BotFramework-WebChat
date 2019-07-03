module.exports = ({ access_token, error }, origin) =>
  error
    ? `<!DOCTYPE html><html><head><title></title><script>location.href='/?${new URLSearchParams(
        { error }
      )}';</script></head><body></body></html>`
    : `<!DOCTYPE html><html><head><title></title><script>sessionStorage.setItem('OAUTH_ACCESS_TOKEN', '${access_token}', '${origin}');location.href='/';</script></head><body></body></html>`;
