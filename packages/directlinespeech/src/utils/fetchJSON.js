/* eslint-env node */
const fetch = require('node-fetch');

// Helper function for fetching network resource as JSON
module.exports = async function fetchJSON(url, options) {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      accept: 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch JSON from server due to ${res.status}`);
  }
  const json = await res.json();
  return json;
};
