"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var intervalRefreshToken = 29 * 60 * 1000;
var DirectLine = (function () {
    function DirectLine(secretOrToken, domain) {
        var _this = this;
        if (domain === void 0) { domain = "https://directline.botframework.com"; }
        this.domain = domain;
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.token = secretOrToken.secret || secretOrToken.token;
        rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/api/conversations",
            headers: {
                "Accept": "application/json",
                "Authorization": "BotConnector " + this.token
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
                        url: _this.domain + "/api/tokens/" + _this.conversationId + "/renew",
                        headers: {
                            "Authorization": "BotConnector " + _this.token
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
            .flatMap(function (_) { return _this.getActivities(); });
    }
    DirectLine.prototype.postMessage = function (text, from, channelData) {
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/api/conversations/" + this.conversationId + "/messages",
            body: {
                text: text,
                from: from.id,
                conversationId: this.conversationId,
                channelData: channelData
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": "BotConnector " + this.token
            }
        })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .mapTo(true);
    };
    DirectLine.prototype.postFile = function (file) {
        var formData = new FormData();
        formData.append('file', file);
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/api/conversations/" + this.conversationId + "/upload",
            body: formData,
            headers: {
                "Authorization": "BotConnector " + this.token
            }
        })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .mapTo(true);
    };
    DirectLine.prototype.getActivities = function () {
        var _this = this;
        return new rxjs_1.Observable(function (subscriber) {
            return _this.activitiesGenerator(subscriber);
        })
            .concatAll()
            .do(function (dlm) { return console.log("DL Message", dlm); })
            .map(function (dlm) {
            if (dlm.channelData) {
                var channelData = dlm.channelData;
                switch (channelData.type) {
                    case "message":
                        return Object.assign({}, channelData, {
                            id: dlm.id,
                            conversation: { id: dlm.conversationId },
                            timestamp: dlm.created,
                            from: { id: dlm.from },
                            channelData: null,
                        });
                    default:
                        return channelData;
                }
            }
            else {
                return {
                    type: "message",
                    id: dlm.id,
                    conversation: { id: dlm.conversationId },
                    timestamp: dlm.created,
                    from: { id: dlm.from },
                    text: dlm.text,
                    textFormat: "markdown",
                    eTag: dlm.eTag,
                    attachments: dlm.images && dlm.images.map(function (path) { return {
                        contentType: "image/png",
                        contentUrl: _this.domain + path,
                        name: '2009-09-21'
                    }; })
                };
            }
        });
    };
    DirectLine.prototype.activitiesGenerator = function (subscriber, watermark) {
        var _this = this;
        this.getActivityGroup(watermark).subscribe(function (messageGroup) {
            var someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
            if (someMessages)
                subscriber.next(rxjs_1.Observable.from(messageGroup.messages));
            setTimeout(function () { return _this.activitiesGenerator(subscriber, messageGroup && messageGroup.watermark); }, someMessages && messageGroup.watermark ? 0 : 1000);
        }, function (error) {
            return subscriber.error(error);
        });
    };
    DirectLine.prototype.getActivityGroup = function (watermark) {
        if (watermark === void 0) { watermark = ""; }
        return rxjs_1.Observable.ajax({
            method: "GET",
            url: this.domain + "/api/conversations/" + this.conversationId + "/messages?watermark=" + watermark,
            headers: {
                "Accept": "application/json",
                "Authorization": "BotConnector " + this.token
            }
        })
            .retryWhen(function (error$) { return error$.delay(1000); })
            .map(function (ajaxResponse) { return ajaxResponse.response; });
    };
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=DirectLine.js.map