export default function extractHostnameWithSubdomain(urlString: string): string {
  try {
    const { host, port, protocol } = new URL(urlString);

    if (protocol === 'http:' || protocol === 'https:') {
      if (!port) {
        return host.replace(/^www\./iu, '');
      }

      return host;
    }
  } catch (error) {
    // Intentionally left blank, will return `urlString`.
  }

  return urlString;
}
