"use strict";
var rxjs_1 = require('@reactivex/rxjs');
// An experimental feature. The idea is to allow two instances of botchat on a page, A and B
// A sends and receives messages to and from the bot, as normal
// B sends and receives backchannel messages to and from the bot using A as a proxy
var BrowserLine = (function () {
    function BrowserLine() {
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.postMessage = function (text, from, channelData) {
            return rxjs_1.Observable.of(true);
        };
        this.postFile = function (file) {
            return rxjs_1.Observable.of(true);
        };
        this.getActivities = function () { return rxjs_1.Observable.of({
            type: "message"
        }); };
        this.connected$.next(true);
        this.activities$ = this.getActivities();
    }
    return BrowserLine;
}());
exports.BrowserLine = BrowserLine;
//# sourceMappingURL=browserLine.js.map