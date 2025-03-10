const generateDirectLineToken = require('../../generateDirectLineToken');

const crypto = require('crypto');
const { promisify } = require('util');

const randomBytesAsync = promisify(crypto.randomBytes);

const { DIRECT_LINE_SECRET } = process.env;

// GET /api/directline/token
// Generates a new Direct Line token
module.exports = async (_, res) => {
  // Generate a random user ID to use for DirectLine token
  const randomUserId = await generateRandomUserId();

  res.json({ token: await generateDirectLineToken(DIRECT_LINE_SECRET, randomUserId) });
};

// Generates a random user ID
// Prefixed with "dl_", as required by the Direct Line API
async function generateRandomUserId() {
  const buffer = await randomBytesAsync(16);
  return `dl_${buffer.toString('hex')}`;
}