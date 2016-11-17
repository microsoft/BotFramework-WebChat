"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var BotConnection_1 = require('./BotConnection');
var Chat_1 = require('./Chat');
var intervalRefreshToken = 29 * 60 * 1000;
var timeout = 5 * 1000;
var DirectLine = (function () {
    function DirectLine(secretOrToken, domain) {
        if (domain === void 0) { domain = "https://directline.botframework.com/v3/directline"; }
        this.domain = domain;
        this.watermark = '';
        this.secret = secretOrToken.secret;
        this.token = secretOrToken.secret || secretOrToken.token;
        this.connectionStatus$ = new rxjs_1.BehaviorSubject(BotConnection_1.ConnectionStatus.Connecting);
        this.activity$ = this.getActivity$();
    }
    DirectLine.prototype.start = function () {
        var _this = this;
        this.conversationSubscription = rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/conversations",
            timeout: timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .retryWhen(function (error$) { return error$
            .mergeMap(function (error) {
            return error.status >= 400 && error.status <= 599
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of(error);
        })
            .delay(5 * 1000); })
            .subscribe(function (conversation) {
            _this.conversationId = conversation.conversationId;
            _this.token = _this.secret || conversation.token;
            _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Online);
            if (!_this.secret)
                _this.RefreshToken();
        }, function (error) {
            _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Offline);
        });
    };
    DirectLine.prototype.RefreshToken = function () {
        var _this = this;
        this.tokenRefreshSubscription = this.connectionStatus$
            .filter(function (connectionStatus) { return connectionStatus === BotConnection_1.ConnectionStatus.Online; })
            .flatMap(function (_) { return rxjs_1.Observable.ajax({
            method: "POST",
            url: _this.domain + "/tokens/refresh",
            timeout: timeout,
            headers: {
                "Authorization": "Bearer " + _this.token
            }
        }); })
            .take(1)
            .map(function (ajaxResponse) { return ajaxResponse.response.token; })
            .retryWhen(function (error$) { return error$
            .mergeMap(function (error) {
            return error.status === 403
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of(error);
        })
            .delay(5 * 1000); })
            .repeatWhen(function (completed) { return completed.delay(intervalRefreshToken); })
            .subscribe(function (token) {
            Chat_1.konsole.log("refreshing token", token, "at", new Date());
            _this.token = token;
        }, function (error) {
            _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Offline);
        });
    };
    DirectLine.prototype.end = function () {
        if (this.conversationSubscription) {
            this.conversationSubscription.unsubscribe();
            this.conversationSubscription = undefined;
        }
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
        return this.connectionStatus$
            .filter(function (connectionStatus) { return connectionStatus === BotConnection_1.ConnectionStatus.Online; })
            .flatMap(function (_) { return rxjs_1.Observable.from(message.attachments || []); })
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
            .flatMap(function (_) { return rxjs_1.Observable.ajax({
            method: "POST",
            url: _this.domain + "/conversations/" + _this.conversationId + "/upload?userId=" + message.from.id,
            body: formData,
            timeout: timeout,
            headers: {
                "Authorization": "Bearer " + _this.token
            }
        }); })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; })
            .catch(function (error) {
            Chat_1.konsole.log("postMessageWithAttachments error", error);
            return error.status >= 400 && error.status < 500
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of("retry");
        });
    };
    DirectLine.prototype.postActivity = function (activity) {
        var _this = this;
        return this.connectionStatus$
            .filter(function (connectionStatus) { return connectionStatus === BotConnection_1.ConnectionStatus.Online; })
            .flatMap(function (_) { return rxjs_1.Observable.ajax({
            method: "POST",
            url: _this.domain + "/conversations/" + _this.conversationId + "/activities",
            body: activity,
            timeout: timeout,
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + _this.token
            }
        }); })
            .map(function (ajaxResponse) { return ajaxResponse.response.id; })
            .catch(function (error) {
            return error.status >= 400 && error.status < 500
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of("retry");
        });
    };
    DirectLine.prototype.getActivity$ = function () {
        var _this = this;
        return this.connectionStatus$
            .filter(function (connectionStatus) { return connectionStatus === BotConnection_1.ConnectionStatus.Online; })
            .flatMap(function (_) { return rxjs_1.Observable.ajax({
            method: "GET",
            url: _this.domain + "/conversations/" + _this.conversationId + "/activities?watermark=" + _this.watermark,
            timeout: timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + _this.token
            }
        }); })
            .take(1)
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .flatMap(function (activityGroup) {
            _this.watermark = activityGroup.watermark;
            return rxjs_1.Observable.from(activityGroup.activities);
        })
            .repeatWhen(function (completed) { return completed.delay(1000); })
            .retryWhen(function (error$) { return error$
            .mergeMap(function (error) {
            if (error.status === 403) {
                _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Offline);
                return rxjs_1.Observable.throw(error);
            }
            else {
                return rxjs_1.Observable.of(error);
            }
        })
            .delay(5 * 1000); });
    };
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map