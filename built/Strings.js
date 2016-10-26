"use strict";
var localizedStrings = {
    'en-us': {
        title: "Chat",
        send: "Send"
    }
};
// Returns strings using the "best match available"" locale
// e.g. if 'en-us' is the only supported English locale, then
// strings('en') should return localizedStrings('en-us')
exports.strings = function (locale) {
    return localizedStrings['en-us'];
};
//# sourceMappingURL=Strings.js.map