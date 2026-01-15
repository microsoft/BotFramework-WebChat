export default async function fetchDirectLineAppServiceExtensionToken() {
  const res = await fetch(
    'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directlinease',
    { method: 'POST' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch Direct Line App Service Extension token.');
  }

  const { domain, token } = await res.json();

  return { domain, token };
}
