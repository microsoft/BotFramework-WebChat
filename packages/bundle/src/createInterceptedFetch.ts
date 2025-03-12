function createInterceptedFetch(originalFetch: typeof window.fetch, fetchOptions?: { [key: string]: any }) {
  return async function customFetch(url, options) {
    const urlObj = new URL(url);
    // Modify request (optional)
    if (fetchOptions?.hostname && urlObj.hostname === fetchOptions.hostname) {
      options.headers['directline_token'] = fetchOptions.directlineToken;
    }

    const response = await originalFetch(url, options);

    return response;
  };
}
export default createInterceptedFetch;
