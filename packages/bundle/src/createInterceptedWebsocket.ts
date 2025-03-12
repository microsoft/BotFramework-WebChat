function createInterceptedWebSocket(originalWebSocket: typeof window.WebSocket, fetchOptions?: { [key: string]: any }) {
  return function (url: string, protocols?: string | string[]) {
    // Modify the request to include custom headers using a WebSocket handshake
    const modifiedUrl = new URL(url);
    if (fetchOptions?.hostname && modifiedUrl.hostname === fetchOptions.hostname) {
      modifiedUrl.searchParams.append('directline_token', fetchOptions.directlineToken);
    }

    const ws = new originalWebSocket(modifiedUrl.toString(), protocols);

    return ws;
  } as any;
}

export default createInterceptedWebSocket;
