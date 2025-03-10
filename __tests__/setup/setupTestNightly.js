test.nightly = process.env.CI_PULL_REQUEST ? test.skip.bind(test) : test;
