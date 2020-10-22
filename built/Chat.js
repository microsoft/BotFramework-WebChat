"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var React = require("react");
var react_dom_1 = require("react-dom");
var botframework_directlinejs_1 = require("botframework-directlinejs");
var react_redux_1 = require("react-redux");
var getTabIndex_1 = require("./getTabIndex");
var konsole = require("./Konsole");
var SpeechModule_1 = require("./SpeechModule");
var Store_1 = require("./Store");
var react_cookie_1 = require("react-cookie");
var History_1 = require("./History");
var MessagePane_1 = require("./MessagePane");
var Shell_1 = require("./Shell");
var Chat = (function (_super) {
    tslib_1.__extends(Chat, _super);
    function Chat(props) {
        var _this = _super.call(this, props) || this;
        _this.store = Store_1.createStore();
        _this.resizeListener = function () { return _this.setSize(); };
        // tslint:disable:variable-name
        _this._handleCardAction = _this.handleCardAction.bind(_this);
        _this._handleKeyDownCapture = _this.handleKeyDownCapture.bind(_this);
        _this._saveChatviewPanelRef = _this.saveChatviewPanelRef.bind(_this);
        _this._saveHistoryRef = _this.saveHistoryRef.bind(_this);
        _this._saveShellRef = _this.saveShellRef.bind(_this);
        konsole.log('BotChat.Chat props', props);
        _this.store.dispatch({
            type: 'Set_Locale',
            locale: props.locale || window.navigator.userLanguage || window.navigator.language || 'en'
        });
        _this.user = _this.getUser();
        if (typeof props.windowStatus !== 'undefined' && typeof props.windowStatus.visible !== 'undefined') {
            _this.store.dispatch({ type: 'Set_Status', visible: props.windowStatus.visible });
        }
        if (typeof props.chatIconColor !== 'undefined') {
            _this.store.dispatch({ type: 'Set_ChatIcon_Color', chatIconColor: props.chatIconColor });
        }
        if (typeof props.chatIconMessage !== 'undefined' && props.chatIconMessage !== '') {
            _this.store.dispatch({ type: 'Set_ChatIcon_Message', chatIconMessage: props.chatIconMessage });
        }
        if (typeof props.showBrandMessage !== 'undefined') {
            _this.store.dispatch({ type: 'Set_BrandMessage_Status', showBrandMessage: props.showBrandMessage });
            if (typeof props.brandMessage !== 'undefined') {
                _this.store.dispatch({ type: 'Set_BrandMessage', brandMessage: props.brandMessage });
            }
            else {
                _this.store.dispatch({ type: 'Set_BrandMessage', brandMessage: 'Powered by Intelequia' });
            }
        }
        if (typeof props.hideHeader !== 'undefined') {
            _this.store.dispatch({ type: 'Set_HideHeader', hideHeader: props.hideHeader });
        }
        if (props.adaptiveCardsHostConfig) {
            _this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: props.adaptiveCardsHostConfig
            });
        }
        var chatTitle = props.chatTitle;
        if (props.formatOptions) {
            console.warn('DEPRECATED: "formatOptions.showHeader" is deprecated, use "chatTitle" instead. See https://github.com/Microsoft/BotFramework-WebChat/blob/master/CHANGELOG.md#formatoptionsshowheader-is-deprecated-use-chattitle-instead.');
            if (typeof props.formatOptions.showHeader !== 'undefined' && typeof props.chatTitle === 'undefined') {
                chatTitle = props.formatOptions.showHeader;
            }
        }
        if (typeof chatTitle !== 'undefined') {
            _this.store.dispatch({ type: 'Set_Chat_Title', chatTitle: chatTitle });
        }
        if (typeof props.botIconUrl !== 'undefined') {
            _this.store.dispatch({ type: 'Set_BotIcon_Url', botIconUrl: props.botIconUrl });
        }
        _this.store.dispatch({ type: 'Toggle_Upload_Button', showUploadButton: props.showUploadButton === false });
        if (props.sendTyping) {
            _this.store.dispatch({ type: 'Set_Send_Typing', sendTyping: props.sendTyping });
        }
        if (props.speechOptions) {
            SpeechModule_1.Speech.SpeechRecognizer.setSpeechRecognizer(props.speechOptions.speechRecognizer);
            SpeechModule_1.Speech.SpeechSynthesizer.setSpeechSynthesizer(props.speechOptions.speechSynthesizer);
        }
        _this.hasHistory = false; // We dont know yet if it has history indeed
        return _this;
    }
    // tslint:enable:variable-name
    Chat.prototype.getUser = function () {
        var user = tslib_1.__assign({}, this.props.user);
        if (!this.props.user) {
            // Get the cookies bui and bun
            var cookie = new react_cookie_1.Cookies();
            var botUserId = cookie.get('bui');
            var botUserName = cookie.get('bun');
            user.id = botUserId ? botUserId : this.store.getState().format.strings.anonymousUsername + " " + (Math.random() * 1000000).toString().substring(0, 5);
            user.name = botUserName ? botUserName : user.id;
            user.role = 'user';
            // Set the cookies bui and bun
            cookie.set('bui', user.id, { path: '/', maxAge: 14 * 24 * 3600 });
            cookie.set('bun', user.name, { path: '/', maxAge: 14 * 24 * 3600 });
        }
        return user;
    };
    Chat.prototype.handleIncomingActivity = function (activity) {
        var state = this.store.getState();
        switch (activity.type) {
            case 'message':
                this.store.dispatch({ type: activity.from.id === state.connection.user.id ? 'Receive_Sent_Message' : 'Receive_Message', activity: activity });
                break;
            case 'typing':
                if (activity.from.id !== state.connection.user.id) {
                    this.store.dispatch({ type: 'Show_Typing', activity: activity });
                }
                break;
            case 'event':
                if (activity.value.Item1 === 'Set_Status' && !activity.value.Item2) {
                    this.onCloseWindow();
                }
                break;
        }
    };
    Chat.prototype.setSize = function () {
        this.store.dispatch({
            type: 'Set_Size',
            width: this.chatviewPanelRef.offsetWidth,
            height: this.chatviewPanelRef.offsetHeight
        });
    };
    Chat.prototype.handleCardAction = function () {
        try {
            // After the user click on any card action, we will "blur" the focus, by setting focus on message pane
            // This is for after click on card action, the user press "A", it should go into the chat box
            var historyDOM = react_dom_1.findDOMNode(this.historyRef);
            if (historyDOM) {
                historyDOM.focus();
            }
        }
        catch (err) {
            // In Emulator production build, React.findDOMNode(this.historyRef) will throw an exception saying the
            // component is unmounted. I verified we did not miss any saveRef calls, so it looks weird.
            // Since this is an optional feature, I am try-catching this for now. We should find the root cause later.
            //
            // Some of my thoughts, React version-compatibility problems.
        }
    };
    Chat.prototype.handleKeyDownCapture = function (evt) {
        var target = evt.target;
        var tabIndex = getTabIndex_1.getTabIndex(target);
        if (evt.altKey
            || evt.ctrlKey
            || evt.metaKey
            || (!inputtableKey(evt.key) && evt.key !== 'Backspace')) {
            // Ignore if one of the utility key (except SHIFT) is pressed
            // E.g. CTRL-C on a link in one of the message should not jump to chat box
            // E.g. "A" or "Backspace" should jump to chat box
            return;
        }
        if (target === react_dom_1.findDOMNode(this.historyRef)
            || typeof tabIndex !== 'number'
            || tabIndex < 0) {
            evt.stopPropagation();
            var key = void 0;
            // Quirks: onKeyDown we re-focus, but the newly focused element does not receive the subsequent onKeyPress event
            //         It is working in Chrome/Firefox/IE, confirmed not working in Edge/16
            //         So we are manually appending the key if they can be inputted in the box
            if (/(^|\s)Edge\/16\./.test(navigator.userAgent)) {
                key = inputtableKey(evt.key);
            }
            // shellRef is null if Web Chat is disabled
            if (this.shellRef) {
                this.shellRef.focus(key);
            }
        }
    };
    Chat.prototype.saveChatviewPanelRef = function (chatviewPanelRef) {
        this.chatviewPanelRef = chatviewPanelRef;
    };
    Chat.prototype.saveHistoryRef = function (historyWrapper) {
        this.historyRef = historyWrapper && historyWrapper.getWrappedInstance();
    };
    Chat.prototype.saveShellRef = function (shellWrapper) {
        this.shellRef = shellWrapper && shellWrapper.getWrappedInstance();
    };
    Chat.prototype.startConnection = function () {
        var _this = this;
        var botConnection = this.props.directLine
            ? (this.botConnection = new botframework_directlinejs_1.DirectLine(this.props.directLine))
            : this.props.botConnection;
        if (this.props.resize === 'window') {
            window.addEventListener('resize', this.resizeListener);
        }
        this.props.history().then(function (value) {
            if (value.length > 0) {
                _this.store.dispatch({
                    type: 'Set_History',
                    activities: value
                });
                _this.hasHistory = true;
            }
        }).then(function (_) {
            // this.store.dispatch<ChatActions>({ type: 'Start_Connection', user: this.props.user, bot: this.props.bot, botConnection, selectedActivity: this.props.selectedActivity });
            _this.store.dispatch({ type: 'Start_Connection', user: _this.user, bot: _this.props.bot, botConnection: botConnection, selectedActivity: _this.props.selectedActivity });
            _this.connectionStatusSubscription = botConnection.connectionStatus$.subscribe(function (connectionStatus) {
                if (_this.props.speechOptions && _this.props.speechOptions.speechRecognizer) {
                    var refGrammarId = botConnection.referenceGrammarId;
                    if (refGrammarId) {
                        _this.props.speechOptions.speechRecognizer.referenceGrammarId = refGrammarId;
                    }
                }
                if (connectionStatus === botframework_directlinejs_1.ConnectionStatus.Online && !_this.hasHistory) {
                    var cookie = new react_cookie_1.Cookies();
                    var b = botConnection;
                    var conversationId = cookie.get('bci');
                    if (!conversationId && b && b.conversationId) {
                        cookie.set('bci', b.conversationId, { path: '/', maxAge: 14 * 24 * 3600 });
                    }
                    exports.sendEventPostBack(botConnection, 'StartConversation', { locale: _this.props.locale }, _this.user);
                }
                _this.store.dispatch({ type: 'Connection_Change', connectionStatus: connectionStatus });
            });
            _this.activitySubscription = botConnection.activity$.subscribe(function (activity) { return _this.handleIncomingActivity(activity); }, function (error) { return konsole.log('activity$ error', error); });
            if (_this.props.selectedActivity) {
                _this.selectedActivitySubscription = _this.props.selectedActivity.subscribe(function (activityOrID) {
                    _this.store.dispatch({
                        type: 'Select_Activity',
                        selectedActivity: activityOrID.activity || _this.store.getState().history.activities.find(function (activity) { return activity.id === activityOrID.id; })
                    });
                });
            }
        });
    };
    Chat.prototype.componentWillMount = function () {
        this.firstLoad = true;
        this.showChatIconMessage = true;
    };
    Chat.prototype.componentDidMount = function () {
        // Now that we're mounted, we know our dimensions. Put them in the store (this will force a re-render)
        this.setSize();
        if (this.store.getState().windowState.visible) {
            this.startConnection();
        }
        this.firstLoad = false;
        this.showChatIconMessage = false;
    };
    Chat.prototype.componentWillUnmount = function () {
        this.connectionStatusSubscription.unsubscribe();
        this.activitySubscription.unsubscribe();
        if (this.selectedActivitySubscription) {
            this.selectedActivitySubscription.unsubscribe();
        }
        if (this.botConnection) {
            this.botConnection.end();
        }
        window.removeEventListener('resize', this.resizeListener);
    };
    Chat.prototype.componentWillReceiveProps = function (nextProps) {
        if (this.props.adaptiveCardsHostConfig !== nextProps.adaptiveCardsHostConfig) {
            this.store.dispatch({
                type: 'Set_AdaptiveCardsHostConfig',
                payload: nextProps.adaptiveCardsHostConfig
            });
        }
        if (this.props.showUploadButton !== nextProps.showUploadButton) {
            this.store.dispatch({
                type: 'Toggle_Upload_Button',
                showUploadButton: nextProps.showUploadButton
            });
        }
        if (this.props.chatTitle !== nextProps.chatTitle) {
            this.store.dispatch({
                type: 'Set_Chat_Title',
                chatTitle: nextProps.chatTitle
            });
        }
    };
    Chat.prototype.onClickChatIcon = function () {
        var _this = this;
        this.store.dispatch({
            type: 'Set_Status',
            visible: true
        });
        if (!this.store.getState().connection.botConnection) {
            this.props.history().then(function (value) {
                _this.startConnection();
                _this.forceUpdate(); // I had to do this; I don't know why this dispatch doesn't force a re-render
            });
        }
        var cookies = new react_cookie_1.Cookies();
        cookies.set('bco', true, { path: '/', maxAge: 14 * 24 * 3600 });
        this.forceUpdate(); // I had to do this; I don't know why this dispatch doesn't force a re-render
    };
    Chat.prototype.onCloseWindow = function () {
        this.store.dispatch({
            type: 'Set_Status',
            visible: false
        });
        var cookies = new react_cookie_1.Cookies();
        cookies.set('bco', false, { path: '/', maxAge: 14 * 24 * 3600 });
        this.forceUpdate(); // I had to do this; I don't know why this dispatch doesn't force a re-render
    };
    Chat.prototype.onCloseChatMessage = function () {
        this.showChatIconMessage = false;
        this.forceUpdate();
    };
    // At startup we do three render passes:
    // 1. To determine the dimensions of the chat panel (nothing needs to actually render here, so we don't)
    // 2. To determine the margins of any given carousel (we just render one mock activity so that we can measure it)
    // 3. (this is also the normal re-render case) To render without the mock activity
    Chat.prototype.render = function () {
        var state = this.store.getState();
        konsole.log('BotChat.Chat state', state);
        var headerBotIcon = state.format.botIconUrl ? React.createElement("div", { className: "bot-icon", style: { backgroundImage: "url(" + state.format.botIconUrl + ")" } }) : React.createElement("div", null);
        var headerCloseButton = React.createElement("div", { onClick: this.onCloseWindow.bind(this), className: "chat-close-button" },
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 2048 2048" },
                React.createElement("path", { d: "M1115 1024 L1658 1567 Q1677 1586 1677 1612.5 Q1677 1639 1658 1658 Q1639 1676 1612 1676 Q1587 1676 1567 1658 L1024 1115 L481 1658 Q462 1676 436 1676 Q410 1676 390 1658 Q371 1639 371 1612.5 Q371 1586 390 1567 L934 1024 L390 481 Q371 462 371 435.5 Q371 409 390 390 Q410 372 436 372 Q462 372 481 390 L1024 934 L1567 390 Q1587 372 1612 372 Q1639 372 1658 390 Q1677 409 1677 435.5 Q1677 462 1658 481 L1115 1024 Z " })));
        // only render real stuff after we know our dimensions
        return (React.createElement("div", null,
            !!state.format.chatIconMessage &&
                this.showChatIconMessage &&
                React.createElement("div", { className: "chat-button-message " + (state.windowState.visible ? 'open' : 'close') + "-button-" + (this.firstLoad || !state.windowState.visible ? 'no-animate' : 'animate') },
                    React.createElement("div", { className: "chat-button-message-arrow" }),
                    React.createElement("a", { className: "chat-button-message-close", onClick: this.onCloseChatMessage.bind(this) },
                        React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "-38000 0 42000 2048" },
                            React.createElement("path", { d: "M1115 1024 L1658 1567 Q1677 1586 1677 1612.5 Q1677 1639 1658 1658 Q1639 1676 1612 1676 Q1587 1676 1567 1658 L1024 1115 L481 1658 Q462 1676 436 1676 Q410 1676 390 1658 Q371 1639 371 1612.5 Q371 1586 390 1567 L934 1024 L390 481 Q371 462 371 435.5 Q371 409 390 390 Q410 372 436 372 Q462 372 481 390 L1024 934 L1567 390 Q1587 372 1612 372 Q1639 372 1658 390 Q1677 409 1677 435.5 Q1677 462 1658 481 L1115 1024 Z " }))),
                    React.createElement("a", { onClick: this.onClickChatIcon.bind(this) },
                        React.createElement("span", null, state.format.chatIconMessage))),
            React.createElement("div", { className: "chat-button " + (state.windowState.visible ? 'open' : 'close') + "-button-" + (this.firstLoad || !state.windowState.visible ? 'no-animate' : 'animate'), style: { backgroundColor: "" + state.format.chatIconColor } },
                React.createElement("a", { onClick: this.onClickChatIcon.bind(this), className: "chat-button-icon" },
                    React.createElement("span", null,
                        React.createElement("svg", { viewBox: "0 0 256 256" },
                            React.createElement("g", null,
                                React.createElement("path", { id: "path1", transform: "rotate(0,128,128) translate(54,63.7125017642975) scale(4.625,4.625)  ", fill: "#FFFFFF", d: "M22.900024,11.400001C21.600037,11.400001 20.600037,12.400001 20.600037,13.700004 20.600037,14.99999 21.600037,15.999989 22.900024,15.999989 24.200012,15.999989 25.200012,14.99999 25.200012,13.700004 25.100037,12.499992 24.100037,11.400001 22.900024,11.400001z M16,11.400001C14.700012,11.400001 13.700012,12.400001 13.700012,13.700004 13.700012,14.99999 14.700012,15.999989 16,15.999989 17.299988,15.999989 18.299988,14.99999 18.299988,13.700004 18.299988,12.499992 17.299988,11.400001 16,11.400001z M9.1000366,11.400001C7.7999878,11.400001 6.7999878,12.400001 6.7999878,13.700004 6.7999878,14.99999 7.7999878,15.999989 9.1000366,15.999989 10.400024,15.999989 11.400024,14.99999 11.400024,13.700004 11.400024,12.499992 10.400024,11.400001 9.1000366,11.400001z M16,0C24.799988,7.0681381E-08 32,5.6000027 32,12.599997 32,19.499988 24.799988,25.199996 16,25.199996 13.900024,25.199996 11.900024,24.899978 10.100037,24.300002 8.2000122,25.699996 5.1000366,27.8 2.1000366,27.8 3.7000122,26.300002 4.2000122,23.39998 4.2999878,21.199998 1.6000366,18.899981 0,15.899999 0,12.599997 0,5.6000027 7.2000122,7.0681381E-08 16,0z" })))))),
            React.createElement(react_redux_1.Provider, { store: this.store },
                React.createElement("div", { className: "chat-window " + (state.windowState.visible ? 'open' : 'close') + "-chat-" + (this.firstLoad || !state.windowState.visible ? 'no-animate' : 'animate') },
                    React.createElement("div", { className: "wc-chatview-panel", 
                        // className={ `wc-chatview-panel ${state.windowState.visible ? 'open-chat' : this.firstLoad ? 'close-chat-no-animate' : 'close-chat-animate'}` }
                        onKeyDownCapture: this._handleKeyDownCapture, ref: this._saveChatviewPanelRef },
                        !!state.format.chatTitle &&
                            React.createElement("div", { className: "wc-header " + (state.format.hideHeader ? 'wc-hide' : '') },
                                headerBotIcon,
                                React.createElement("span", null, typeof state.format.chatTitle === 'string' ? state.format.chatTitle : state.format.strings.title),
                                headerCloseButton),
                        React.createElement(MessagePane_1.MessagePane, { disabled: this.props.disabled },
                            React.createElement(History_1.History, { disabled: this.props.disabled, onCardAction: this._handleCardAction, ref: this._saveHistoryRef, showBrandMessage: state.format.showBrandMessage })),
                        !this.props.disabled && React.createElement(Shell_1.Shell, { ref: this._saveShellRef, showBrandMessage: state.format.showBrandMessage }),
                        this.props.resize === 'detect' &&
                            React.createElement(ResizeDetector, { onresize: this.resizeListener }),
                        state.format.showBrandMessage && React.createElement("div", { className: "wc-brandmessage" }, state.format.brandMessage))))));
    };
    return Chat;
}(React.Component));
exports.Chat = Chat;
exports.doCardAction = function (botConnection, from, locale, sendMessage) { return function (type, actionValue) {
    var text = (typeof actionValue === 'string') ? actionValue : undefined;
    var value = (typeof actionValue === 'object') ? actionValue : undefined;
    switch (type) {
        case 'imBack':
            if (typeof text === 'string') {
                sendMessage(text, from, locale);
            }
            break;
        case 'postBack':
            exports.sendPostBack(botConnection, text, value, from, locale);
            break;
        case 'call':
        case 'openUrl':
        case 'playAudio':
        case 'playVideo':
        case 'showImage':
        case 'downloadFile':
            window.open(text);
            break;
        case 'signin':
            var loginWindow_1 = window.open();
            if (botConnection.getSessionId) {
                botConnection.getSessionId().subscribe(function (sessionId) {
                    konsole.log('received sessionId: ' + sessionId);
                    loginWindow_1.location.href = text + encodeURIComponent('&code_challenge=' + sessionId);
                }, function (error) {
                    konsole.log('failed to get sessionId', error);
                });
            }
            else {
                loginWindow_1.location.href = text;
            }
            break;
        default:
            konsole.log('unknown button type', type);
    }
}; };
exports.sendPostBack = function (botConnection, text, value, from, locale) {
    botConnection.postActivity({
        type: 'message',
        text: text,
        value: value,
        from: from,
        locale: locale,
        channelData: {
            postback: true
        }
    })
        .subscribe(function (id) { return konsole.log('success sending postBack', id); }, function (error) { return konsole.log('failed to send postBack', error); });
};
exports.sendEventPostBack = function (botConnection, name, value, from) {
    botConnection.postActivity({
        type: 'event',
        name: name,
        value: value,
        from: from,
        channelData: {
            postback: true
        }
    })
        .subscribe(function (id) { return konsole.log('success sending postBack', id); }, function (error) { return konsole.log('failed to send postBack', error); });
};
exports.renderIfNonempty = function (value, renderer) {
    if (value !== undefined && value !== null && (typeof value !== 'string' || value.length > 0)) {
        return renderer(value);
    }
};
exports.classList = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.filter(Boolean).join(' ');
};
// note: container of this element must have CSS position of either absolute or relative
var ResizeDetector = function (props) {
    // adapted to React from https://github.com/developit/simple-element-resize-detector
    return React.createElement("iframe", { style: {
            border: 'none',
            height: '100%',
            left: 0,
            margin: '1px 0 0',
            opacity: 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: '-100%',
            visibility: 'hidden',
            width: '100%'
        }, ref: function (frame) {
            if (frame) {
                frame.contentWindow.onresize = props.onresize;
            }
        } });
};
// For auto-focus in some browsers, we synthetically insert keys into the chatbox.
// By default, we insert keys when:
// 1. evt.key.length === 1 (e.g. "1", "A", "=" keys), or
// 2. evt.key is one of the map keys below (e.g. "Add" will insert "+", "Decimal" will insert ".")
var INPUTTABLE_KEY = {
    Add: '+',
    Decimal: '.',
    Divide: '/',
    Multiply: '*',
    Subtract: '-' // Numpad subtract key
};
function inputtableKey(key) {
    return key.length === 1 ? key : INPUTTABLE_KEY[key];
}
//# sourceMappingURL=Chat.js.map