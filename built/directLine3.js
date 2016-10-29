"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var intervalRefreshToken = 29 * 60 * 1000;
var DirectLine3 = (function () {
    function DirectLine3(secretOrToken, domain, segment) {
        var _this = this;
        if (domain === void 0) { domain = "https://directline.botframework.com"; }
        this.domain = domain;
        this.segment = segment;
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.token = secretOrToken.secret || secretOrToken.token;
        rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/" + this.segment + "/conversations",
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .subscribe(function (conversation) {
            _this.conversationId = conversation.conversationId;
            _this.connected$.next(true);
            if (!secretOrToken.secret) {
                rxjs_1.Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(function (_) {
                    return rxjs_1.Observable.ajax({
                        method: "GET",
                        url: _this.domain + "/" + _this.segment + "/tokens/" + _this.conversationId + "/refresh",
                        headers: {
                            "Authorization": "Bearer " + _this.token
                        }
                    })
                        .retryWhen(function (error$) { return error$.delay(1000); })
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
    }
    DirectLine3.prototype.postMessage = function (text, from, channelData) {
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/" + this.segment + "/conversations/" + this.conversationId + "/activities",
            body: {
                type: "message",
                text: text,
                from: from,
                conversationId: this.conversationId,
                channelData: channelData
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; });
    };
    DirectLine3.prototype.postFile = function (file, from) {
        var formData = new FormData();
        formData.append('file', file);
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/" + this.segment + "/conversations/" + this.conversationId + "/upload?userId=" + from.id,
            body: formData,
            headers: {
                "Authorization": "Bearer " + this.token,
                "Content-Type": file.type,
                "Content-Disposition": file.name
            }
        })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; });
    };
    DirectLine3.prototype.getActivity$ = function () {
        var _this = this;
        return new rxjs_1.Observable(function (subscriber) {
            return _this.activitiesGenerator(subscriber);
        })
            .concatAll()
            .do(function (activity) { return console.log("Activity", activity); });
    };
    DirectLine3.prototype.activitiesGenerator = function (subscriber, watermark) {
        var _this = this;
        this.getActivityGroup(watermark).subscribe(function (activityGroup) {
            var someMessages = activityGroup && activityGroup.activities && activityGroup.activities.length > 0;
            if (someMessages)
                subscriber.next(rxjs_1.Observable.from(activityGroup.activities));
            setTimeout(function () { return _this.activitiesGenerator(subscriber, activityGroup && activityGroup.watermark); }, someMessages && activityGroup.watermark ? 0 : 1000);
        }, function (error) {
            return subscriber.error(error);
        });
    };
    DirectLine3.prototype.getActivityGroup = function (watermark) {
        if (watermark === void 0) { watermark = ""; }
        return rxjs_1.Observable.ajax({
            method: "GET",
            url: this.domain + "/" + this.segment + "/conversations/" + this.conversationId + "/activities?watermark=" + watermark,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .map(function (ajaxResponse) { return ajaxResponse.response; });
    };
    return DirectLine3;
}());
exports.DirectLine3 = DirectLine3;
//# sourceMappingURL=directLine3.js.map