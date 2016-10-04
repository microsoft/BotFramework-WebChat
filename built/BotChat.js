"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require('react');
var rxjs_1 = require('@reactivex/rxjs');
var directLine_1 = require('./directLine');
var History_1 = require('./History');
var Console_1 = require('./Console');
var DebugView_1 = require('./DebugView');
// Visibility state of the DebugView panel
(function (DebugViewState) {
    DebugViewState[DebugViewState["disabled"] = 0] = "disabled";
    DebugViewState[DebugViewState["enabled"] = 1] = "enabled";
    DebugViewState[DebugViewState["visible"] = 2] = "visible";
})(exports.DebugViewState || (exports.DebugViewState = {}));
var DebugViewState = exports.DebugViewState;
var guid = function () {
    var s4 = function () { return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1); };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};
var outgoingMessage$ = new rxjs_1.Subject();
var console$ = new rxjs_1.Subject();
var consoleStart = { text: "", enableSend: true };
var incomingActivity$ = function (conversation) {
    return directLine_1.getActivities(conversation);
};
var activities$ = function (conversation, userId) {
    return incomingActivity$(conversation)
        .merge(outgoingMessage$)
        .scan(function (activities, activity) { return activities.concat([activity]); }, [])
        .startWith([]);
};
var autoscroll$ = new rxjs_1.Subject();
var debugViewState$ = new rxjs_1.Subject();
var selectedActivity$ = new rxjs_1.Subject();
var state$ = function (conversation, userId, debugViewState) {
    return activities$(conversation, userId)
        .combineLatest(autoscroll$.distinctUntilChanged().startWith(true), debugViewState$.distinctUntilChanged().startWith(debugViewState), selectedActivity$.distinctUntilChanged().startWith(undefined), console$.startWith(consoleStart), function (activities, autoscroll, debugViewState, selectedActivity, console) { return ({
        conversation: conversation,
        activities: activities,
        autoscroll: autoscroll,
        debugViewState: debugViewState,
        selectedActivity: selectedActivity,
        console: console
    }); })
        .do(function (state) { return console.log("state", state); });
};
var conversation$ = directLine_1.startConversation;
var UI = (function (_super) {
    __extends(UI, _super);
    function UI() {
        var _this = this;
        _super.call(this);
        this.historyActions = {
            buttonImBack: function (text) {
                directLine_1.postMessage(text, _this.state.conversation, _this.state.userId)
                    .retry(2)
                    .subscribe(function () {
                    outgoingMessage$.next({
                        type: "message",
                        text: text,
                        from: { id: _this.state.userId },
                        timestamp: Date.now().toString()
                    });
                }, function (error) {
                    console.log("failed to post message");
                });
            },
            buttonOpenUrl: function (text) {
                console.log("open URL", text);
            },
            buttonPostBack: function (text) {
                directLine_1.postMessage(text, _this.state.conversation, _this.state.userId)
                    .retry(2)
                    .subscribe(function () {
                    console.log("quietly posted message to bot", text);
                }, function (error) {
                    console.log("failed to post message");
                });
            },
            buttonSignIn: function (text) {
                console.log("sign in", text);
            },
            setAutoscroll: function (autoscroll) {
                autoscroll$.next(autoscroll);
            },
            onMessageClicked: function (message, e) {
                selectedActivity$.next(message);
                e.preventDefault();
                e.stopPropagation();
            }
        };
        this.consoleActions = {
            updateMessage: function (text) {
                console$.next({ text: text, enableSend: _this.state.console.enableSend });
            },
            sendMessage: function () {
                console$.next({ text: _this.state.console.text, enableSend: false });
                directLine_1.postMessage(_this.state.console.text, _this.state.conversation, _this.state.userId)
                    .retry(2)
                    .subscribe(function () {
                    outgoingMessage$.next({
                        type: "message",
                        text: _this.state.console.text,
                        from: { id: _this.state.userId },
                        timestamp: Date.now().toString()
                    });
                    console$.next({
                        text: "",
                        enableSend: true
                    });
                    autoscroll$.next(true);
                }, function (error) {
                    console.log("failed to post message");
                    console$.next({ text: _this.state.console.text, enableSend: true });
                });
            },
            sendFile: function (files) {
                var _loop_1 = function(i, numFiles) {
                    var file = files[i];
                    directLine_1.postFile(file, _this.state.conversation)
                        .retry(2)
                        .subscribe(function () {
                        var path = window.URL.createObjectURL(file);
                        outgoingMessage$.next({
                            type: "message",
                            text: _this.state.console.text,
                            from: { id: _this.state.userId },
                            timestamp: Date.now().toString(),
                            attachments: [{
                                    contentType: directLine_1.mimeTypes[path.split('.').pop()],
                                    contentUrl: path,
                                    name: 'Your file here'
                                }]
                        });
                    }, function (error) {
                        console.log("failed to post file");
                    });
                };
                for (var i = 0, numFiles = files.length; i < numFiles; i++) {
                    _loop_1(i, numFiles);
                }
            }
        };
        this.state = {
            userId: guid(),
            conversation: null,
            activities: [],
            autoscroll: true,
            console: consoleStart
        };
    }
    UI.prototype.componentWillMount = function () {
        var _this = this;
        var debug = this.props.debug && this.props.debug.toLowerCase();
        var debugViewState = DebugViewState.disabled;
        if (debug === DebugViewState[DebugViewState.enabled])
            debugViewState = DebugViewState.enabled;
        else if (debug === DebugViewState[DebugViewState.visible])
            debugViewState = DebugViewState.visible;
        conversation$(this.props.appSecret)
            .flatMap(function (conversation) { return state$(conversation, _this.state.userId, debugViewState); })
            .subscribe(function (state) { return _this.setState(state); }, function (error) { return console.log("errors", error); });
    };
    UI.prototype.toggleDebugView = function () {
        var newState;
        if (this.isDebuggerVisible()) {
            newState = DebugViewState.enabled;
        }
        else if (this.isDebuggerEnabled()) {
            newState = DebugViewState.visible;
        }
        else {
            newState = DebugViewState.disabled;
        }
        if (newState !== DebugViewState.visible) {
            selectedActivity$.next(null);
        }
        debugViewState$.next(newState);
    };
    UI.prototype.isDebuggerVisible = function () {
        return this.state.debugViewState === DebugViewState.visible;
    };
    UI.prototype.isDebuggerEnabled = function () {
        return this.state.debugViewState !== DebugViewState.disabled;
    };
    UI.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {className: "wc-app"}, 
            React.createElement("div", {className: "wc-chatview-panel" + (this.isDebuggerVisible() ? " wc-withdebugview" : "")}, 
                React.createElement("div", {className: "wc-header"}, 
                    React.createElement("span", null, "WebChat"), 
                    React.createElement("div", {className: "wc-toggledebugview" + (this.isDebuggerEnabled() ? "" : " wc-hidden"), onClick: function () { return _this.toggleDebugView(); }}, 
                        React.createElement("svg", {width: "20", height: "20", viewBox: "0 0 1792 1792"}, 
                            React.createElement("rect", {id: "panel", height: "1152.159352", width: "642.020858", y: "384.053042", x: "959.042634"}), 
                            React.createElement("path", {id: "frame", d: "m224,1536l608,0l0,-1152l-640,0l0,1120q0,13 9.5,22.5t22.5,9.5zm1376,-32l0,-1120l-640,0l0,1152l608,0q13,0 22.5,-9.5t9.5,-22.5zm128,-1216l0,1216q0,66 -47,113t-113,47l-1344,0q-66,0 -113,-47t-47,-113l0,-1216q0,-66 47,-113t113,-47l1344,0q66,0 113,47t47,113z"}))
                    )), 
                React.createElement(History_1.History, {activities: this.state.activities, autoscroll: this.state.autoscroll, actions: this.historyActions, userId: this.state.userId, selectedActivity: this.state.selectedActivity, debuggerVisible: this.isDebuggerVisible()}), 
                React.createElement(Console_1.Console, __assign({actions: this.consoleActions}, this.state.console))), 
            React.createElement("div", {className: "wc-debugview-panel" + (this.isDebuggerVisible() ? "" : " wc-hidden")}, 
                React.createElement("div", {className: "wc-header"}, 
                    React.createElement("span", null, "Debug")
                ), 
                React.createElement(DebugView_1.DebugView, {activity: this.state.selectedActivity}))));
    };
    return UI;
}(React.Component));
exports.UI = UI;
//# sourceMappingURL=BotChat.js.map