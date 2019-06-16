const { createHash } = require('crypto');

const { AAD_OAUTH_PKCE_SALT } = process.env;

// Creating a PKCE code verifier based on salt and seed.
// We are using seed and salt to simplify the creation of PKCE code in a distributed manner.
module.exports = seed => {
  const hash = createHash('sha512');

  hash.update(seed);
  hash.update(AAD_OAUTH_PKCE_SALT);

  return hash.digest().toString('base64');
};
