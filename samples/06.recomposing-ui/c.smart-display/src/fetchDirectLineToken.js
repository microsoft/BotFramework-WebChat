export default async function () {
  const res = await fetch(
    'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline',
    { method: 'POST' }
  );
  const { token } = await res.json();

  return token;
}
