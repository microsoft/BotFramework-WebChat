"use strict";
const chai_1 = require('chai');
const chaiSubset = require('chai-subset');
const Store_1 = require('../src/Store');
var window;
chai_1.use(chaiSubset);
describe('test', () => {
    it('should work', () => {
        chai_1.expect(null).to.equal(null);
    });
});
describe('history', () => {
    it('should start with an empty history', () => {
        chai_1.expect(Store_1.history(undefined, { type: undefined })).to.containSubset({
            activities: [],
            selectedActivity: null
        });
    });
});
