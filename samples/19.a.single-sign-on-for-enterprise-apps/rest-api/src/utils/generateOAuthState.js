const crypto = require('crypto');

module.exports = function generateOAuthState(seed, salt) {
  const hash = crypto.createHash('sha384');

  hash.update(seed);
  hash.update(salt);

  return hash.digest('hex').substr(0, 10);
}
