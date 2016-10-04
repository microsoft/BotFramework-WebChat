"use strict";
var rxjs_1 = require('@reactivex/rxjs');
/*
// DL V3

const domain = "https://ic-dandris-scratch.azurewebsites.net";
const baseUrl = `${domain}/V3/directline/conversations`;
*/
// DL v1 
var domain = "https://directline.botframework.com";
var baseUrl = domain + "/api/conversations";
exports.startConversation = function (appSecret) {
    return rxjs_1.Observable
        .ajax({
        method: "POST",
        url: "" + baseUrl,
        headers: {
            "Accept": "application/json",
            "Authorization": "BotConnector " + appSecret
        }
    })
        .do(function (ajaxResponse) { return console.log("conversation ajaxResponse", ajaxResponse); })
        .retryWhen(function (error$) { return error$.delay(1000); })
        .map(function (ajaxResponse) { return Object.assign({}, ajaxResponse.response, { userId: 'foo' }); });
};
exports.postMessage = function (text, conversation, userId) {
    return rxjs_1.Observable
        .ajax({
        method: "POST",
        url: baseUrl + "/" + conversation.conversationId + "/messages",
        body: {
            text: text,
            from: userId,
            conversationId: conversation.conversationId
        },
        headers: {
            "Content-Type": "application/json",
            "Authorization": "BotConnector " + conversation.token
        }
    })
        .retryWhen(function (error$) { return error$.delay(1000); })
        .map(function (ajaxResponse) { return true; });
};
exports.postFile = function (file, conversation) {
    var formData = new FormData();
    formData.append('file', file);
    return rxjs_1.Observable
        .ajax({
        method: "POST",
        url: baseUrl + "/" + conversation.conversationId + "/upload",
        body: formData,
        headers: {
            "Authorization": "BotConnector " + conversation.token
        }
    })
        .retryWhen(function (error$) { return error$.delay(1000); })
        .map(function (ajaxResponse) { return true; });
};
exports.mimeTypes = {
    png: 'image/png',
    jpg: 'image/jpg',
    jpeg: 'image/jpeg'
};
exports.getActivities = function (conversation) {
    return new rxjs_1.Observable(function (subscriber) {
        return activitiesGenerator(conversation, subscriber);
    })
        .concatAll()
        .do(function (dlm) { return console.log("DL Message", dlm); })
        .map(function (dlm) {
        if (dlm.channelData) {
            switch (dlm.channelData.type) {
                case "message":
                    return Object.assign({}, dlm.channelData, {
                        id: dlm.id,
                        conversation: { id: dlm.conversationId },
                        timestamp: dlm.created,
                        from: { id: dlm.from },
                        channelData: null,
                    });
                default:
                    return dlm.channelData;
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
                    contentType: exports.mimeTypes[path.split('.').pop()],
                    contentUrl: domain + path,
                    name: '2009-09-21'
                }); })
            };
        }
    });
};
var activitiesGenerator = function (conversation, subscriber, watermark) {
    getActivityGroup(conversation, watermark).subscribe(function (messageGroup) {
        var someMessages = messageGroup && messageGroup.messages && messageGroup.messages.length > 0;
        if (someMessages)
            subscriber.next(rxjs_1.Observable.from(messageGroup.messages));
        setTimeout(function () { return activitiesGenerator(conversation, subscriber, messageGroup && messageGroup.watermark); }, someMessages && messageGroup.watermark ? 0 : 3000);
    }, function (error) { return subscriber.error(error); });
};
var getActivityGroup = function (conversation, watermark) {
    if (watermark === void 0) { watermark = ""; }
    return rxjs_1.Observable
        .ajax({
        method: "GET",
        url: baseUrl + "/" + conversation.conversationId + "/messages?watermark=" + watermark,
        headers: {
            "Accept": "application/json",
            "Authorization": "BotConnector " + conversation.token
        }
    })
        .retryWhen(function (error$) { return error$.delay(1000); })
        .map(function (ajaxResponse) { return ajaxResponse.response; });
};
//# sourceMappingURL=directLine.js.map