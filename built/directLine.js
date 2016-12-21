"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var rxjs_1 = require("@reactivex/rxjs");
var BotConnection_1 = require("./BotConnection");
var Chat_1 = require("./Chat");
var lifetimeRefreshToken = 30 * 60 * 1000;
var intervalRefreshToken = lifetimeRefreshToken / 2;
var timeout = 5 * 1000;
var retries = (lifetimeRefreshToken - intervalRefreshToken) / timeout;
var errorExpiredToken = new Error("expired token");
var errorConversationEnded = new Error("conversation ended");
var errorFailedToConnect = new Error("failed to connect");
var DirectLine = (function () {
    function DirectLine(options) {
        this.connectionStatus$ = new rxjs_1.BehaviorSubject(BotConnection_1.ConnectionStatus.Uninitialized);
        this.domain = "https://directline.botframework.com/v3/directline";
        this.webSocket = false;
        this.watermark = '';
        this.secret = options.secret;
        this.token = options.secret || options.token;
        if (options.domain)
            this.domain = options.domain;
        if (options.webSocket)
            this.webSocket = options.webSocket;
        this.activity$ = this.webSocket && WebSocket !== undefined
            ? this.webSocketActivity$()
            : this.pollingGetActivity$();
    }
    // Every time we're about to make a Direct Line REST call, we call this first to see check the current connection status.
    // Either throws an error (indicating an error state) or emits a null, indicating a (presumably) healthy connection
    DirectLine.prototype.checkConnection = function (once) {
        var _this = this;
        if (once === void 0) { once = false; }
        var obs = this.connectionStatus$
            .flatMap(function (connectionStatus) {
            if (connectionStatus === BotConnection_1.ConnectionStatus.Uninitialized) {
                _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Connecting);
                return _this.startConversation()
                    .do(function (conversation) {
                    _this.conversationId = conversation.conversationId;
                    _this.token = _this.secret || conversation.token;
                    _this.streamUrl = conversation.streamUrl;
                    if (!_this.secret)
                        _this.refreshTokenLoop();
                    _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Online);
                }, function (error) {
                    _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.FailedToConnect);
                })
                    .mapTo(connectionStatus);
            }
            else {
                return rxjs_1.Observable.of(connectionStatus);
            }
        })
            .filter(function (connectionStatus) { return connectionStatus != BotConnection_1.ConnectionStatus.Uninitialized && connectionStatus != BotConnection_1.ConnectionStatus.Connecting; })
            .flatMap(function (connectionStatus) {
            switch (connectionStatus) {
                case BotConnection_1.ConnectionStatus.Ended:
                    return rxjs_1.Observable.throw(errorConversationEnded);
                case BotConnection_1.ConnectionStatus.FailedToConnect:
                    return rxjs_1.Observable.throw(errorFailedToConnect);
                case BotConnection_1.ConnectionStatus.ExpiredToken:
                    return rxjs_1.Observable.throw(errorExpiredToken);
                default:
                    return rxjs_1.Observable.of(null);
            }
        });
        return once ? obs.take(1) : obs;
    };
    DirectLine.prototype.startConversation = function () {
        return rxjs_1.Observable.ajax({
            method: "POST",
            url: this.domain + "/conversations",
            timeout: timeout,
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer " + this.token
            }
        })
            .map(function (ajaxResponse) { return ajaxResponse.response; })
            .retryWhen(function (error$) {
            // for now we deem 4xx and 5xx errors as unrecoverable
            // for everything else (timeouts), retry for a while
            return error$.mergeMap(function (error) { return error.status >= 400 && error.status < 600
                ? rxjs_1.Observable.throw(error)
                : rxjs_1.Observable.of(error); })
                .delay(timeout)
                .take(retries);
        });
    };
    DirectLine.prototype.refreshTokenLoop = function () {
        var _this = this;
        this.tokenRefreshSubscription = rxjs_1.Observable.interval(intervalRefreshToken)
            .flatMap(function (_) { return _this.refreshToken(); })
            .subscribe(function (token) {
            Chat_1.konsole.log("refreshing token", token, "at", new Date());
            _this.token = token;
        });
    };
    DirectLine.prototype.refreshToken = function () {
        var _this = this;
        return this.checkConnection(true)
            .flatMap(function (_) {
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/tokens/refresh",
                timeout: timeout,
                headers: {
                    "Authorization": "Bearer " + _this.token
                }
            })
                .map(function (ajaxResponse) { return ajaxResponse.response.token; })
                .retryWhen(function (error$) { return error$
                .mergeMap(function (error) {
                if (error.status === 403) {
                    // if the token is expired there's no reason to keep trying
                    _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.ExpiredToken);
                    return rxjs_1.Observable.throw(error);
                }
                return rxjs_1.Observable.of(error);
            })
                .delay(timeout)
                .take(retries); });
        });
    };
    DirectLine.prototype.reconnect = function (conversation) {
        this.token = conversation.token;
        this.streamUrl = conversation.streamUrl;
        if (this.connectionStatus$.getValue() === BotConnection_1.ConnectionStatus.ExpiredToken)
            this.connectionStatus$.next(BotConnection_1.ConnectionStatus.Online);
    };
    DirectLine.prototype.end = function () {
        if (this.tokenRefreshSubscription)
            this.tokenRefreshSubscription.unsubscribe();
    };
    // There are two ways to send activities to Direct Line
    // 1. For messages with attachments that are local files (e.g. an image to upload) we use this
    // 2. For the rest, we use postActivity
    // Technically we could use this for all activities, but postActivity is much lighter weight
    // So, since WebChat is partially a reference implementation of Direct Line, we do both.
    DirectLine.prototype.postMessageWithAttachments = function (message) {
        var _this = this;
        var formData;
        var attachments = message.attachments, newMessage = __rest(message, ["attachments"]);
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        return this.checkConnection(true)
            .flatMap(function (_) {
            // To send this message to DirectLine we need to deconstruct it into a "template" activity
            // and one blob for each attachment.
            formData = new FormData();
            formData.append('activity', new Blob([JSON.stringify(newMessage)], { type: 'application/vnd.microsoft.activity' }));
            return rxjs_1.Observable.from(attachments || [])
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
                .count();
        })
            .flatMap(function (_) {
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/conversations/" + _this.conversationId + "/upload?userId=" + message.from.id,
                body: formData,
                timeout: timeout,
                headers: {
                    "Authorization": "Bearer " + _this.token
                }
            })
                .map(function (ajaxResponse) { return ajaxResponse.response.id; })
                .catch(function (error) { return _this.catchPostError(error); });
        })
            .catch(function (error) { return _this.catchPostError(error); });
    };
    DirectLine.prototype.postActivity = function (activity) {
        var _this = this;
        // If we're not connected to the bot, get connected
        // Will throw an error if we are not connected
        Chat_1.konsole.log("postActivity", activity);
        return this.checkConnection(true)
            .flatMap(function (_) {
            return rxjs_1.Observable.ajax({
                method: "POST",
                url: _this.domain + "/conversations/" + _this.conversationId + "/activities",
                body: activity,
                timeout: timeout,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + _this.token
                }
            })
                .map(function (ajaxResponse) { return ajaxResponse.response.id; })
                .catch(function (error) { return _this.catchPostError(error); });
        })
            .catch(function (error) { return _this.catchExpiredToken(error); });
    };
    DirectLine.prototype.catchPostError = function (error) {
        if (error.status === 403)
            // token has expired (will fall through to return "retry")
            this.connectionStatus$.next(BotConnection_1.ConnectionStatus.ExpiredToken);
        else if (error.status >= 400 && error.status < 500)
            // more unrecoverable errors
            return rxjs_1.Observable.throw(error);
        return rxjs_1.Observable.of("retry");
    };
    DirectLine.prototype.catchExpiredToken = function (error) {
        return error === errorExpiredToken
            ? rxjs_1.Observable.of("retry")
            : rxjs_1.Observable.throw(error);
    };
    DirectLine.prototype.pollingGetActivity$ = function () {
        var _this = this;
        return rxjs_1.Observable.interval(1000)
            .combineLatest(this.checkConnection())
            .flatMap(function (_) {
            return rxjs_1.Observable.ajax({
                method: "GET",
                url: _this.domain + "/conversations/" + _this.conversationId + "/activities?watermark=" + _this.watermark,
                timeout: timeout,
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + _this.token
                }
            })
                .catch(function (error) {
                if (error.status === 403) {
                    // This is slightly ugly. We want to update this.connectionStatus$ to ExpiredToken so that subsequent
                    // calls to checkConnection will throw an error. But when we do so, it causes this.checkConnection()
                    // to immediately throw an error, which is caught by the catch() below and transformed into an empty
                    // object. Then next() returns, and we emit an empty object. Which means one 403 is causing
                    // two empty objects to be emitted. Which is harmless but, again, slightly ugly.
                    _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.ExpiredToken);
                }
                return rxjs_1.Observable.empty();
            })
                .map(function (ajaxResponse) { return ajaxResponse.response; })
                .flatMap(function (activityGroup) { return _this.observableFromActivityGroup(activityGroup); });
        })
            .catch(function (error) { return rxjs_1.Observable.empty(); });
    };
    DirectLine.prototype.observableFromActivityGroup = function (activityGroup) {
        if (activityGroup.watermark)
            this.watermark = activityGroup.watermark;
        return rxjs_1.Observable.from(activityGroup.activities);
    };
    DirectLine.prototype.webSocketActivity$ = function () {
        var _this = this;
        return this.checkConnection()
            .flatMap(function (_) {
            return _this.observableWebSocket()
                .retryWhen(function (error$) { return error$.mergeMap(function (error) { return _this.reconnectToConversation(); }); });
        })
            .flatMap(function (activityGroup) { return _this.observableFromActivityGroup(activityGroup); });
    };
    // Originally we used Observable.webSocket, but it's fairly opionated  and I ended up writing
    // a lot of code to work around their implemention details. Since WebChat is meant to be a reference
    // implementation, I decided roll the below, where the logic is more purposeful. - @billba
    DirectLine.prototype.observableWebSocket = function () {
        var _this = this;
        return rxjs_1.Observable.create(function (subscriber) {
            Chat_1.konsole.log("creating WebSocket", _this.streamUrl);
            var ws = new WebSocket(_this.streamUrl);
            var sub;
            ws.onopen = function (open) {
                Chat_1.konsole.log("WebSocket open", open);
                // Chrome is pretty bad at noticing when a WebSocket connection is broken.
                // If we periodically ping the server with empty messages, it helps Chrome 
                // realize when connection breaks, and close the socket. We then throw an
                // error, and that give us the opportunity to attempt to reconnect.
                sub = rxjs_1.Observable.interval(timeout).subscribe(function (_) { return ws.send(null); });
            };
            ws.onclose = function (close) {
                Chat_1.konsole.log("WebSocket close", close);
                if (sub)
                    sub.unsubscribe();
                subscriber.error(close);
            };
            ws.onmessage = function (message) { return message.data && subscriber.next(JSON.parse(message.data)); };
            // This is the 'unsubscribe' method, which is called when this observable is disposed.
            // When the WebSocket closes itself, we throw an error, and this function is eventually called.
            // When the observable is closed first (e.g. when tearing down a WebChat instance) then 
            // we need to manually close the WebSocket.
            return function () {
                if (ws.readyState === 0 || ws.readyState === 1)
                    ws.close();
            };
        });
    };
    DirectLine.prototype.reconnectToConversation = function () {
        var _this = this;
        return this.checkConnection(true)
            .flatMap(function (_) {
            return rxjs_1.Observable.ajax({
                method: "GET",
                url: _this.domain + "/conversations/" + _this.conversationId + "?watermark=" + _this.watermark,
                timeout: timeout,
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + _this.token
                }
            })
                .do(function (result) {
                _this.token = result.response.token;
                _this.streamUrl = result.response.streamUrl;
            })
                .mapTo(null)
                .retryWhen(function (error$) { return error$
                .mergeMap(function (error) {
                if (error.status === 403) {
                    // token has expired. We can't recover from this here, but the embedding
                    // website might eventually call reconnect() with a new token and streamUrl.
                    _this.connectionStatus$.next(BotConnection_1.ConnectionStatus.ExpiredToken);
                }
                return rxjs_1.Observable.of(error);
            })
                .delay(timeout)
                .take(retries); });
        });
    };
    return DirectLine;
}());
exports.DirectLine = DirectLine;
//# sourceMappingURL=directLine.js.map