"use strict";
var rxjs_1 = require('@reactivex/rxjs');
var directLineTypes_1 = require('./directLineTypes');
var intervalRefreshToken = 29 * 60 * 1000;
var DirectLine = (function () {
    function DirectLine(secretOrToken, domain) {
        var _this = this;
        if (domain === void 0) { domain = "https://directline.botframework.com"; }
        this.domain = domain;
        this.connected$ = new rxjs_1.BehaviorSubject(false);
        this.postMessage = function (text, from, channelData) {
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/api/conversations/" + _this.conversationId + "/messages",
                body: {
                    text: text,
                    from: from,
                    conversationId: _this.conversationId,
                    channelData: channelData
                },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "BotConnector " + _this.token
                }
            })
                .retryWhen(function (error$) { return error$.delay(1000); })
                .mapTo(true);
        };
        this.postFile = function (file) {
            var formData = new FormData();
            formData.append('file', file);
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/api/conversations/" + _this.conversationId + "/upload",
                body: formData,
                headers: {
                    "Authorization": "BotConnector " + _this.token
                }
            })
                .retryWhen(function (error$) { return error$.delay(1000); })
                .mapTo(true);
        };
        this.getActivities = function () {
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
                        attachments: dlm.images && dlm.images.map(function (path) { return ({
                            contentType: directLineTypes_1.mimeTypes[path.split('.').pop()],
                            contentUrl: _this.domain + path,
                            name: '2009-09-21'
                        }); })
                    };
                }
            });
        };
        this.activitiesGenerator = function (subscriber, watermark) {
            _this.getActivityGroup(watermark).subscribe(function (messageGroup) {
                var someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
                if (someMessages)
                    subscriber.next(rxjs_1.Observable.from(messageGroup.messages));
                setTimeout(function () { return _this.activitiesGenerator(subscriber, messageGroup && messageGroup.watermark); }, someMessages && messageGroup.watermark ? 0 : 3000);
            }, function (error) { return subscriber.error(error); });
        };
        this.getActivityGroup = function (watermark) {
            if (watermark === void 0) { watermark = ""; }
            return rxjs_1.Observable.ajax({
                method: "GET",
                url: _this.domain + "/api/conversations/" + _this.conversationId + "/messages?watermark=" + watermark,
                headers: {
                    "Accept": "application/json",
                    "Authorization": "BotConnector " + _this.token
                }
            })
                .retryWhen(function (error$) { return error$.delay(1000); })
                .map(function (ajaxResponse) { return ajaxResponse.response; });
        };
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
                            "Accept": "application/json",
                            "Authorization": "BotConnector " + _this.token
                        }
                    })
                        .retryWhen(function (error$) { return error$.delay(1000); })
                        .map(function (ajaxResponse) { return ajaxResponse.response; });
                }).subscribe(function (token) {
                    console.log("refreshing token", token);
                    _this.token = token;
                });
            }
        });
        this.activities$ = this.connected$
            .filter(function (connected) { return connected === true; })
            .flatMap(function (_) { return _this.getActivities(); });
    }
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map