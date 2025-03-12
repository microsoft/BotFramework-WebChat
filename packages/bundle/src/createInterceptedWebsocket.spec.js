import createInterceptedWebSocket from './createInterceptedWebSocket';

describe('createInterceptedWebSocket', () => {
  let mockWebSocket;

  beforeEach(() => {
    mockWebSocket = jest.fn().mockImplementation((url, protocols) => ({
      url,
      protocols,
      send: jest.fn(),
      close: jest.fn(),
      readyState: 1
    }));
  });

  it('should return a function', () => {
    const interceptedWebSocket = createInterceptedWebSocket(mockWebSocket);
    expect(typeof interceptedWebSocket).toBe('function');
  });

  it('should create a WebSocket with the original URL if hostname does not match', () => {
    const interceptedWebSocket = createInterceptedWebSocket(mockWebSocket, {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    const url = 'wss://other.com/socket';
    const ws = interceptedWebSocket(url);

    expect(mockWebSocket).toHaveBeenCalledWith(url, undefined);
    expect(ws.url).toBe(url);
  });

  it('should modify the WebSocket URL when hostname matches', () => {
    const interceptedWebSocket = createInterceptedWebSocket(mockWebSocket, {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    const url = 'wss://example.com/socket';
    const ws = interceptedWebSocket(url);

    expect(ws.url).toContain('directline_token=test-token');
    expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('directline_token=test-token'), undefined);
  });

  it('should preserve protocols when modifying WebSocket URL', () => {
    const interceptedWebSocket = createInterceptedWebSocket(mockWebSocket, {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    const url = 'wss://example.com/socket';
    const protocols = ['protocol1', 'protocol2'];
    const ws = interceptedWebSocket(url, protocols);

    expect(ws.url).toContain('directline_token=test-token');
    expect(ws.protocols).toEqual(protocols);
    expect(mockWebSocket).toHaveBeenCalledWith(expect.stringContaining('directline_token=test-token'), protocols);
  });

  it('should not modify the WebSocket URL if hostname is not provided', () => {
    const interceptedWebSocket = createInterceptedWebSocket(mockWebSocket, {
      directlineToken: 'test-token'
    });

    const url = 'wss://example.com/socket';
    const ws = interceptedWebSocket(url);

    expect(ws.url).not.toContain('directline_token=test-token');
    expect(mockWebSocket).toHaveBeenCalledWith(url, undefined);
  });

  it('should correctly override the send method', () => {
    const interceptedWebSocket = createInterceptedWebSocket(mockWebSocket);
    const ws = interceptedWebSocket('wss://test.com');
    ws.send('test message');

    expect(ws.send).toHaveBeenCalledWith('test message');
  });
});
