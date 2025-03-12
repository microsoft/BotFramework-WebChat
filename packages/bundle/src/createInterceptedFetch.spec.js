import createInterceptedFetch from './createInterceptedFetch';

describe('createInterceptedFetch', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn(() => Promise.resolve({ ok: true, status: 200 }));
  });

  it('should return a function', () => {
    const interceptedFetch = createInterceptedFetch(mockFetch);
    expect(typeof interceptedFetch).toBe('function');
  });

  it('should call original fetch with the same URL and options if hostname does not match', async () => {
    const interceptedFetch = createInterceptedFetch(mockFetch, {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    const url = 'https://other.com/path';
    const options = { headers: {} };
    await interceptedFetch(url, options);

    expect(mockFetch).toHaveBeenCalledWith(url, options);
  });

  it('should modify request headers when hostname matches', async () => {
    const interceptedFetch = createInterceptedFetch(mockFetch, {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    const url = 'https://example.com/api/data';
    const options = { headers: {} };
    await interceptedFetch(url, options);

    expect(options.headers['directline_token']).toBe('test-token');
    expect(mockFetch).toHaveBeenCalledWith(url, options);
  });

  it('should preserve existing headers when modifying request', async () => {
    const interceptedFetch = createInterceptedFetch(mockFetch, {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    const url = 'https://example.com/api/data';
    const options = { headers: { 'Content-Type': 'application/json' } };
    await interceptedFetch(url, options);

    expect(options.headers['directline_token']).toBe('test-token');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(mockFetch).toHaveBeenCalledWith(url, options);
  });

  it('should return the response from original fetch', async () => {
    const mockResponse = { ok: true, status: 200 };
    mockFetch.mockResolvedValueOnce(mockResponse);

    const interceptedFetch = createInterceptedFetch(mockFetch);
    const response = await interceptedFetch('https://test.com', {
      hostname: 'example.com',
      directlineToken: 'test-token'
    });

    expect(response).toBe(mockResponse);
  });
});
