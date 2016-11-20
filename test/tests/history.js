"use strict";
const chai_1 = require('chai');
const chaiSubset = require('chai-subset');
const Store_1 = require('../src/Store');
chai_1.use(chaiSubset);
describe('history', () => {
    it('should start with an empty history', () => {
        chai_1.expect(Store_1.history(undefined, { type: undefined })).to.containSubset({
            activities: [],
            selectedActivity: null
        });
    });
});
