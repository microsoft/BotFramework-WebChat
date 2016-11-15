"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var intervalRefreshToken = 29 * 60 * 1000;
var timeout = 5 * 1000;
var DirectLine = (function () {
    function DirectLine(secretOrToken, domain) {
        if (domain === void 0) { domain = "https://directline.botframework.com/v3/directline"; }
        this.domain = domain;
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.watermark = '';
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;
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
                        method: "POST",
                        url: _this.domain + "/tokens/refresh",
                        timeout: timeout,
                        headers: {
                            "Authorization": "Bearer " + _this.token
                        }
                    })
                        .map(function (ajaxResponse) { return ajaxResponse.response.token; });
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
    DirectLine.prototype.postMessageWithAttachments = function (message) {
        var _this = this;
        var formData = new FormData();
        formData.append('activity', new Blob([JSON.stringify(Object.assign({}, message, { attachments: undefined }))], { type: 'application/vnd.microsoft.activity' }));
        return rxjs_1.Observable.from(message.attachments || [])
            .flatMap(function (media) {
            return rxjs_1.Observable.ajax({
                method: "GET",
                url: media.contentUrl,
                responseType: 'arraybuffer'
            })
                .do(function (ajaxResponse) {
                return formData.append('file', new Blob([ajaxResponse.response], { type: media.contentType }), media.name);
            });
        })
            .count()
            .flatMap(function (count) {
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/conversations/" + _this.conversationId + "/upload?userId=" + message.from.id,
                body: formData,
                timeout: timeout,
                headers: {
                    "Authorization": "Bearer " + _this.token
                }
            });
        })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; })
            .catch(function (error) {
            console.log("postMessageWithAttachments error", error);
            return error.status >= 400 && error.status < 500
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of("retry");
        });
    };
    DirectLine.prototype.postActivity = function (activity) {
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/conversations/" + this.conversationId + "/activities",
            body: activity,
            timeout: timeout,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; })
            .catch(function (error) {
            return error.status >= 400 && error.status < 500
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of("retry");
        });
    };
    DirectLine.prototype.getActivity$ = function () {
        var _this = this;
        return new rxjs_1.Observable(function (subscriber) {
            return _this.activitiesGenerator(subscriber);
        })
            .concatAll()
            .do(function (activity) { return console.log("Activity", activity); });
    };
    DirectLine.prototype.activitiesGenerator = function (subscriber) {
        var _this = this;
        this.getActivityGroupSubscription = this.getActivityGroup().subscribe(function (activityGroup) {
            _this.watermark = activityGroup.watermark;
            var someMessages = activityGroup && activityGroup.activities && activityGroup.activities.length > 0;
            if (someMessages)
                subscriber.next(rxjs_1.Observable.from(activityGroup.activities));
            _this.pollTimer = setTimeout(function () { return _this.activitiesGenerator(subscriber); }, someMessages && _this.watermark ? 0 : 1000);
        }, function (error) {
            return subscriber.error(error);
        });
    };
    DirectLine.prototype.getActivityGroup = function () {
        return rxjs_1.Observable.ajax({
            method: "GET",
            url: this.domain + "/conversations/" + this.conversationId + "/activities?watermark=" + this.watermark,
            timeout: timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .retryWhen(function (error$) {
            return error$
                .mergeMap(function (error) {
                return error.status === 403
                    ? rxjs_1.Observable.throw(error)
                    : rxjs_1.Observable.of(error);
            })
                .delay(5 * 1000);
        });
    };
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map