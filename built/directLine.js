"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var intervalRefreshToken = 29 * 60 * 1000;
var timeout = 10 * 1000;
var DirectLine = (function () {
    function DirectLine(secretOrToken, domain, segment // DEPRECATED will be removed before release
        ) {
        if (domain === void 0) { domain = "https://directline.botframework.com/v3/directline"; }
        this.domain = domain;
        this.segment = segment;
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;
        if (segment) {
            console.log("Support for 'segment' is deprecated and will be removed before release. Please use default domain or pass entire path in domain");
            this.domain += "/" + segment;
        }
    }
    DirectLine.prototype.start = function () {
        var _this = this;
        rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/conversations",
            timeout: timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .do(function (ajaxResponse) { return console.log("conversation ajaxResponse", ajaxResponse.response); })
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .subscribe(function (conversation) {
            _this.conversationId = conversation.conversationId;
            _this.token = _this.secret || conversation.token;
            _this.connected$.next(true);
            if (!_this.secret) {
                _this.tokenRefreshSubscription = rxjs_1.Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(function (_) {
                    return rxjs_1.Observable.ajax({
                        method: "GET",
                        url: _this.domain + "/tokens/refresh",
                        timeout: timeout,
                        headers: {
                            "Authorization": "Bearer " + _this.token
                        }
                    })
                        .map(function (ajaxResponse) { return ajaxResponse.response; });
                }).subscribe(function (token) {
                    console.log("refreshing token", token, "at", new Date());
                    _this.token = token;
                });
            }
        });
        this.activity$ = this.connected$
            .filter(function (connected) { return connected === true; })
            .flatMap(function (_) { return _this.getActivity$(); });
    };
    DirectLine.prototype.end = function () {
        if (this.tokenRefreshSubscription) {
            this.tokenRefreshSubscription.unsubscribe();
            this.tokenRefreshSubscription = undefined;
        }
        if (this.getActivityGroupSubscription) {
            this.getActivityGroupSubscription.unsubscribe();
            this.getActivityGroupSubscription = undefined;
        }
        if (this.pollTimer) {
            clearTimeout(this.pollTimer);
            this.pollTimer = undefined;
        }
    };
    DirectLine.prototype.postMessage = function (text, from, channelData) {
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/conversations/" + this.conversationId + "/activities",
            body: {
                type: "message",
                text: text,
                from: from,
                conversationId: this.conversationId,
                channelData: channelData
            },
            timeout: timeout,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; });
    };
    DirectLine.prototype.postFile = function (file, from) {
        var formData = new FormData();
        formData.append('file', file);
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/conversations/" + this.conversationId + "/upload?userId=" + from.id,
            body: formData,
            timeout: timeout,
            headers: {
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; });
    };
    DirectLine.prototype.getActivity$ = function () {
        var _this = this;
        return new rxjs_1.Observable(function (subscriber) {
            return _this.activitiesGenerator(subscriber);
        })
            .concatAll()
            .do(function (activity) { return console.log("Activity", activity); });
    };
    DirectLine.prototype.activitiesGenerator = function (subscriber, watermark) {
        var _this = this;
        this.getActivityGroupSubscription = this.getActivityGroup(watermark).subscribe(function (activityGroup) {
            var someMessages = activityGroup && activityGroup.activities && activityGroup.activities.length > 0;
            if (someMessages)
                subscriber.next(rxjs_1.Observable.from(activityGroup.activities));
            _this.pollTimer = setTimeout(function () { return _this.activitiesGenerator(subscriber, activityGroup && activityGroup.watermark); }, someMessages && activityGroup.watermark ? 0 : 1000);
        }, function (error) {
            return subscriber.error(error);
        });
    };
    DirectLine.prototype.getActivityGroup = function (watermark) {
        if (watermark === void 0) { watermark = ""; }
        return rxjs_1.Observable.ajax({
            method: "GET",
            url: this.domain + "/conversations/" + this.conversationId + "/activities?watermark=" + watermark,
            timeout: timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response; });
    };
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map