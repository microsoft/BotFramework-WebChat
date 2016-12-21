"use strict";
var ConnectionStatus;
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Uninitialized"] = 0] = "Uninitialized";
    ConnectionStatus[ConnectionStatus["Connecting"] = 1] = "Connecting";
    ConnectionStatus[ConnectionStatus["Online"] = 2] = "Online";
    ConnectionStatus[ConnectionStatus["ExpiredToken"] = 3] = "ExpiredToken";
    ConnectionStatus[ConnectionStatus["FailedToConnect"] = 4] = "FailedToConnect";
    ConnectionStatus[ConnectionStatus["Ended"] = 5] = "Ended"; // the bot ended the conversation
})(ConnectionStatus = exports.ConnectionStatus || (exports.ConnectionStatus = {}));
//# sourceMappingURL=BotConnection.js.map