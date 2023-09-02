export default function getURLProtocol(url: URL): string;
export default function getURLProtocol(url: string): string | undefined;

export default function getURLProtocol(url: string | URL): string | undefined {
  try {
    return new URL(url).protocol;
  } catch (error) {
    // Return undefined.
  }
}
