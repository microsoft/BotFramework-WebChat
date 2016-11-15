"use strict";
(function (ConnectionStatus) {
    ConnectionStatus[ConnectionStatus["Connecting"] = 0] = "Connecting";
    ConnectionStatus[ConnectionStatus["Online"] = 1] = "Online";
    ConnectionStatus[ConnectionStatus["Offline"] = 2] = "Offline";
})(exports.ConnectionStatus || (exports.ConnectionStatus = {}));
var ConnectionStatus = exports.ConnectionStatus;
//# sourceMappingURL=BotConnection.js.map