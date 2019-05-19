const generateDirectLineToken = require('../../generateDirectLineToken');

const { DIRECT_LINE_SECRET } = process.env;

module.exports = async (_, res) => {
  res.json({ token: await generateDirectLineToken(DIRECT_LINE_SECRET) });
};
