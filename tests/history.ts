import { expect, use } from 'chai';
import chaiSubset = require('chai-subset');
import { history, HistoryState, HistoryAction } from '../src/Store';

use(chaiSubset);

describe('history', () => {
    it('should start with an empty history', () => {
        expect(history(undefined, { type: undefined })).to.containSubset({
            activities: [],
            selectedActivity: null
        });
    });
})
