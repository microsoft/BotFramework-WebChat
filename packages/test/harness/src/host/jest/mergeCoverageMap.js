const { createCoverageMap } = require('istanbul-lib-coverage');

module.exports = function mergeCoverageMap(...coverageMaps) {
  const map = createCoverageMap();

  const addFileCoverage = map.addFileCoverage.bind(map);

  coverageMaps.forEach(coverageMap => Object.values(coverageMap || {}).forEach(addFileCoverage));

  // map.toJSON() does not return a plain object but a serializable object.
  // Jest expects a plain object, thus, we need to stringify/parse to make it a pure JSON.
  // Otherwise, Jest will throw "Invalid file coverage object, missing keys, found:data".
  return JSON.parse(JSON.stringify(map.toJSON()));
};
