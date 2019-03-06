export default async function (fn, retries) {
  let lastErr;

  for (; retries >= 0; retries--) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
    }
  }

  throw lastErr;
}
