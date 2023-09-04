export default function getURLProtocol(urlLike: string): string | undefined {
  try {
    return new URL(urlLike).protocol;
  } catch (error) {
    // Return undefined.
  }
}
