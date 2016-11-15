"use strict";
var localizedStrings = {
    'en-us': {
        title: "Chat",
        send: "Send",
        unknownFile: "[File of type '%1']",
        unknownCard: "[Unknown Card '%1']",
        receiptTax: "Tax",
        receiptTotal: "Total",
        messageRetry: "retry",
        messageFailed: "couldn't send",
        messageSending: "sending",
        timeSent: " at %1",
    }
};
// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')
exports.strings = function (locale) {
    return localizedStrings['en-us'];
};
//# sourceMappingURL=Strings.js.map