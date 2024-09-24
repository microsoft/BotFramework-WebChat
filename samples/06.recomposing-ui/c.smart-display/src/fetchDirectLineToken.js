export default async function () {
  const res = await fetch(
    'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline',
    { method: 'POST' }
  );
  const { token } = await res.json();

  return token;
}
