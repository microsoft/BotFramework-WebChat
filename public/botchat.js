(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("React"));
	else if(typeof define === 'function' && define.amd)
		define(["React"], factory);
	else if(typeof exports === 'object')
		exports["BotChat"] = factory(require("React"));
	else
		root["BotChat"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_3__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var App_1 = __webpack_require__(2);
	exports.App = App_1.App;
	var Chat_1 = __webpack_require__(4);
	exports.Chat = Chat_1.Chat;
	var directLine_1 = __webpack_require__(376);
	exports.DirectLine = directLine_1.DirectLine;
	var directLine3_1 = __webpack_require__(377);
	exports.DirectLine3 = directLine3_1.DirectLine3;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __assign = (this && this.__assign) || Object.assign || function(t) {
	    for (var s, i = 1, n = arguments.length; i < n; i++) {
	        s = arguments[i];
	        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
	            t[p] = s[p];
	    }
	    return t;
	};
	var _this = this;
	var React = __webpack_require__(3);
	var Chat_1 = __webpack_require__(4);
	var receiveBackchannelMessageFromHostingPage = function (props) { return function (event) {
	    if (props.allowMessagesFrom.indexOf(event.origin) === -1) {
	        console.log("Rejecting backchannel message from unknown source", event.source);
	        return;
	    }
	    if (!event.data) {
	        console.log("Empty backchannel message from source", event.source);
	        return;
	    }
	    console.log("Received backchannel message", event.data, "from", event.source);
	    props.botConnection.postMessage("backchannel", props.user, { backchannel: event.data })
	        .retry(2)
	        .subscribe(function (success) {
	        console.log("backchannel message sent to bot");
	    }, function (error) {
	        console.log("failed to send backchannel message to bot");
	    });
	}; };
	function isBackchannel(activity) {
	    return activity.type === "message" && activity.text === "backchannel" && activity.channelData && activity.channelData.backchannel;
	}
	exports.App = function (props) {
	    console.log("BotChat.App props", props);
	    if (props.allowMessagesFrom) {
	        console.log("adding event listener for messages from hosting web page");
	        window.addEventListener("message", receiveBackchannelMessageFromHostingPage(props), false);
	    }
	    if (props.onBackchannelMessage) {
	        console.log("adding event listener for messages to hosting web page");
	        props = Object.assign({}, props, {
	            botConnection: Object.assign({}, props.botConnection, {
	                activity$: props.botConnection.activity$
	                    .do(function (activity) {
	                    if (isBackchannel(activity)) {
	                        _this.props.onBackchannelMessage(activity.channelData.backchannel);
	                    }
	                }).filter(function (activity) { return !isBackchannel(activity); })
	            })
	        });
	    }
	    return (React.createElement("div", {className: "wc-app"}, 
	        React.createElement("div", {className: "wc-app-left-container"}, 
	            React.createElement(Chat_1.Chat, __assign({}, props))
	        )
	    ));
	};


/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(3);
	//import { BrowserLine } from './browserLine';
	var History_1 = __webpack_require__(5);
	var Shell_1 = __webpack_require__(359);
	var Store_1 = __webpack_require__(360);
	var Strings_1 = __webpack_require__(375);
	;
	var Chat = (function (_super) {
	    __extends(Chat, _super);
	    function Chat(props) {
	        var _this = this;
	        _super.call(this, props);
	        this.store = Store_1.createStore();
	        this.typingTimers = {};
	        console.log("BotChat.Chat props", props);
	        this.store.dispatch({ type: 'Start_Connection', user: props.user, botConnection: props.botConnection });
	        if (props.formatOptions)
	            this.store.dispatch({ type: 'Set_Format_Options', options: props.formatOptions });
	        this.store.dispatch({ type: 'Set_Localized_Strings', strings: Strings_1.strings(props.locale || window.navigator.language) });
	        props.botConnection.start();
	        this.connectedSubscription = props.botConnection.connected$.filter(function (connected) { return connected === true; }).subscribe(function (connected) {
	            _this.store.dispatch({ type: 'Connected_To_Bot' });
	        });
	        this.activitySubscription = props.botConnection.activity$.subscribe(function (activity) { return _this.handleIncomingActivity(activity); }, function (error) { return console.log("errors", error); });
	    }
	    Chat.prototype.handleIncomingActivity = function (activity) {
	        var _this = this;
	        var state = this.store.getState();
	        switch (activity.type) {
	            case "message":
	                if (activity.from.id === state.connection.user.id)
	                    break;
	                if (!activity.text.endsWith("//typing")) {
	                    if (!state.history.activities.find(function (a) { return a.id === activity.id; }))
	                        this.store.dispatch({ type: 'Receive_Message', activity: activity });
	                    break;
	                }
	                activity = Object.assign({}, activity, { type: 'typing' });
	            case "typing":
	                if (this.typingTimers[activity.from.id]) {
	                    clearTimeout(this.typingTimers[activity.from.id]);
	                    this.typingTimers[activity.from.id] = undefined;
	                }
	                this.store.dispatch({ type: 'Show_Typing', activity: activity });
	                this.typingTimers[activity.from.id] = setTimeout(function () {
	                    _this.typingTimers[activity.from.id] = undefined;
	                    _this.store.dispatch({ type: 'Clear_Typing', from: activity.from });
	                }, 3000);
	                break;
	        }
	    };
	    Chat.prototype.componentDidMount = function () {
	        var _this = this;
	        this.storeUnsubscribe = this.store.subscribe(function () {
	            return _this.forceUpdate();
	        });
	    };
	    Chat.prototype.componentWillUnmount = function () {
	        this.activitySubscription.unsubscribe();
	        this.connectedSubscription.unsubscribe();
	        this.props.botConnection.end();
	        this.storeUnsubscribe();
	        for (var key in this.typingTimers) {
	            clearTimeout(this.typingTimers[key]);
	        }
	    };
	    Chat.prototype.render = function () {
	        var state = this.store.getState();
	        console.log("BotChat.Chat state", state);
	        var header;
	        if (state.format.options.showHeader)
	            header =
	                React.createElement("div", {className: "wc-header"}, 
	                    React.createElement("span", null, state.format.strings.title)
	                );
	        return (React.createElement("div", {className: "wc-chatview-panel"}, 
	            header, 
	            React.createElement(History_1.History, {store: this.store, onActivitySelected: this.props.onActivitySelected}), 
	            React.createElement(Shell_1.Shell, {store: this.store})));
	    };
	    return Chat;
	}(React.Component));
	exports.Chat = Chat;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(3);
	var HistoryMessage_1 = __webpack_require__(6);
	var rxjs_1 = __webpack_require__(13);
	var History = (function (_super) {
	    __extends(History, _super);
	    function History(props) {
	        var _this = this;
	        _super.call(this, props);
	        this.onImageLoad = function () {
	            if (_this.props.store.getState().history.autoscroll)
	                _this.scrollMe.scrollTop = _this.scrollMe.scrollHeight;
	        };
	    }
	    History.prototype.componentDidMount = function () {
	        var _this = this;
	        this.autoscrollSubscription = rxjs_1.Observable
	            .fromEvent(this.scrollMe, 'scroll')
	            .map(function (e) { return e.target.scrollTop + e.target.offsetHeight >= e.target.scrollHeight; })
	            .distinctUntilChanged()
	            .subscribe(function (autoscroll) {
	            return _this.props.store.dispatch({ type: 'Set_Autoscroll', autoscroll: autoscroll });
	        });
	    };
	    History.prototype.componentWillUnmount = function () {
	        this.autoscrollSubscription.unsubscribe();
	    };
	    History.prototype.componentDidUpdate = function (prevProps, prevState) {
	        if (this.props.store.getState().history.autoscroll)
	            this.scrollMe.scrollTop = this.scrollMe.scrollHeight;
	    };
	    History.prototype.onActivitySelected = function (e, activity) {
	        if (this.props.onActivitySelected) {
	            e.preventDefault();
	            e.stopPropagation();
	            this.props.store.dispatch({ type: 'Select_Activity', selectedActivity: activity });
	            this.props.onActivitySelected(activity);
	        }
	    };
	    History.prototype.render = function () {
	        var _this = this;
	        var state = this.props.store.getState();
	        return (React.createElement("div", {className: "wc-message-groups", ref: function (ref) { return _this.scrollMe = ref; }}, 
	            React.createElement("div", {className: "wc-message-group"}, state.history.activities.map(function (activity, index) {
	                return React.createElement("div", {key: index, className: 'wc-message wc-message-from-' + (activity.from.id === state.connection.user.id ? 'me' : 'bot')}, 
	                    React.createElement("div", {className: 'wc-message-content' + (_this.props.onActivitySelected ? ' clickable' : '') + (activity === state.history.selectedActivity ? ' selected' : ''), onClick: function (e) { return _this.onActivitySelected(e, activity); }}, 
	                        React.createElement("svg", {className: "wc-message-callout"}, 
	                            React.createElement("path", {className: "point-left", d: "m0,0 h12 v10 z"}), 
	                            React.createElement("path", {className: "point-right", d: "m0,10 v-10 h12 z"})), 
	                        React.createElement(HistoryMessage_1.HistoryMessage, {store: _this.props.store, activity: activity, onImageLoad: _this.onImageLoad})), 
	                    React.createElement("div", {className: "wc-message-from"}, activity.from.id === state.connection.user.id ? 'you' : activity.from.id));
	            }))
	        ));
	    };
	    return History;
	}(React.Component));
	exports.History = History;
	// <Timestamp timestamp={ messagegroup.timestamp } />
	// { activities.map(activity => <HistoryMessage message={ activity } actions={ this.props.actions }/>) }


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var React = __webpack_require__(3);
	var Attachment_1 = __webpack_require__(7);
	var Carousel_1 = __webpack_require__(8);
	var react_formattedtext_1 = __webpack_require__(9);
	exports.HistoryMessage = function (props) {
	    switch (props.activity.type) {
	        case 'message':
	            if (props.activity.attachments && props.activity.attachments.length >= 1) {
	                if (props.activity.attachmentLayout === 'carousel' && props.activity.attachments.length > 1)
	                    return React.createElement(Carousel_1.Carousel, {store: props.store, attachments: props.activity.attachments, onImageLoad: props.onImageLoad});
	                else
	                    return (React.createElement("div", null, props.activity.attachments.map(function (attachment) { return React.createElement(Attachment_1.AttachmentView, {store: props.store, attachment: attachment, onImageLoad: props.onImageLoad}); })));
	            }
	            else if (props.activity.text) {
	                return React.createElement(react_formattedtext_1.FormattedText, {text: props.activity.text, format: props.activity.textFormat});
	            }
	            else {
	                return React.createElement("span", null);
	            }
	        case 'typing':
	            return React.createElement("div", null, "TYPING");
	    }
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var React = __webpack_require__(3);
	exports.AttachmentView = function (props) {
	    var state = props.store.getState();
	    var onClickButton = function (type, value) {
	        switch (type) {
	            case "imBack":
	            case "postBack":
	                state.connection.botConnection.postMessage(value, state.connection.user)
	                    .retry(2)
	                    .subscribe(function () {
	                    if (type === "imBack") {
	                        props.store.dispatch({ type: 'Send_Message', activity: {
	                                type: "message",
	                                text: value,
	                                from: { id: state.connection.user.id },
	                                timestamp: Date.now().toString()
	                            } });
	                    }
	                    else {
	                        console.log("quietly posted message", value);
	                    }
	                }, function (error) {
	                    console.log("failed to post message");
	                });
	                break;
	            case "openUrl":
	            case "signin":
	                window.open(value);
	                break;
	            default:
	                console.log("unknown button type");
	        }
	    };
	    var buttons = function (buttons) { return buttons &&
	        React.createElement("ul", {className: "wc-card-buttons"}, buttons.map(function (button) { return React.createElement("li", null, 
	            React.createElement("button", {onClick: function () { return onClickButton(button.type, button.value); }}, button.title)
	        ); })); };
	    var imageWithOnLoad = function (url) {
	        return React.createElement("img", {src: url, onLoad: function () { return props.onImageLoad(); }});
	    };
	    var attachedImage = function (images) {
	        return images && imageWithOnLoad(images[0].url);
	    };
	    switch (props.attachment.contentType) {
	        case "application/vnd.microsoft.card.hero":
	            return (React.createElement("div", {className: 'wc-card hero'}, 
	                attachedImage(props.attachment.content.images), 
	                React.createElement("h1", null, props.attachment.content.title), 
	                React.createElement("h2", null, props.attachment.content.subtitle), 
	                React.createElement("p", null, props.attachment.content.text), 
	                buttons(props.attachment.content.buttons)));
	        case "application/vnd.microsoft.card.thumbnail":
	            return (React.createElement("div", {className: 'wc-card thumbnail'}, 
	                React.createElement("h1", null, props.attachment.content.title), 
	                React.createElement("p", null, 
	                    attachedImage(props.attachment.content.images), 
	                    React.createElement("h2", null, props.attachment.content.subtitle), 
	                    props.attachment.content.text), 
	                buttons(props.attachment.content.buttons)));
	        case "application/vnd.microsoft.card.signin":
	            return (React.createElement("div", {className: 'wc-card signin'}, 
	                React.createElement("h1", null, props.attachment.content.text), 
	                buttons(props.attachment.content.buttons)));
	        case "application/vnd.microsoft.card.receipt":
	            return (React.createElement("div", {className: 'wc-card receipt'}, 
	                React.createElement("table", null, 
	                    React.createElement("thead", null, 
	                        React.createElement("tr", null, 
	                            React.createElement("th", {colSpan: 2}, props.attachment.content.title)
	                        ), 
	                        props.attachment.content.facts && props.attachment.content.facts.map(function (fact) { return React.createElement("tr", null, 
	                            React.createElement("th", null, fact.key), 
	                            React.createElement("th", null, fact.value)); })), 
	                    React.createElement("tbody", null, props.attachment.content.items && props.attachment.content.items.map(function (item) {
	                        return React.createElement("tr", null, 
	                            React.createElement("td", null, 
	                                item.image && imageWithOnLoad(item.image.url), 
	                                " /> }", 
	                                React.createElement("span", null, item.title)), 
	                            React.createElement("td", null, item.price));
	                    })), 
	                    React.createElement("tfoot", null, 
	                        React.createElement("tr", null, 
	                            React.createElement("td", null, "Tax"), 
	                            React.createElement("td", null, props.attachment.content.tax)), 
	                        React.createElement("tr", null, 
	                            React.createElement("td", null, "Total"), 
	                            React.createElement("td", null, props.attachment.content.total))))
	            ));
	        case "image/png":
	        case "image/jpg":
	        case "image/jpeg":
	        case "image/gif":
	            return imageWithOnLoad(props.attachment.contentUrl);
	        default:
	            return React.createElement("span", null);
	    }
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(3);
	var Attachment_1 = __webpack_require__(7);
	var Carousel = (function (_super) {
	    __extends(Carousel, _super);
	    function Carousel(props) {
	        var _this = this;
	        _super.call(this, props);
	        this.scrollAllowInterrupt = true;
	        this.state = {
	            previousButtonEnabled: false,
	            nextButtonEnabled: false
	        };
	        this.resizeListener = function () { return _this.resize(); };
	        this.scrollEventListener = function () { return _this.onScroll(); };
	    }
	    Carousel.prototype.clearScrollTimers = function () {
	        clearInterval(this.scrollStartTimer);
	        clearInterval(this.scrollSyncTimer);
	        clearTimeout(this.scrollDurationTimer);
	        document.body.removeChild(this.animateDiv);
	        this.animateDiv = null;
	        this.scrollStartTimer = null;
	        this.scrollSyncTimer = null;
	        this.scrollDurationTimer = null;
	        this.scrollAllowInterrupt = true;
	    };
	    Carousel.prototype.manageScrollButtons = function () {
	        var previousEnabled = this.scrollDiv.scrollLeft > 0;
	        var max = this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth;
	        var nextEnabled = this.scrollDiv.scrollLeft < max;
	        //TODO: both buttons may become disabled when the container is wide, and will not become re-enabled unless a resize event calls manageScrollButtons()
	        var newState = {
	            previousButtonEnabled: previousEnabled,
	            nextButtonEnabled: nextEnabled
	        };
	        this.setState(newState);
	    };
	    Carousel.prototype.setItemWidth = function (didMount) {
	        if (didMount === void 0) { didMount = false; }
	        var li = this.ul.firstChild;
	        this.itemWidth = li.offsetWidth;
	    };
	    Carousel.prototype.componentDidMount = function () {
	        this.setItemWidth(true);
	        this.manageScrollButtons();
	        this.scrollDiv.addEventListener('scroll', this.scrollEventListener);
	        this.scrollDiv.style.marginBottom = -(this.scrollDiv.offsetHeight - this.scrollDiv.clientHeight) + 'px';
	        window.addEventListener('resize', this.resizeListener);
	    };
	    Carousel.prototype.componentWillUnmount = function () {
	        this.scrollDiv.removeEventListener('scroll', this.scrollEventListener);
	        window.removeEventListener('resize', this.resizeListener);
	    };
	    Carousel.prototype.onScroll = function () {
	        this.manageScrollButtons();
	    };
	    Carousel.prototype.scrollBy = function (increment) {
	        var _this = this;
	        if (!this.scrollAllowInterrupt)
	            return;
	        var easingClassName = 'wc-animate-scroll';
	        //cancel existing animation when clicking fast
	        if (this.animateDiv) {
	            easingClassName = 'wc-animate-scroll-rapid';
	            this.clearScrollTimers();
	        }
	        var unit = increment * this.itemWidth;
	        var scrollLeft = this.scrollDiv.scrollLeft;
	        var dest = scrollLeft + unit;
	        //don't exceed boundaries
	        dest = Math.max(dest, 0);
	        dest = Math.min(dest, this.scrollDiv.scrollWidth - this.scrollDiv.offsetWidth);
	        if (scrollLeft == dest)
	            return;
	        //use proper easing curve when distance is small
	        if (Math.abs(dest - scrollLeft) < this.itemWidth) {
	            easingClassName = 'wc-animate-scroll-near';
	            this.scrollAllowInterrupt = false;
	        }
	        this.animateDiv = document.createElement('div');
	        this.animateDiv.className = easingClassName;
	        this.animateDiv.style.left = scrollLeft + 'px';
	        document.body.appendChild(this.animateDiv);
	        //capture ComputedStyle every millisecond
	        this.scrollSyncTimer = setInterval(function () {
	            var num = parseFloat(getComputedStyle(_this.animateDiv).left);
	            _this.scrollDiv.scrollLeft = num;
	        }, 1);
	        //don't let the browser optimize the setting of 'this.animateDiv.style.left' - we need this to change values to trigger the CSS animation
	        //we accomplish this by calling 'this.animateDiv.style.left' off this thread, using setTimeout
	        this.scrollStartTimer = setTimeout(function () {
	            _this.animateDiv.style.left = dest + 'px';
	            var duration = 1000 * parseFloat(getComputedStyle(_this.animateDiv).transitionDuration);
	            if (duration) {
	                //slightly longer that the CSS time so we don't cut it off prematurely
	                duration += 50;
	                //stop capturing
	                _this.scrollDurationTimer = setTimeout(function () { return _this.clearScrollTimers(); }, duration);
	            }
	            else {
	                _this.clearScrollTimers();
	            }
	        }, 1);
	    };
	    Carousel.prototype.render = function () {
	        var _this = this;
	        return (React.createElement("div", {className: "wc-carousel"}, 
	            React.createElement("button", {disabled: !this.state.previousButtonEnabled, className: "scroll previous", onClick: function () { return _this.scrollBy(-1); }}, 
	                React.createElement("svg", null, 
	                    React.createElement("path", {d: "M 16.5 22 L 19 19.5 L 13.5 14 L 19 8.5 L 16.5 6 L 8.5 14 L 16.5 22 Z"})
	                )
	            ), 
	            React.createElement("div", {className: "wc-carousel-scroll-outer"}, 
	                React.createElement("div", {className: "wc-carousel-scroll", ref: function (div) { return _this.scrollDiv = div; }}, 
	                    React.createElement("ul", {ref: function (ul) { return _this.ul = ul; }}, this.props.attachments.map(function (attachment) {
	                        return React.createElement("li", null, 
	                            React.createElement(Attachment_1.AttachmentView, {store: _this.props.store, attachment: attachment, onImageLoad: function () { return _this.resize(); }})
	                        );
	                    }))
	                )
	            ), 
	            React.createElement("button", {disabled: !this.state.nextButtonEnabled, className: "scroll next", onClick: function () { return _this.scrollBy(1); }}, 
	                React.createElement("svg", null, 
	                    React.createElement("path", {d: "M 12.5 22 L 10 19.5 L 15.5 14 L 10 8.5 L 12.5 6 L 20.5 14 L 12.5 22 Z"})
	                )
	            )));
	    };
	    Carousel.prototype.resize = function () {
	        this.setItemWidth();
	        this.manageScrollButtons();
	        this.props.onImageLoad();
	    };
	    return Carousel;
	}(React.Component));
	exports.Carousel = Carousel;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

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
	var Marked = __webpack_require__(10);
	var React = __webpack_require__(3);
	var He = __webpack_require__(11);
	var FormattedText = (function (_super) {
	    __extends(FormattedText, _super);
	    function FormattedText() {
	        _super.apply(this, arguments);
	    }
	    FormattedText.prototype.getDefaultProps = function () {
	        return {
	            text: '',
	            format: "markdown",
	            markdownOptions: {
	                gfm: true,
	                tables: true,
	                breaks: false,
	                pedantic: false,
	                sanitize: true,
	                smartLists: true,
	                silent: false,
	                smartypants: true
	            }
	        };
	    };
	    FormattedText.prototype.shouldComponentUpdate = function (nextProps) {
	        // I don't love this, but it is fast and it works.
	        return JSON.stringify(this.props) !== JSON.stringify(nextProps);
	    };
	    FormattedText.prototype.render = function () {
	        switch (this.props.format) {
	            case "plain":
	                return this.renderPlainText();
	            case "xml":
	                return this.renderXml();
	            default:
	                return this.renderMarkdown();
	        }
	    };
	    FormattedText.prototype.renderPlainText = function () {
	        var lines = this.props.text.replace('\r', '').split('\n');
	        var elements = lines.map(function (line, i) { return React.createElement("span", {key: i}, 
	            line, 
	            React.createElement("br", null)); });
	        return React.createElement("span", {className: "format-plain"}, elements);
	    };
	    FormattedText.prototype.renderXml = function () {
	        // TODO: Implement Xml renderer
	        //return <span className="format-xml"></span>;
	        return this.renderPlainText();
	    };
	    FormattedText.prototype.renderMarkdown = function () {
	        var src = this.props.text || '';
	        src = src.replace(/<br\s*\/?>/ig, '\r\n\r\n');
	        var options = Object.assign({}, this.props.markdownOptions);
	        var renderer = options.renderer = new ReactRenderer(options);
	        var text = Marked(src, options);
	        var elements = renderer.getElements(text);
	        /*// debug
	        const remaining = renderer.elements.filter(el => !!el);
	        if (remaining.length) {
	            console.warn(`There were ${remaining.length} unused markdown elements!`);
	        }*/
	        return React.createElement("span", {className: "format-markdown"}, elements);
	    };
	    return FormattedText;
	}(React.Component));
	exports.FormattedText = FormattedText;
	var ReactRenderer = (function () {
	    function ReactRenderer(options) {
	        this.options = options;
	        this.elements = [];
	    }
	    /**
	     * We're being sneaky here. Marked is expecting us to render html to text and return that.
	     * Instead, we're generating react elements and returning their array indices as strings,
	     * which are concatenated by Marked into the final output. We return a stringified index that
	     * is {{strongly delimited}}. We must do this because Marked can sometimes leak source text
	     * into the stream, interspersed with our ids. This leaked text will be detected later and
	     * turned into react elements.
	     */
	    ReactRenderer.prototype.addElement = function (element) {
	        var elementId = this.elements.length;
	        this.elements.push(element);
	        return "{{" + elementId + "}}";
	    };
	    /**
	     * getElements() reads indices from the input string and populates the return array with
	     * corresponding react elements. Marked's lexer/parser/compiler may also leak source text
	     * into input string. We detect instances of this and convert them to react elements on-the-fly.
	     * Sample input text: "{{87}}{{88}}[{{89}}[{{90}}http://example.com/{{91}}"
	     */
	    ReactRenderer.prototype.getElements = function (text) {
	        var _this = this;
	        var elements = new Array();
	        var re = /^{{\d+}}/g;
	        while (true) {
	            var len = text.length;
	            // Consume elementIds until string end or a leak sequence is encountered
	            text = text.replace(re, function (match) {
	                var index = Number(match.match(/\d+/)[0]);
	                elements.push(_this.elements[index]);
	                _this.elements[index] = null;
	                return '';
	            });
	            if (text.length == 0)
	                break;
	            // Consume leak sequences until string end or an id sequence is encountered
	            var next = text.indexOf('{{');
	            while (next > 0) {
	                var subst = text.substr(0, next);
	                subst = He.unescape(subst);
	                elements.push(React.createElement("span", null, subst));
	                text = text.substr(next);
	                next = text.indexOf('{{');
	            }
	            // Return remainder leak sequence
	            if (len == text.length) {
	                text = He.unescape(text);
	                elements.push(React.createElement("span", null, text));
	                break;
	            }
	        }
	        return elements.filter(function (el) { return !!el; });
	    };
	    /// MarkedRenderer overrides
	    ReactRenderer.prototype.code = function (code, language) {
	        return this.addElement(React.createElement("pre", null, 
	            React.createElement("code", null, He.unescape(code))
	        ));
	    };
	    ReactRenderer.prototype.blockquote = function (quote) {
	        return this.addElement(React.createElement("blockquote", null, this.getElements(quote)));
	    };
	    ReactRenderer.prototype.html = function (html) {
	        return this.addElement(React.createElement("span", null, html));
	    };
	    ReactRenderer.prototype.heading = function (text, level, raw) {
	        var HeadingTag = "h" + level;
	        return this.addElement(React.createElement(HeadingTag, null, this.getElements(text)));
	    };
	    ReactRenderer.prototype.hr = function () {
	        return this.addElement(React.createElement("hr", null));
	    };
	    ReactRenderer.prototype.list = function (body, ordered) {
	        var ListTag = ordered ? "ol" : "ul";
	        return this.addElement(React.createElement(ListTag, null, this.getElements(body)));
	    };
	    ReactRenderer.prototype.listitem = function (text) {
	        return this.addElement(React.createElement("li", null, this.getElements(text)));
	    };
	    ReactRenderer.prototype.paragraph = function (text) {
	        return this.addElement(React.createElement("p", null, this.getElements(text)));
	    };
	    ReactRenderer.prototype.table = function (header, body) {
	        return this.addElement(React.createElement("table", null, 
	            React.createElement("thead", null, this.getElements(header)), 
	            React.createElement("tbody", null, this.getElements(body))));
	    };
	    ReactRenderer.prototype.tablerow = function (content) {
	        return this.addElement(React.createElement("tr", null, this.getElements(content)));
	    };
	    ReactRenderer.prototype.tablecell = function (content, flags) {
	        var CellTag = flags.header ? "th" : "td";
	        flags.align = flags.align || "initial";
	        var inlineStyle = {
	            textAlign: flags.align
	        };
	        return this.addElement(React.createElement(CellTag, {style: inlineStyle}, this.getElements(content)));
	    };
	    ReactRenderer.prototype.strong = function (text) {
	        return this.addElement(React.createElement("strong", null, this.getElements(text)));
	    };
	    ReactRenderer.prototype.em = function (text) {
	        return this.addElement(React.createElement("em", null, this.getElements(text)));
	    };
	    ReactRenderer.prototype.codespan = function (code) {
	        return this.addElement(React.createElement("code", null, code));
	    };
	    ReactRenderer.prototype.br = function () {
	        return this.addElement(React.createElement("br", null));
	    };
	    ReactRenderer.prototype.del = function (text) {
	        return this.addElement(React.createElement("del", null, this.getElements(text)));
	    };
	    ReactRenderer.prototype.link = function (href, title, text) {
	        if (this.options.sanitize) {
	            try {
	                var prot = decodeURIComponent(He.unescape(href)).toLowerCase();
	                if (!(prot.startsWith('http://') || prot.startsWith('https://'))) {
	                    return '';
	                }
	            }
	            catch (e) {
	                return '';
	            }
	        }
	        return this.addElement(React.createElement("a", __assign({}, { href: href, title: title }), this.getElements(text)));
	    };
	    ReactRenderer.prototype.image = function (href, title, text) {
	        if (this.options.sanitize) {
	            try {
	                var prot = decodeURIComponent(He.unescape(href)).toLowerCase();
	                if (!(prot.startsWith('http://') || prot.startsWith('https://'))) {
	                    return '';
	                }
	            }
	            catch (e) {
	                return '';
	            }
	        }
	        return this.addElement(React.createElement("img", __assign({}, { src: href, title: title, alt: text })));
	    };
	    ReactRenderer.prototype.text = function (text) {
	        return this.addElement(React.createElement("span", null, He.unescape(text)));
	    };
	    return ReactRenderer;
	}());


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * marked - a markdown parser
	 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
	 * https://github.com/chjj/marked
	 */
	
	;(function() {
	
	/**
	 * Block-Level Grammar
	 */
	
	var block = {
	  newline: /^\n+/,
	  code: /^( {4}[^\n]+\n*)+/,
	  fences: noop,
	  hr: /^( *[-*_]){3,} *(?:\n+|$)/,
	  heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
	  nptable: noop,
	  lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
	  blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
	  list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
	  html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
	  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
	  table: noop,
	  paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
	  text: /^[^\n]+/
	};
	
	block.bullet = /(?:[*+-]|\d+\.)/;
	block.item = /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/;
	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();
	
	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ('hr', '\\n+(?=\\1?(?:[-*_] *){3,}(?:\\n+|$))')
	  ('def', '\\n+(?=' + block.def.source + ')')
	  ();
	
	block.blockquote = replace(block.blockquote)
	  ('def', block.def)
	  ();
	
	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';
	
	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();
	
	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ('def', block.def)
	  ();
	
	/**
	 * Normal Block Grammar
	 */
	
	block.normal = merge({}, block);
	
	/**
	 * GFM Block Grammar
	 */
	
	block.gfm = merge({}, block.normal, {
	  fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
	  paragraph: /^/,
	  heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
	});
	
	block.gfm.paragraph = replace(block.paragraph)
	  ('(?!', '(?!'
	    + block.gfm.fences.source.replace('\\1', '\\2') + '|'
	    + block.list.source.replace('\\1', '\\3') + '|')
	  ();
	
	/**
	 * GFM + Tables Block Grammar
	 */
	
	block.tables = merge({}, block.gfm, {
	  nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
	  table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
	});
	
	/**
	 * Block Lexer
	 */
	
	function Lexer(options) {
	  this.tokens = [];
	  this.tokens.links = {};
	  this.options = options || marked.defaults;
	  this.rules = block.normal;
	
	  if (this.options.gfm) {
	    if (this.options.tables) {
	      this.rules = block.tables;
	    } else {
	      this.rules = block.gfm;
	    }
	  }
	}
	
	/**
	 * Expose Block Rules
	 */
	
	Lexer.rules = block;
	
	/**
	 * Static Lex Method
	 */
	
	Lexer.lex = function(src, options) {
	  var lexer = new Lexer(options);
	  return lexer.lex(src);
	};
	
	/**
	 * Preprocessing
	 */
	
	Lexer.prototype.lex = function(src) {
	  src = src
	    .replace(/\r\n|\r/g, '\n')
	    .replace(/\t/g, '    ')
	    .replace(/\u00a0/g, ' ')
	    .replace(/\u2424/g, '\n');
	
	  return this.token(src, true);
	};
	
	/**
	 * Lexing
	 */
	
	Lexer.prototype.token = function(src, top, bq) {
	  var src = src.replace(/^ +$/gm, '')
	    , next
	    , loose
	    , cap
	    , bull
	    , b
	    , item
	    , space
	    , i
	    , l;
	
	  while (src) {
	    // newline
	    if (cap = this.rules.newline.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[0].length > 1) {
	        this.tokens.push({
	          type: 'space'
	        });
	      }
	    }
	
	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      cap = cap[0].replace(/^ {4}/gm, '');
	      this.tokens.push({
	        type: 'code',
	        text: !this.options.pedantic
	          ? cap.replace(/\n+$/, '')
	          : cap
	      });
	      continue;
	    }
	
	    // fences (gfm)
	    if (cap = this.rules.fences.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'code',
	        lang: cap[2],
	        text: cap[3] || ''
	      });
	      continue;
	    }
	
	    // heading
	    if (cap = this.rules.heading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[1].length,
	        text: cap[2]
	      });
	      continue;
	    }
	
	    // table no leading pipe (gfm)
	    if (top && (cap = this.rules.nptable.exec(src))) {
	      src = src.substring(cap[0].length);
	
	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/\n$/, '').split('\n')
	      };
	
	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }
	
	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i].split(/ *\| */);
	      }
	
	      this.tokens.push(item);
	
	      continue;
	    }
	
	    // lheading
	    if (cap = this.rules.lheading.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'heading',
	        depth: cap[2] === '=' ? 1 : 2,
	        text: cap[1]
	      });
	      continue;
	    }
	
	    // hr
	    if (cap = this.rules.hr.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'hr'
	      });
	      continue;
	    }
	
	    // blockquote
	    if (cap = this.rules.blockquote.exec(src)) {
	      src = src.substring(cap[0].length);
	
	      this.tokens.push({
	        type: 'blockquote_start'
	      });
	
	      cap = cap[0].replace(/^ *> ?/gm, '');
	
	      // Pass `top` to keep the current
	      // "toplevel" state. This is exactly
	      // how markdown.pl works.
	      this.token(cap, top, true);
	
	      this.tokens.push({
	        type: 'blockquote_end'
	      });
	
	      continue;
	    }
	
	    // list
	    if (cap = this.rules.list.exec(src)) {
	      src = src.substring(cap[0].length);
	      bull = cap[2];
	
	      this.tokens.push({
	        type: 'list_start',
	        ordered: bull.length > 1
	      });
	
	      // Get each top-level item.
	      cap = cap[0].match(this.rules.item);
	
	      next = false;
	      l = cap.length;
	      i = 0;
	
	      for (; i < l; i++) {
	        item = cap[i];
	
	        // Remove the list item's bullet
	        // so it is seen as the next token.
	        space = item.length;
	        item = item.replace(/^ *([*+-]|\d+\.) +/, '');
	
	        // Outdent whatever the
	        // list item contains. Hacky.
	        if (~item.indexOf('\n ')) {
	          space -= item.length;
	          item = !this.options.pedantic
	            ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '')
	            : item.replace(/^ {1,4}/gm, '');
	        }
	
	        // Determine whether the next list item belongs here.
	        // Backpedal if it does not belong in this list.
	        if (this.options.smartLists && i !== l - 1) {
	          b = block.bullet.exec(cap[i + 1])[0];
	          if (bull !== b && !(bull.length > 1 && b.length > 1)) {
	            src = cap.slice(i + 1).join('\n') + src;
	            i = l - 1;
	          }
	        }
	
	        // Determine whether item is loose or not.
	        // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
	        // for discount behavior.
	        loose = next || /\n\n(?!\s*$)/.test(item);
	        if (i !== l - 1) {
	          next = item.charAt(item.length - 1) === '\n';
	          if (!loose) loose = next;
	        }
	
	        this.tokens.push({
	          type: loose
	            ? 'loose_item_start'
	            : 'list_item_start'
	        });
	
	        // Recurse.
	        this.token(item, false, bq);
	
	        this.tokens.push({
	          type: 'list_item_end'
	        });
	      }
	
	      this.tokens.push({
	        type: 'list_end'
	      });
	
	      continue;
	    }
	
	    // html
	    if (cap = this.rules.html.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: this.options.sanitize
	          ? 'paragraph'
	          : 'html',
	        pre: !this.options.sanitizer
	          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
	        text: cap[0]
	      });
	      continue;
	    }
	
	    // def
	    if ((!bq && top) && (cap = this.rules.def.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.links[cap[1].toLowerCase()] = {
	        href: cap[2],
	        title: cap[3]
	      };
	      continue;
	    }
	
	    // table (gfm)
	    if (top && (cap = this.rules.table.exec(src))) {
	      src = src.substring(cap[0].length);
	
	      item = {
	        type: 'table',
	        header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
	        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
	        cells: cap[3].replace(/(?: *\| *)?\n$/, '').split('\n')
	      };
	
	      for (i = 0; i < item.align.length; i++) {
	        if (/^ *-+: *$/.test(item.align[i])) {
	          item.align[i] = 'right';
	        } else if (/^ *:-+: *$/.test(item.align[i])) {
	          item.align[i] = 'center';
	        } else if (/^ *:-+ *$/.test(item.align[i])) {
	          item.align[i] = 'left';
	        } else {
	          item.align[i] = null;
	        }
	      }
	
	      for (i = 0; i < item.cells.length; i++) {
	        item.cells[i] = item.cells[i]
	          .replace(/^ *\| *| *\| *$/g, '')
	          .split(/ *\| */);
	      }
	
	      this.tokens.push(item);
	
	      continue;
	    }
	
	    // top-level paragraph
	    if (top && (cap = this.rules.paragraph.exec(src))) {
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'paragraph',
	        text: cap[1].charAt(cap[1].length - 1) === '\n'
	          ? cap[1].slice(0, -1)
	          : cap[1]
	      });
	      continue;
	    }
	
	    // text
	    if (cap = this.rules.text.exec(src)) {
	      // Top-level should never reach here.
	      src = src.substring(cap[0].length);
	      this.tokens.push({
	        type: 'text',
	        text: cap[0]
	      });
	      continue;
	    }
	
	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }
	
	  return this.tokens;
	};
	
	/**
	 * Inline-Level Grammar
	 */
	
	var inline = {
	  escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
	  autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
	  url: noop,
	  tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
	  link: /^!?\[(inside)\]\(href\)/,
	  reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
	  nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
	  strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
	  em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
	  code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
	  br: /^ {2,}\n(?!\s*$)/,
	  del: noop,
	  text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
	};
	
	inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
	inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;
	
	inline.link = replace(inline.link)
	  ('inside', inline._inside)
	  ('href', inline._href)
	  ();
	
	inline.reflink = replace(inline.reflink)
	  ('inside', inline._inside)
	  ();
	
	/**
	 * Normal Inline Grammar
	 */
	
	inline.normal = merge({}, inline);
	
	/**
	 * Pedantic Inline Grammar
	 */
	
	inline.pedantic = merge({}, inline.normal, {
	  strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
	  em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
	});
	
	/**
	 * GFM Inline Grammar
	 */
	
	inline.gfm = merge({}, inline.normal, {
	  escape: replace(inline.escape)('])', '~|])')(),
	  url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
	  del: /^~~(?=\S)([\s\S]*?\S)~~/,
	  text: replace(inline.text)
	    (']|', '~]|')
	    ('|', '|https?://|')
	    ()
	});
	
	/**
	 * GFM + Line Breaks Inline Grammar
	 */
	
	inline.breaks = merge({}, inline.gfm, {
	  br: replace(inline.br)('{2,}', '*')(),
	  text: replace(inline.gfm.text)('{2,}', '*')()
	});
	
	/**
	 * Inline Lexer & Compiler
	 */
	
	function InlineLexer(links, options) {
	  this.options = options || marked.defaults;
	  this.links = links;
	  this.rules = inline.normal;
	  this.renderer = this.options.renderer || new Renderer;
	  this.renderer.options = this.options;
	
	  if (!this.links) {
	    throw new
	      Error('Tokens array requires a `links` property.');
	  }
	
	  if (this.options.gfm) {
	    if (this.options.breaks) {
	      this.rules = inline.breaks;
	    } else {
	      this.rules = inline.gfm;
	    }
	  } else if (this.options.pedantic) {
	    this.rules = inline.pedantic;
	  }
	}
	
	/**
	 * Expose Inline Rules
	 */
	
	InlineLexer.rules = inline;
	
	/**
	 * Static Lexing/Compiling Method
	 */
	
	InlineLexer.output = function(src, links, options) {
	  var inline = new InlineLexer(links, options);
	  return inline.output(src);
	};
	
	/**
	 * Lexing/Compiling
	 */
	
	InlineLexer.prototype.output = function(src) {
	  var out = ''
	    , link
	    , text
	    , href
	    , cap;
	
	  while (src) {
	    // escape
	    if (cap = this.rules.escape.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += cap[1];
	      continue;
	    }
	
	    // autolink
	    if (cap = this.rules.autolink.exec(src)) {
	      src = src.substring(cap[0].length);
	      if (cap[2] === '@') {
	        text = cap[1].charAt(6) === ':'
	          ? this.mangle(cap[1].substring(7))
	          : this.mangle(cap[1]);
	        href = this.mangle('mailto:') + text;
	      } else {
	        text = escape(cap[1]);
	        href = text;
	      }
	      out += this.renderer.link(href, null, text);
	      continue;
	    }
	
	    // url (gfm)
	    if (!this.inLink && (cap = this.rules.url.exec(src))) {
	      src = src.substring(cap[0].length);
	      text = escape(cap[1]);
	      href = text;
	      out += this.renderer.link(href, null, text);
	      continue;
	    }
	
	    // tag
	    if (cap = this.rules.tag.exec(src)) {
	      if (!this.inLink && /^<a /i.test(cap[0])) {
	        this.inLink = true;
	      } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
	        this.inLink = false;
	      }
	      src = src.substring(cap[0].length);
	      out += this.options.sanitize
	        ? this.options.sanitizer
	          ? this.options.sanitizer(cap[0])
	          : escape(cap[0])
	        : cap[0]
	      continue;
	    }
	
	    // link
	    if (cap = this.rules.link.exec(src)) {
	      src = src.substring(cap[0].length);
	      this.inLink = true;
	      out += this.outputLink(cap, {
	        href: cap[2],
	        title: cap[3]
	      });
	      this.inLink = false;
	      continue;
	    }
	
	    // reflink, nolink
	    if ((cap = this.rules.reflink.exec(src))
	        || (cap = this.rules.nolink.exec(src))) {
	      src = src.substring(cap[0].length);
	      link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
	      link = this.links[link.toLowerCase()];
	      if (!link || !link.href) {
	        out += cap[0].charAt(0);
	        src = cap[0].substring(1) + src;
	        continue;
	      }
	      this.inLink = true;
	      out += this.outputLink(cap, link);
	      this.inLink = false;
	      continue;
	    }
	
	    // strong
	    if (cap = this.rules.strong.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.strong(this.output(cap[2] || cap[1]));
	      continue;
	    }
	
	    // em
	    if (cap = this.rules.em.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.em(this.output(cap[2] || cap[1]));
	      continue;
	    }
	
	    // code
	    if (cap = this.rules.code.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.codespan(escape(cap[2], true));
	      continue;
	    }
	
	    // br
	    if (cap = this.rules.br.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.br();
	      continue;
	    }
	
	    // del (gfm)
	    if (cap = this.rules.del.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.del(this.output(cap[1]));
	      continue;
	    }
	
	    // text
	    if (cap = this.rules.text.exec(src)) {
	      src = src.substring(cap[0].length);
	      out += this.renderer.text(escape(this.smartypants(cap[0])));
	      continue;
	    }
	
	    if (src) {
	      throw new
	        Error('Infinite loop on byte: ' + src.charCodeAt(0));
	    }
	  }
	
	  return out;
	};
	
	/**
	 * Compile Link
	 */
	
	InlineLexer.prototype.outputLink = function(cap, link) {
	  var href = escape(link.href)
	    , title = link.title ? escape(link.title) : null;
	
	  return cap[0].charAt(0) !== '!'
	    ? this.renderer.link(href, title, this.output(cap[1]))
	    : this.renderer.image(href, title, escape(cap[1]));
	};
	
	/**
	 * Smartypants Transformations
	 */
	
	InlineLexer.prototype.smartypants = function(text) {
	  if (!this.options.smartypants) return text;
	  return text
	    // em-dashes
	    .replace(/---/g, '\u2014')
	    // en-dashes
	    .replace(/--/g, '\u2013')
	    // opening singles
	    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
	    // closing singles & apostrophes
	    .replace(/'/g, '\u2019')
	    // opening doubles
	    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
	    // closing doubles
	    .replace(/"/g, '\u201d')
	    // ellipses
	    .replace(/\.{3}/g, '\u2026');
	};
	
	/**
	 * Mangle Links
	 */
	
	InlineLexer.prototype.mangle = function(text) {
	  if (!this.options.mangle) return text;
	  var out = ''
	    , l = text.length
	    , i = 0
	    , ch;
	
	  for (; i < l; i++) {
	    ch = text.charCodeAt(i);
	    if (Math.random() > 0.5) {
	      ch = 'x' + ch.toString(16);
	    }
	    out += '&#' + ch + ';';
	  }
	
	  return out;
	};
	
	/**
	 * Renderer
	 */
	
	function Renderer(options) {
	  this.options = options || {};
	}
	
	Renderer.prototype.code = function(code, lang, escaped) {
	  if (this.options.highlight) {
	    var out = this.options.highlight(code, lang);
	    if (out != null && out !== code) {
	      escaped = true;
	      code = out;
	    }
	  }
	
	  if (!lang) {
	    return '<pre><code>'
	      + (escaped ? code : escape(code, true))
	      + '\n</code></pre>';
	  }
	
	  return '<pre><code class="'
	    + this.options.langPrefix
	    + escape(lang, true)
	    + '">'
	    + (escaped ? code : escape(code, true))
	    + '\n</code></pre>\n';
	};
	
	Renderer.prototype.blockquote = function(quote) {
	  return '<blockquote>\n' + quote + '</blockquote>\n';
	};
	
	Renderer.prototype.html = function(html) {
	  return html;
	};
	
	Renderer.prototype.heading = function(text, level, raw) {
	  return '<h'
	    + level
	    + ' id="'
	    + this.options.headerPrefix
	    + raw.toLowerCase().replace(/[^\w]+/g, '-')
	    + '">'
	    + text
	    + '</h'
	    + level
	    + '>\n';
	};
	
	Renderer.prototype.hr = function() {
	  return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
	};
	
	Renderer.prototype.list = function(body, ordered) {
	  var type = ordered ? 'ol' : 'ul';
	  return '<' + type + '>\n' + body + '</' + type + '>\n';
	};
	
	Renderer.prototype.listitem = function(text) {
	  return '<li>' + text + '</li>\n';
	};
	
	Renderer.prototype.paragraph = function(text) {
	  return '<p>' + text + '</p>\n';
	};
	
	Renderer.prototype.table = function(header, body) {
	  return '<table>\n'
	    + '<thead>\n'
	    + header
	    + '</thead>\n'
	    + '<tbody>\n'
	    + body
	    + '</tbody>\n'
	    + '</table>\n';
	};
	
	Renderer.prototype.tablerow = function(content) {
	  return '<tr>\n' + content + '</tr>\n';
	};
	
	Renderer.prototype.tablecell = function(content, flags) {
	  var type = flags.header ? 'th' : 'td';
	  var tag = flags.align
	    ? '<' + type + ' style="text-align:' + flags.align + '">'
	    : '<' + type + '>';
	  return tag + content + '</' + type + '>\n';
	};
	
	// span level renderer
	Renderer.prototype.strong = function(text) {
	  return '<strong>' + text + '</strong>';
	};
	
	Renderer.prototype.em = function(text) {
	  return '<em>' + text + '</em>';
	};
	
	Renderer.prototype.codespan = function(text) {
	  return '<code>' + text + '</code>';
	};
	
	Renderer.prototype.br = function() {
	  return this.options.xhtml ? '<br/>' : '<br>';
	};
	
	Renderer.prototype.del = function(text) {
	  return '<del>' + text + '</del>';
	};
	
	Renderer.prototype.link = function(href, title, text) {
	  if (this.options.sanitize) {
	    try {
	      var prot = decodeURIComponent(unescape(href))
	        .replace(/[^\w:]/g, '')
	        .toLowerCase();
	    } catch (e) {
	      return '';
	    }
	    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
	      return '';
	    }
	  }
	  var out = '<a href="' + href + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += '>' + text + '</a>';
	  return out;
	};
	
	Renderer.prototype.image = function(href, title, text) {
	  var out = '<img src="' + href + '" alt="' + text + '"';
	  if (title) {
	    out += ' title="' + title + '"';
	  }
	  out += this.options.xhtml ? '/>' : '>';
	  return out;
	};
	
	Renderer.prototype.text = function(text) {
	  return text;
	};
	
	/**
	 * Parsing & Compiling
	 */
	
	function Parser(options) {
	  this.tokens = [];
	  this.token = null;
	  this.options = options || marked.defaults;
	  this.options.renderer = this.options.renderer || new Renderer;
	  this.renderer = this.options.renderer;
	  this.renderer.options = this.options;
	}
	
	/**
	 * Static Parse Method
	 */
	
	Parser.parse = function(src, options, renderer) {
	  var parser = new Parser(options, renderer);
	  return parser.parse(src);
	};
	
	/**
	 * Parse Loop
	 */
	
	Parser.prototype.parse = function(src) {
	  this.inline = new InlineLexer(src.links, this.options, this.renderer);
	  this.tokens = src.reverse();
	
	  var out = '';
	  while (this.next()) {
	    out += this.tok();
	  }
	
	  return out;
	};
	
	/**
	 * Next Token
	 */
	
	Parser.prototype.next = function() {
	  return this.token = this.tokens.pop();
	};
	
	/**
	 * Preview Next Token
	 */
	
	Parser.prototype.peek = function() {
	  return this.tokens[this.tokens.length - 1] || 0;
	};
	
	/**
	 * Parse Text Tokens
	 */
	
	Parser.prototype.parseText = function() {
	  var body = this.token.text;
	
	  while (this.peek().type === 'text') {
	    body += '\n' + this.next().text;
	  }
	
	  return this.inline.output(body);
	};
	
	/**
	 * Parse Current Token
	 */
	
	Parser.prototype.tok = function() {
	  switch (this.token.type) {
	    case 'space': {
	      return '';
	    }
	    case 'hr': {
	      return this.renderer.hr();
	    }
	    case 'heading': {
	      return this.renderer.heading(
	        this.inline.output(this.token.text),
	        this.token.depth,
	        this.token.text);
	    }
	    case 'code': {
	      return this.renderer.code(this.token.text,
	        this.token.lang,
	        this.token.escaped);
	    }
	    case 'table': {
	      var header = ''
	        , body = ''
	        , i
	        , row
	        , cell
	        , flags
	        , j;
	
	      // header
	      cell = '';
	      for (i = 0; i < this.token.header.length; i++) {
	        flags = { header: true, align: this.token.align[i] };
	        cell += this.renderer.tablecell(
	          this.inline.output(this.token.header[i]),
	          { header: true, align: this.token.align[i] }
	        );
	      }
	      header += this.renderer.tablerow(cell);
	
	      for (i = 0; i < this.token.cells.length; i++) {
	        row = this.token.cells[i];
	
	        cell = '';
	        for (j = 0; j < row.length; j++) {
	          cell += this.renderer.tablecell(
	            this.inline.output(row[j]),
	            { header: false, align: this.token.align[j] }
	          );
	        }
	
	        body += this.renderer.tablerow(cell);
	      }
	      return this.renderer.table(header, body);
	    }
	    case 'blockquote_start': {
	      var body = '';
	
	      while (this.next().type !== 'blockquote_end') {
	        body += this.tok();
	      }
	
	      return this.renderer.blockquote(body);
	    }
	    case 'list_start': {
	      var body = ''
	        , ordered = this.token.ordered;
	
	      while (this.next().type !== 'list_end') {
	        body += this.tok();
	      }
	
	      return this.renderer.list(body, ordered);
	    }
	    case 'list_item_start': {
	      var body = '';
	
	      while (this.next().type !== 'list_item_end') {
	        body += this.token.type === 'text'
	          ? this.parseText()
	          : this.tok();
	      }
	
	      return this.renderer.listitem(body);
	    }
	    case 'loose_item_start': {
	      var body = '';
	
	      while (this.next().type !== 'list_item_end') {
	        body += this.tok();
	      }
	
	      return this.renderer.listitem(body);
	    }
	    case 'html': {
	      var html = !this.token.pre && !this.options.pedantic
	        ? this.inline.output(this.token.text)
	        : this.token.text;
	      return this.renderer.html(html);
	    }
	    case 'paragraph': {
	      return this.renderer.paragraph(this.inline.output(this.token.text));
	    }
	    case 'text': {
	      return this.renderer.paragraph(this.parseText());
	    }
	  }
	};
	
	/**
	 * Helpers
	 */
	
	function escape(html, encode) {
	  return html
	    .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
	    .replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;')
	    .replace(/"/g, '&quot;')
	    .replace(/'/g, '&#39;');
	}
	
	function unescape(html) {
		// explicitly match decimal, hex, and named HTML entities 
	  return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function(_, n) {
	    n = n.toLowerCase();
	    if (n === 'colon') return ':';
	    if (n.charAt(0) === '#') {
	      return n.charAt(1) === 'x'
	        ? String.fromCharCode(parseInt(n.substring(2), 16))
	        : String.fromCharCode(+n.substring(1));
	    }
	    return '';
	  });
	}
	
	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}
	
	function noop() {}
	noop.exec = noop;
	
	function merge(obj) {
	  var i = 1
	    , target
	    , key;
	
	  for (; i < arguments.length; i++) {
	    target = arguments[i];
	    for (key in target) {
	      if (Object.prototype.hasOwnProperty.call(target, key)) {
	        obj[key] = target[key];
	      }
	    }
	  }
	
	  return obj;
	}
	
	
	/**
	 * Marked
	 */
	
	function marked(src, opt, callback) {
	  if (callback || typeof opt === 'function') {
	    if (!callback) {
	      callback = opt;
	      opt = null;
	    }
	
	    opt = merge({}, marked.defaults, opt || {});
	
	    var highlight = opt.highlight
	      , tokens
	      , pending
	      , i = 0;
	
	    try {
	      tokens = Lexer.lex(src, opt)
	    } catch (e) {
	      return callback(e);
	    }
	
	    pending = tokens.length;
	
	    var done = function(err) {
	      if (err) {
	        opt.highlight = highlight;
	        return callback(err);
	      }
	
	      var out;
	
	      try {
	        out = Parser.parse(tokens, opt);
	      } catch (e) {
	        err = e;
	      }
	
	      opt.highlight = highlight;
	
	      return err
	        ? callback(err)
	        : callback(null, out);
	    };
	
	    if (!highlight || highlight.length < 3) {
	      return done();
	    }
	
	    delete opt.highlight;
	
	    if (!pending) return done();
	
	    for (; i < tokens.length; i++) {
	      (function(token) {
	        if (token.type !== 'code') {
	          return --pending || done();
	        }
	        return highlight(token.text, token.lang, function(err, code) {
	          if (err) return done(err);
	          if (code == null || code === token.text) {
	            return --pending || done();
	          }
	          token.text = code;
	          token.escaped = true;
	          --pending || done();
	        });
	      })(tokens[i]);
	    }
	
	    return;
	  }
	  try {
	    if (opt) opt = merge({}, marked.defaults, opt);
	    return Parser.parse(Lexer.lex(src, opt), opt);
	  } catch (e) {
	    e.message += '\nPlease report this to https://github.com/chjj/marked.';
	    if ((opt || marked.defaults).silent) {
	      return '<p>An error occured:</p><pre>'
	        + escape(e.message + '', true)
	        + '</pre>';
	    }
	    throw e;
	  }
	}
	
	/**
	 * Options
	 */
	
	marked.options =
	marked.setOptions = function(opt) {
	  merge(marked.defaults, opt);
	  return marked;
	};
	
	marked.defaults = {
	  gfm: true,
	  tables: true,
	  breaks: false,
	  pedantic: false,
	  sanitize: false,
	  sanitizer: null,
	  mangle: true,
	  smartLists: false,
	  silent: false,
	  highlight: null,
	  langPrefix: 'lang-',
	  smartypants: false,
	  headerPrefix: '',
	  renderer: new Renderer,
	  xhtml: false
	};
	
	/**
	 * Expose
	 */
	
	marked.Parser = Parser;
	marked.parser = Parser.parse;
	
	marked.Renderer = Renderer;
	
	marked.Lexer = Lexer;
	marked.lexer = Lexer.lex;
	
	marked.InlineLexer = InlineLexer;
	marked.inlineLexer = InlineLexer.output;
	
	marked.parse = marked;
	
	if (true) {
	  module.exports = marked;
	} else if (typeof define === 'function' && define.amd) {
	  define(function() { return marked; });
	} else {
	  this.marked = marked;
	}
	
	}).call(function() {
	  return this || (typeof window !== 'undefined' ? window : global);
	}());
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module, global) {/*! https://mths.be/he v1.1.0 by @mathias | MIT license */
	;(function(root) {
	
		// Detect free variables `exports`.
		var freeExports = typeof exports == 'object' && exports;
	
		// Detect free variable `module`.
		var freeModule = typeof module == 'object' && module &&
			module.exports == freeExports && module;
	
		// Detect free variable `global`, from Node.js or Browserified code,
		// and use it as `root`.
		var freeGlobal = typeof global == 'object' && global;
		if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal) {
			root = freeGlobal;
		}
	
		/*--------------------------------------------------------------------------*/
	
		// All astral symbols.
		var regexAstralSymbols = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
		// All ASCII symbols (not just printable ASCII) except those listed in the
		// first column of the overrides table.
		// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides
		var regexAsciiWhitelist = /[\x01-\x7F]/g;
		// All BMP symbols that are not ASCII newlines, printable ASCII symbols, or
		// code points listed in the first column of the overrides table on
		// https://html.spec.whatwg.org/multipage/syntax.html#table-charref-overrides.
		var regexBmpWhitelist = /[\x01-\t\x0B\f\x0E-\x1F\x7F\x81\x8D\x8F\x90\x9D\xA0-\uFFFF]/g;
	
		var regexEncodeNonAscii = /<\u20D2|=\u20E5|>\u20D2|\u205F\u200A|\u219D\u0338|\u2202\u0338|\u2220\u20D2|\u2229\uFE00|\u222A\uFE00|\u223C\u20D2|\u223D\u0331|\u223E\u0333|\u2242\u0338|\u224B\u0338|\u224D\u20D2|\u224E\u0338|\u224F\u0338|\u2250\u0338|\u2261\u20E5|\u2264\u20D2|\u2265\u20D2|\u2266\u0338|\u2267\u0338|\u2268\uFE00|\u2269\uFE00|\u226A\u0338|\u226A\u20D2|\u226B\u0338|\u226B\u20D2|\u227F\u0338|\u2282\u20D2|\u2283\u20D2|\u228A\uFE00|\u228B\uFE00|\u228F\u0338|\u2290\u0338|\u2293\uFE00|\u2294\uFE00|\u22B4\u20D2|\u22B5\u20D2|\u22D8\u0338|\u22D9\u0338|\u22DA\uFE00|\u22DB\uFE00|\u22F5\u0338|\u22F9\u0338|\u2933\u0338|\u29CF\u0338|\u29D0\u0338|\u2A6D\u0338|\u2A70\u0338|\u2A7D\u0338|\u2A7E\u0338|\u2AA1\u0338|\u2AA2\u0338|\u2AAC\uFE00|\u2AAD\uFE00|\u2AAF\u0338|\u2AB0\u0338|\u2AC5\u0338|\u2AC6\u0338|\u2ACB\uFE00|\u2ACC\uFE00|\u2AFD\u20E5|[\xA0-\u0113\u0116-\u0122\u0124-\u012B\u012E-\u014D\u0150-\u017E\u0192\u01B5\u01F5\u0237\u02C6\u02C7\u02D8-\u02DD\u0311\u0391-\u03A1\u03A3-\u03A9\u03B1-\u03C9\u03D1\u03D2\u03D5\u03D6\u03DC\u03DD\u03F0\u03F1\u03F5\u03F6\u0401-\u040C\u040E-\u044F\u0451-\u045C\u045E\u045F\u2002-\u2005\u2007-\u2010\u2013-\u2016\u2018-\u201A\u201C-\u201E\u2020-\u2022\u2025\u2026\u2030-\u2035\u2039\u203A\u203E\u2041\u2043\u2044\u204F\u2057\u205F-\u2063\u20AC\u20DB\u20DC\u2102\u2105\u210A-\u2113\u2115-\u211E\u2122\u2124\u2127-\u2129\u212C\u212D\u212F-\u2131\u2133-\u2138\u2145-\u2148\u2153-\u215E\u2190-\u219B\u219D-\u21A7\u21A9-\u21AE\u21B0-\u21B3\u21B5-\u21B7\u21BA-\u21DB\u21DD\u21E4\u21E5\u21F5\u21FD-\u2205\u2207-\u2209\u220B\u220C\u220F-\u2214\u2216-\u2218\u221A\u221D-\u2238\u223A-\u2257\u2259\u225A\u225C\u225F-\u2262\u2264-\u228B\u228D-\u229B\u229D-\u22A5\u22A7-\u22B0\u22B2-\u22BB\u22BD-\u22DB\u22DE-\u22E3\u22E6-\u22F7\u22F9-\u22FE\u2305\u2306\u2308-\u2310\u2312\u2313\u2315\u2316\u231C-\u231F\u2322\u2323\u232D\u232E\u2336\u233D\u233F\u237C\u23B0\u23B1\u23B4-\u23B6\u23DC-\u23DF\u23E2\u23E7\u2423\u24C8\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2550-\u256C\u2580\u2584\u2588\u2591-\u2593\u25A1\u25AA\u25AB\u25AD\u25AE\u25B1\u25B3-\u25B5\u25B8\u25B9\u25BD-\u25BF\u25C2\u25C3\u25CA\u25CB\u25EC\u25EF\u25F8-\u25FC\u2605\u2606\u260E\u2640\u2642\u2660\u2663\u2665\u2666\u266A\u266D-\u266F\u2713\u2717\u2720\u2736\u2758\u2772\u2773\u27C8\u27C9\u27E6-\u27ED\u27F5-\u27FA\u27FC\u27FF\u2902-\u2905\u290C-\u2913\u2916\u2919-\u2920\u2923-\u292A\u2933\u2935-\u2939\u293C\u293D\u2945\u2948-\u294B\u294E-\u2976\u2978\u2979\u297B-\u297F\u2985\u2986\u298B-\u2996\u299A\u299C\u299D\u29A4-\u29B7\u29B9\u29BB\u29BC\u29BE-\u29C5\u29C9\u29CD-\u29D0\u29DC-\u29DE\u29E3-\u29E5\u29EB\u29F4\u29F6\u2A00-\u2A02\u2A04\u2A06\u2A0C\u2A0D\u2A10-\u2A17\u2A22-\u2A27\u2A29\u2A2A\u2A2D-\u2A31\u2A33-\u2A3C\u2A3F\u2A40\u2A42-\u2A4D\u2A50\u2A53-\u2A58\u2A5A-\u2A5D\u2A5F\u2A66\u2A6A\u2A6D-\u2A75\u2A77-\u2A9A\u2A9D-\u2AA2\u2AA4-\u2AB0\u2AB3-\u2AC8\u2ACB\u2ACC\u2ACF-\u2ADB\u2AE4\u2AE6-\u2AE9\u2AEB-\u2AF3\u2AFD\uFB00-\uFB04]|\uD835[\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDD04\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDD6B]/g;
		var encodeMap = {'\xAD':'shy','\u200C':'zwnj','\u200D':'zwj','\u200E':'lrm','\u2063':'ic','\u2062':'it','\u2061':'af','\u200F':'rlm','\u200B':'ZeroWidthSpace','\u2060':'NoBreak','\u0311':'DownBreve','\u20DB':'tdot','\u20DC':'DotDot','\t':'Tab','\n':'NewLine','\u2008':'puncsp','\u205F':'MediumSpace','\u2009':'thinsp','\u200A':'hairsp','\u2004':'emsp13','\u2002':'ensp','\u2005':'emsp14','\u2003':'emsp','\u2007':'numsp','\xA0':'nbsp','\u205F\u200A':'ThickSpace','\u203E':'oline','_':'lowbar','\u2010':'dash','\u2013':'ndash','\u2014':'mdash','\u2015':'horbar',',':'comma',';':'semi','\u204F':'bsemi',':':'colon','\u2A74':'Colone','!':'excl','\xA1':'iexcl','?':'quest','\xBF':'iquest','.':'period','\u2025':'nldr','\u2026':'mldr','\xB7':'middot','\'':'apos','\u2018':'lsquo','\u2019':'rsquo','\u201A':'sbquo','\u2039':'lsaquo','\u203A':'rsaquo','"':'quot','\u201C':'ldquo','\u201D':'rdquo','\u201E':'bdquo','\xAB':'laquo','\xBB':'raquo','(':'lpar',')':'rpar','[':'lsqb',']':'rsqb','{':'lcub','}':'rcub','\u2308':'lceil','\u2309':'rceil','\u230A':'lfloor','\u230B':'rfloor','\u2985':'lopar','\u2986':'ropar','\u298B':'lbrke','\u298C':'rbrke','\u298D':'lbrkslu','\u298E':'rbrksld','\u298F':'lbrksld','\u2990':'rbrkslu','\u2991':'langd','\u2992':'rangd','\u2993':'lparlt','\u2994':'rpargt','\u2995':'gtlPar','\u2996':'ltrPar','\u27E6':'lobrk','\u27E7':'robrk','\u27E8':'lang','\u27E9':'rang','\u27EA':'Lang','\u27EB':'Rang','\u27EC':'loang','\u27ED':'roang','\u2772':'lbbrk','\u2773':'rbbrk','\u2016':'Vert','\xA7':'sect','\xB6':'para','@':'commat','*':'ast','/':'sol','undefined':null,'&':'amp','#':'num','%':'percnt','\u2030':'permil','\u2031':'pertenk','\u2020':'dagger','\u2021':'Dagger','\u2022':'bull','\u2043':'hybull','\u2032':'prime','\u2033':'Prime','\u2034':'tprime','\u2057':'qprime','\u2035':'bprime','\u2041':'caret','`':'grave','\xB4':'acute','\u02DC':'tilde','^':'Hat','\xAF':'macr','\u02D8':'breve','\u02D9':'dot','\xA8':'die','\u02DA':'ring','\u02DD':'dblac','\xB8':'cedil','\u02DB':'ogon','\u02C6':'circ','\u02C7':'caron','\xB0':'deg','\xA9':'copy','\xAE':'reg','\u2117':'copysr','\u2118':'wp','\u211E':'rx','\u2127':'mho','\u2129':'iiota','\u2190':'larr','\u219A':'nlarr','\u2192':'rarr','\u219B':'nrarr','\u2191':'uarr','\u2193':'darr','\u2194':'harr','\u21AE':'nharr','\u2195':'varr','\u2196':'nwarr','\u2197':'nearr','\u2198':'searr','\u2199':'swarr','\u219D':'rarrw','\u219D\u0338':'nrarrw','\u219E':'Larr','\u219F':'Uarr','\u21A0':'Rarr','\u21A1':'Darr','\u21A2':'larrtl','\u21A3':'rarrtl','\u21A4':'mapstoleft','\u21A5':'mapstoup','\u21A6':'map','\u21A7':'mapstodown','\u21A9':'larrhk','\u21AA':'rarrhk','\u21AB':'larrlp','\u21AC':'rarrlp','\u21AD':'harrw','\u21B0':'lsh','\u21B1':'rsh','\u21B2':'ldsh','\u21B3':'rdsh','\u21B5':'crarr','\u21B6':'cularr','\u21B7':'curarr','\u21BA':'olarr','\u21BB':'orarr','\u21BC':'lharu','\u21BD':'lhard','\u21BE':'uharr','\u21BF':'uharl','\u21C0':'rharu','\u21C1':'rhard','\u21C2':'dharr','\u21C3':'dharl','\u21C4':'rlarr','\u21C5':'udarr','\u21C6':'lrarr','\u21C7':'llarr','\u21C8':'uuarr','\u21C9':'rrarr','\u21CA':'ddarr','\u21CB':'lrhar','\u21CC':'rlhar','\u21D0':'lArr','\u21CD':'nlArr','\u21D1':'uArr','\u21D2':'rArr','\u21CF':'nrArr','\u21D3':'dArr','\u21D4':'iff','\u21CE':'nhArr','\u21D5':'vArr','\u21D6':'nwArr','\u21D7':'neArr','\u21D8':'seArr','\u21D9':'swArr','\u21DA':'lAarr','\u21DB':'rAarr','\u21DD':'zigrarr','\u21E4':'larrb','\u21E5':'rarrb','\u21F5':'duarr','\u21FD':'loarr','\u21FE':'roarr','\u21FF':'hoarr','\u2200':'forall','\u2201':'comp','\u2202':'part','\u2202\u0338':'npart','\u2203':'exist','\u2204':'nexist','\u2205':'empty','\u2207':'Del','\u2208':'in','\u2209':'notin','\u220B':'ni','\u220C':'notni','\u03F6':'bepsi','\u220F':'prod','\u2210':'coprod','\u2211':'sum','+':'plus','\xB1':'pm','\xF7':'div','\xD7':'times','<':'lt','\u226E':'nlt','<\u20D2':'nvlt','=':'equals','\u2260':'ne','=\u20E5':'bne','\u2A75':'Equal','>':'gt','\u226F':'ngt','>\u20D2':'nvgt','\xAC':'not','|':'vert','\xA6':'brvbar','\u2212':'minus','\u2213':'mp','\u2214':'plusdo','\u2044':'frasl','\u2216':'setmn','\u2217':'lowast','\u2218':'compfn','\u221A':'Sqrt','\u221D':'prop','\u221E':'infin','\u221F':'angrt','\u2220':'ang','\u2220\u20D2':'nang','\u2221':'angmsd','\u2222':'angsph','\u2223':'mid','\u2224':'nmid','\u2225':'par','\u2226':'npar','\u2227':'and','\u2228':'or','\u2229':'cap','\u2229\uFE00':'caps','\u222A':'cup','\u222A\uFE00':'cups','\u222B':'int','\u222C':'Int','\u222D':'tint','\u2A0C':'qint','\u222E':'oint','\u222F':'Conint','\u2230':'Cconint','\u2231':'cwint','\u2232':'cwconint','\u2233':'awconint','\u2234':'there4','\u2235':'becaus','\u2236':'ratio','\u2237':'Colon','\u2238':'minusd','\u223A':'mDDot','\u223B':'homtht','\u223C':'sim','\u2241':'nsim','\u223C\u20D2':'nvsim','\u223D':'bsim','\u223D\u0331':'race','\u223E':'ac','\u223E\u0333':'acE','\u223F':'acd','\u2240':'wr','\u2242':'esim','\u2242\u0338':'nesim','\u2243':'sime','\u2244':'nsime','\u2245':'cong','\u2247':'ncong','\u2246':'simne','\u2248':'ap','\u2249':'nap','\u224A':'ape','\u224B':'apid','\u224B\u0338':'napid','\u224C':'bcong','\u224D':'CupCap','\u226D':'NotCupCap','\u224D\u20D2':'nvap','\u224E':'bump','\u224E\u0338':'nbump','\u224F':'bumpe','\u224F\u0338':'nbumpe','\u2250':'doteq','\u2250\u0338':'nedot','\u2251':'eDot','\u2252':'efDot','\u2253':'erDot','\u2254':'colone','\u2255':'ecolon','\u2256':'ecir','\u2257':'cire','\u2259':'wedgeq','\u225A':'veeeq','\u225C':'trie','\u225F':'equest','\u2261':'equiv','\u2262':'nequiv','\u2261\u20E5':'bnequiv','\u2264':'le','\u2270':'nle','\u2264\u20D2':'nvle','\u2265':'ge','\u2271':'nge','\u2265\u20D2':'nvge','\u2266':'lE','\u2266\u0338':'nlE','\u2267':'gE','\u2267\u0338':'ngE','\u2268\uFE00':'lvnE','\u2268':'lnE','\u2269':'gnE','\u2269\uFE00':'gvnE','\u226A':'ll','\u226A\u0338':'nLtv','\u226A\u20D2':'nLt','\u226B':'gg','\u226B\u0338':'nGtv','\u226B\u20D2':'nGt','\u226C':'twixt','\u2272':'lsim','\u2274':'nlsim','\u2273':'gsim','\u2275':'ngsim','\u2276':'lg','\u2278':'ntlg','\u2277':'gl','\u2279':'ntgl','\u227A':'pr','\u2280':'npr','\u227B':'sc','\u2281':'nsc','\u227C':'prcue','\u22E0':'nprcue','\u227D':'sccue','\u22E1':'nsccue','\u227E':'prsim','\u227F':'scsim','\u227F\u0338':'NotSucceedsTilde','\u2282':'sub','\u2284':'nsub','\u2282\u20D2':'vnsub','\u2283':'sup','\u2285':'nsup','\u2283\u20D2':'vnsup','\u2286':'sube','\u2288':'nsube','\u2287':'supe','\u2289':'nsupe','\u228A\uFE00':'vsubne','\u228A':'subne','\u228B\uFE00':'vsupne','\u228B':'supne','\u228D':'cupdot','\u228E':'uplus','\u228F':'sqsub','\u228F\u0338':'NotSquareSubset','\u2290':'sqsup','\u2290\u0338':'NotSquareSuperset','\u2291':'sqsube','\u22E2':'nsqsube','\u2292':'sqsupe','\u22E3':'nsqsupe','\u2293':'sqcap','\u2293\uFE00':'sqcaps','\u2294':'sqcup','\u2294\uFE00':'sqcups','\u2295':'oplus','\u2296':'ominus','\u2297':'otimes','\u2298':'osol','\u2299':'odot','\u229A':'ocir','\u229B':'oast','\u229D':'odash','\u229E':'plusb','\u229F':'minusb','\u22A0':'timesb','\u22A1':'sdotb','\u22A2':'vdash','\u22AC':'nvdash','\u22A3':'dashv','\u22A4':'top','\u22A5':'bot','\u22A7':'models','\u22A8':'vDash','\u22AD':'nvDash','\u22A9':'Vdash','\u22AE':'nVdash','\u22AA':'Vvdash','\u22AB':'VDash','\u22AF':'nVDash','\u22B0':'prurel','\u22B2':'vltri','\u22EA':'nltri','\u22B3':'vrtri','\u22EB':'nrtri','\u22B4':'ltrie','\u22EC':'nltrie','\u22B4\u20D2':'nvltrie','\u22B5':'rtrie','\u22ED':'nrtrie','\u22B5\u20D2':'nvrtrie','\u22B6':'origof','\u22B7':'imof','\u22B8':'mumap','\u22B9':'hercon','\u22BA':'intcal','\u22BB':'veebar','\u22BD':'barvee','\u22BE':'angrtvb','\u22BF':'lrtri','\u22C0':'Wedge','\u22C1':'Vee','\u22C2':'xcap','\u22C3':'xcup','\u22C4':'diam','\u22C5':'sdot','\u22C6':'Star','\u22C7':'divonx','\u22C8':'bowtie','\u22C9':'ltimes','\u22CA':'rtimes','\u22CB':'lthree','\u22CC':'rthree','\u22CD':'bsime','\u22CE':'cuvee','\u22CF':'cuwed','\u22D0':'Sub','\u22D1':'Sup','\u22D2':'Cap','\u22D3':'Cup','\u22D4':'fork','\u22D5':'epar','\u22D6':'ltdot','\u22D7':'gtdot','\u22D8':'Ll','\u22D8\u0338':'nLl','\u22D9':'Gg','\u22D9\u0338':'nGg','\u22DA\uFE00':'lesg','\u22DA':'leg','\u22DB':'gel','\u22DB\uFE00':'gesl','\u22DE':'cuepr','\u22DF':'cuesc','\u22E6':'lnsim','\u22E7':'gnsim','\u22E8':'prnsim','\u22E9':'scnsim','\u22EE':'vellip','\u22EF':'ctdot','\u22F0':'utdot','\u22F1':'dtdot','\u22F2':'disin','\u22F3':'isinsv','\u22F4':'isins','\u22F5':'isindot','\u22F5\u0338':'notindot','\u22F6':'notinvc','\u22F7':'notinvb','\u22F9':'isinE','\u22F9\u0338':'notinE','\u22FA':'nisd','\u22FB':'xnis','\u22FC':'nis','\u22FD':'notnivc','\u22FE':'notnivb','\u2305':'barwed','\u2306':'Barwed','\u230C':'drcrop','\u230D':'dlcrop','\u230E':'urcrop','\u230F':'ulcrop','\u2310':'bnot','\u2312':'profline','\u2313':'profsurf','\u2315':'telrec','\u2316':'target','\u231C':'ulcorn','\u231D':'urcorn','\u231E':'dlcorn','\u231F':'drcorn','\u2322':'frown','\u2323':'smile','\u232D':'cylcty','\u232E':'profalar','\u2336':'topbot','\u233D':'ovbar','\u233F':'solbar','\u237C':'angzarr','\u23B0':'lmoust','\u23B1':'rmoust','\u23B4':'tbrk','\u23B5':'bbrk','\u23B6':'bbrktbrk','\u23DC':'OverParenthesis','\u23DD':'UnderParenthesis','\u23DE':'OverBrace','\u23DF':'UnderBrace','\u23E2':'trpezium','\u23E7':'elinters','\u2423':'blank','\u2500':'boxh','\u2502':'boxv','\u250C':'boxdr','\u2510':'boxdl','\u2514':'boxur','\u2518':'boxul','\u251C':'boxvr','\u2524':'boxvl','\u252C':'boxhd','\u2534':'boxhu','\u253C':'boxvh','\u2550':'boxH','\u2551':'boxV','\u2552':'boxdR','\u2553':'boxDr','\u2554':'boxDR','\u2555':'boxdL','\u2556':'boxDl','\u2557':'boxDL','\u2558':'boxuR','\u2559':'boxUr','\u255A':'boxUR','\u255B':'boxuL','\u255C':'boxUl','\u255D':'boxUL','\u255E':'boxvR','\u255F':'boxVr','\u2560':'boxVR','\u2561':'boxvL','\u2562':'boxVl','\u2563':'boxVL','\u2564':'boxHd','\u2565':'boxhD','\u2566':'boxHD','\u2567':'boxHu','\u2568':'boxhU','\u2569':'boxHU','\u256A':'boxvH','\u256B':'boxVh','\u256C':'boxVH','\u2580':'uhblk','\u2584':'lhblk','\u2588':'block','\u2591':'blk14','\u2592':'blk12','\u2593':'blk34','\u25A1':'squ','\u25AA':'squf','\u25AB':'EmptyVerySmallSquare','\u25AD':'rect','\u25AE':'marker','\u25B1':'fltns','\u25B3':'xutri','\u25B4':'utrif','\u25B5':'utri','\u25B8':'rtrif','\u25B9':'rtri','\u25BD':'xdtri','\u25BE':'dtrif','\u25BF':'dtri','\u25C2':'ltrif','\u25C3':'ltri','\u25CA':'loz','\u25CB':'cir','\u25EC':'tridot','\u25EF':'xcirc','\u25F8':'ultri','\u25F9':'urtri','\u25FA':'lltri','\u25FB':'EmptySmallSquare','\u25FC':'FilledSmallSquare','\u2605':'starf','\u2606':'star','\u260E':'phone','\u2640':'female','\u2642':'male','\u2660':'spades','\u2663':'clubs','\u2665':'hearts','\u2666':'diams','\u266A':'sung','\u2713':'check','\u2717':'cross','\u2720':'malt','\u2736':'sext','\u2758':'VerticalSeparator','\u27C8':'bsolhsub','\u27C9':'suphsol','\u27F5':'xlarr','\u27F6':'xrarr','\u27F7':'xharr','\u27F8':'xlArr','\u27F9':'xrArr','\u27FA':'xhArr','\u27FC':'xmap','\u27FF':'dzigrarr','\u2902':'nvlArr','\u2903':'nvrArr','\u2904':'nvHarr','\u2905':'Map','\u290C':'lbarr','\u290D':'rbarr','\u290E':'lBarr','\u290F':'rBarr','\u2910':'RBarr','\u2911':'DDotrahd','\u2912':'UpArrowBar','\u2913':'DownArrowBar','\u2916':'Rarrtl','\u2919':'latail','\u291A':'ratail','\u291B':'lAtail','\u291C':'rAtail','\u291D':'larrfs','\u291E':'rarrfs','\u291F':'larrbfs','\u2920':'rarrbfs','\u2923':'nwarhk','\u2924':'nearhk','\u2925':'searhk','\u2926':'swarhk','\u2927':'nwnear','\u2928':'toea','\u2929':'tosa','\u292A':'swnwar','\u2933':'rarrc','\u2933\u0338':'nrarrc','\u2935':'cudarrr','\u2936':'ldca','\u2937':'rdca','\u2938':'cudarrl','\u2939':'larrpl','\u293C':'curarrm','\u293D':'cularrp','\u2945':'rarrpl','\u2948':'harrcir','\u2949':'Uarrocir','\u294A':'lurdshar','\u294B':'ldrushar','\u294E':'LeftRightVector','\u294F':'RightUpDownVector','\u2950':'DownLeftRightVector','\u2951':'LeftUpDownVector','\u2952':'LeftVectorBar','\u2953':'RightVectorBar','\u2954':'RightUpVectorBar','\u2955':'RightDownVectorBar','\u2956':'DownLeftVectorBar','\u2957':'DownRightVectorBar','\u2958':'LeftUpVectorBar','\u2959':'LeftDownVectorBar','\u295A':'LeftTeeVector','\u295B':'RightTeeVector','\u295C':'RightUpTeeVector','\u295D':'RightDownTeeVector','\u295E':'DownLeftTeeVector','\u295F':'DownRightTeeVector','\u2960':'LeftUpTeeVector','\u2961':'LeftDownTeeVector','\u2962':'lHar','\u2963':'uHar','\u2964':'rHar','\u2965':'dHar','\u2966':'luruhar','\u2967':'ldrdhar','\u2968':'ruluhar','\u2969':'rdldhar','\u296A':'lharul','\u296B':'llhard','\u296C':'rharul','\u296D':'lrhard','\u296E':'udhar','\u296F':'duhar','\u2970':'RoundImplies','\u2971':'erarr','\u2972':'simrarr','\u2973':'larrsim','\u2974':'rarrsim','\u2975':'rarrap','\u2976':'ltlarr','\u2978':'gtrarr','\u2979':'subrarr','\u297B':'suplarr','\u297C':'lfisht','\u297D':'rfisht','\u297E':'ufisht','\u297F':'dfisht','\u299A':'vzigzag','\u299C':'vangrt','\u299D':'angrtvbd','\u29A4':'ange','\u29A5':'range','\u29A6':'dwangle','\u29A7':'uwangle','\u29A8':'angmsdaa','\u29A9':'angmsdab','\u29AA':'angmsdac','\u29AB':'angmsdad','\u29AC':'angmsdae','\u29AD':'angmsdaf','\u29AE':'angmsdag','\u29AF':'angmsdah','\u29B0':'bemptyv','\u29B1':'demptyv','\u29B2':'cemptyv','\u29B3':'raemptyv','\u29B4':'laemptyv','\u29B5':'ohbar','\u29B6':'omid','\u29B7':'opar','\u29B9':'operp','\u29BB':'olcross','\u29BC':'odsold','\u29BE':'olcir','\u29BF':'ofcir','\u29C0':'olt','\u29C1':'ogt','\u29C2':'cirscir','\u29C3':'cirE','\u29C4':'solb','\u29C5':'bsolb','\u29C9':'boxbox','\u29CD':'trisb','\u29CE':'rtriltri','\u29CF':'LeftTriangleBar','\u29CF\u0338':'NotLeftTriangleBar','\u29D0':'RightTriangleBar','\u29D0\u0338':'NotRightTriangleBar','\u29DC':'iinfin','\u29DD':'infintie','\u29DE':'nvinfin','\u29E3':'eparsl','\u29E4':'smeparsl','\u29E5':'eqvparsl','\u29EB':'lozf','\u29F4':'RuleDelayed','\u29F6':'dsol','\u2A00':'xodot','\u2A01':'xoplus','\u2A02':'xotime','\u2A04':'xuplus','\u2A06':'xsqcup','\u2A0D':'fpartint','\u2A10':'cirfnint','\u2A11':'awint','\u2A12':'rppolint','\u2A13':'scpolint','\u2A14':'npolint','\u2A15':'pointint','\u2A16':'quatint','\u2A17':'intlarhk','\u2A22':'pluscir','\u2A23':'plusacir','\u2A24':'simplus','\u2A25':'plusdu','\u2A26':'plussim','\u2A27':'plustwo','\u2A29':'mcomma','\u2A2A':'minusdu','\u2A2D':'loplus','\u2A2E':'roplus','\u2A2F':'Cross','\u2A30':'timesd','\u2A31':'timesbar','\u2A33':'smashp','\u2A34':'lotimes','\u2A35':'rotimes','\u2A36':'otimesas','\u2A37':'Otimes','\u2A38':'odiv','\u2A39':'triplus','\u2A3A':'triminus','\u2A3B':'tritime','\u2A3C':'iprod','\u2A3F':'amalg','\u2A40':'capdot','\u2A42':'ncup','\u2A43':'ncap','\u2A44':'capand','\u2A45':'cupor','\u2A46':'cupcap','\u2A47':'capcup','\u2A48':'cupbrcap','\u2A49':'capbrcup','\u2A4A':'cupcup','\u2A4B':'capcap','\u2A4C':'ccups','\u2A4D':'ccaps','\u2A50':'ccupssm','\u2A53':'And','\u2A54':'Or','\u2A55':'andand','\u2A56':'oror','\u2A57':'orslope','\u2A58':'andslope','\u2A5A':'andv','\u2A5B':'orv','\u2A5C':'andd','\u2A5D':'ord','\u2A5F':'wedbar','\u2A66':'sdote','\u2A6A':'simdot','\u2A6D':'congdot','\u2A6D\u0338':'ncongdot','\u2A6E':'easter','\u2A6F':'apacir','\u2A70':'apE','\u2A70\u0338':'napE','\u2A71':'eplus','\u2A72':'pluse','\u2A73':'Esim','\u2A77':'eDDot','\u2A78':'equivDD','\u2A79':'ltcir','\u2A7A':'gtcir','\u2A7B':'ltquest','\u2A7C':'gtquest','\u2A7D':'les','\u2A7D\u0338':'nles','\u2A7E':'ges','\u2A7E\u0338':'nges','\u2A7F':'lesdot','\u2A80':'gesdot','\u2A81':'lesdoto','\u2A82':'gesdoto','\u2A83':'lesdotor','\u2A84':'gesdotol','\u2A85':'lap','\u2A86':'gap','\u2A87':'lne','\u2A88':'gne','\u2A89':'lnap','\u2A8A':'gnap','\u2A8B':'lEg','\u2A8C':'gEl','\u2A8D':'lsime','\u2A8E':'gsime','\u2A8F':'lsimg','\u2A90':'gsiml','\u2A91':'lgE','\u2A92':'glE','\u2A93':'lesges','\u2A94':'gesles','\u2A95':'els','\u2A96':'egs','\u2A97':'elsdot','\u2A98':'egsdot','\u2A99':'el','\u2A9A':'eg','\u2A9D':'siml','\u2A9E':'simg','\u2A9F':'simlE','\u2AA0':'simgE','\u2AA1':'LessLess','\u2AA1\u0338':'NotNestedLessLess','\u2AA2':'GreaterGreater','\u2AA2\u0338':'NotNestedGreaterGreater','\u2AA4':'glj','\u2AA5':'gla','\u2AA6':'ltcc','\u2AA7':'gtcc','\u2AA8':'lescc','\u2AA9':'gescc','\u2AAA':'smt','\u2AAB':'lat','\u2AAC':'smte','\u2AAC\uFE00':'smtes','\u2AAD':'late','\u2AAD\uFE00':'lates','\u2AAE':'bumpE','\u2AAF':'pre','\u2AAF\u0338':'npre','\u2AB0':'sce','\u2AB0\u0338':'nsce','\u2AB3':'prE','\u2AB4':'scE','\u2AB5':'prnE','\u2AB6':'scnE','\u2AB7':'prap','\u2AB8':'scap','\u2AB9':'prnap','\u2ABA':'scnap','\u2ABB':'Pr','\u2ABC':'Sc','\u2ABD':'subdot','\u2ABE':'supdot','\u2ABF':'subplus','\u2AC0':'supplus','\u2AC1':'submult','\u2AC2':'supmult','\u2AC3':'subedot','\u2AC4':'supedot','\u2AC5':'subE','\u2AC5\u0338':'nsubE','\u2AC6':'supE','\u2AC6\u0338':'nsupE','\u2AC7':'subsim','\u2AC8':'supsim','\u2ACB\uFE00':'vsubnE','\u2ACB':'subnE','\u2ACC\uFE00':'vsupnE','\u2ACC':'supnE','\u2ACF':'csub','\u2AD0':'csup','\u2AD1':'csube','\u2AD2':'csupe','\u2AD3':'subsup','\u2AD4':'supsub','\u2AD5':'subsub','\u2AD6':'supsup','\u2AD7':'suphsub','\u2AD8':'supdsub','\u2AD9':'forkv','\u2ADA':'topfork','\u2ADB':'mlcp','\u2AE4':'Dashv','\u2AE6':'Vdashl','\u2AE7':'Barv','\u2AE8':'vBar','\u2AE9':'vBarv','\u2AEB':'Vbar','\u2AEC':'Not','\u2AED':'bNot','\u2AEE':'rnmid','\u2AEF':'cirmid','\u2AF0':'midcir','\u2AF1':'topcir','\u2AF2':'nhpar','\u2AF3':'parsim','\u2AFD':'parsl','\u2AFD\u20E5':'nparsl','\u266D':'flat','\u266E':'natur','\u266F':'sharp','\xA4':'curren','\xA2':'cent','$':'dollar','\xA3':'pound','\xA5':'yen','\u20AC':'euro','\xB9':'sup1','\xBD':'half','\u2153':'frac13','\xBC':'frac14','\u2155':'frac15','\u2159':'frac16','\u215B':'frac18','\xB2':'sup2','\u2154':'frac23','\u2156':'frac25','\xB3':'sup3','\xBE':'frac34','\u2157':'frac35','\u215C':'frac38','\u2158':'frac45','\u215A':'frac56','\u215D':'frac58','\u215E':'frac78','\uD835\uDCB6':'ascr','\uD835\uDD52':'aopf','\uD835\uDD1E':'afr','\uD835\uDD38':'Aopf','\uD835\uDD04':'Afr','\uD835\uDC9C':'Ascr','\xAA':'ordf','\xE1':'aacute','\xC1':'Aacute','\xE0':'agrave','\xC0':'Agrave','\u0103':'abreve','\u0102':'Abreve','\xE2':'acirc','\xC2':'Acirc','\xE5':'aring','\xC5':'angst','\xE4':'auml','\xC4':'Auml','\xE3':'atilde','\xC3':'Atilde','\u0105':'aogon','\u0104':'Aogon','\u0101':'amacr','\u0100':'Amacr','\xE6':'aelig','\xC6':'AElig','\uD835\uDCB7':'bscr','\uD835\uDD53':'bopf','\uD835\uDD1F':'bfr','\uD835\uDD39':'Bopf','\u212C':'Bscr','\uD835\uDD05':'Bfr','\uD835\uDD20':'cfr','\uD835\uDCB8':'cscr','\uD835\uDD54':'copf','\u212D':'Cfr','\uD835\uDC9E':'Cscr','\u2102':'Copf','\u0107':'cacute','\u0106':'Cacute','\u0109':'ccirc','\u0108':'Ccirc','\u010D':'ccaron','\u010C':'Ccaron','\u010B':'cdot','\u010A':'Cdot','\xE7':'ccedil','\xC7':'Ccedil','\u2105':'incare','\uD835\uDD21':'dfr','\u2146':'dd','\uD835\uDD55':'dopf','\uD835\uDCB9':'dscr','\uD835\uDC9F':'Dscr','\uD835\uDD07':'Dfr','\u2145':'DD','\uD835\uDD3B':'Dopf','\u010F':'dcaron','\u010E':'Dcaron','\u0111':'dstrok','\u0110':'Dstrok','\xF0':'eth','\xD0':'ETH','\u2147':'ee','\u212F':'escr','\uD835\uDD22':'efr','\uD835\uDD56':'eopf','\u2130':'Escr','\uD835\uDD08':'Efr','\uD835\uDD3C':'Eopf','\xE9':'eacute','\xC9':'Eacute','\xE8':'egrave','\xC8':'Egrave','\xEA':'ecirc','\xCA':'Ecirc','\u011B':'ecaron','\u011A':'Ecaron','\xEB':'euml','\xCB':'Euml','\u0117':'edot','\u0116':'Edot','\u0119':'eogon','\u0118':'Eogon','\u0113':'emacr','\u0112':'Emacr','\uD835\uDD23':'ffr','\uD835\uDD57':'fopf','\uD835\uDCBB':'fscr','\uD835\uDD09':'Ffr','\uD835\uDD3D':'Fopf','\u2131':'Fscr','\uFB00':'fflig','\uFB03':'ffilig','\uFB04':'ffllig','\uFB01':'filig','fj':'fjlig','\uFB02':'fllig','\u0192':'fnof','\u210A':'gscr','\uD835\uDD58':'gopf','\uD835\uDD24':'gfr','\uD835\uDCA2':'Gscr','\uD835\uDD3E':'Gopf','\uD835\uDD0A':'Gfr','\u01F5':'gacute','\u011F':'gbreve','\u011E':'Gbreve','\u011D':'gcirc','\u011C':'Gcirc','\u0121':'gdot','\u0120':'Gdot','\u0122':'Gcedil','\uD835\uDD25':'hfr','\u210E':'planckh','\uD835\uDCBD':'hscr','\uD835\uDD59':'hopf','\u210B':'Hscr','\u210C':'Hfr','\u210D':'Hopf','\u0125':'hcirc','\u0124':'Hcirc','\u210F':'hbar','\u0127':'hstrok','\u0126':'Hstrok','\uD835\uDD5A':'iopf','\uD835\uDD26':'ifr','\uD835\uDCBE':'iscr','\u2148':'ii','\uD835\uDD40':'Iopf','\u2110':'Iscr','\u2111':'Im','\xED':'iacute','\xCD':'Iacute','\xEC':'igrave','\xCC':'Igrave','\xEE':'icirc','\xCE':'Icirc','\xEF':'iuml','\xCF':'Iuml','\u0129':'itilde','\u0128':'Itilde','\u0130':'Idot','\u012F':'iogon','\u012E':'Iogon','\u012B':'imacr','\u012A':'Imacr','\u0133':'ijlig','\u0132':'IJlig','\u0131':'imath','\uD835\uDCBF':'jscr','\uD835\uDD5B':'jopf','\uD835\uDD27':'jfr','\uD835\uDCA5':'Jscr','\uD835\uDD0D':'Jfr','\uD835\uDD41':'Jopf','\u0135':'jcirc','\u0134':'Jcirc','\u0237':'jmath','\uD835\uDD5C':'kopf','\uD835\uDCC0':'kscr','\uD835\uDD28':'kfr','\uD835\uDCA6':'Kscr','\uD835\uDD42':'Kopf','\uD835\uDD0E':'Kfr','\u0137':'kcedil','\u0136':'Kcedil','\uD835\uDD29':'lfr','\uD835\uDCC1':'lscr','\u2113':'ell','\uD835\uDD5D':'lopf','\u2112':'Lscr','\uD835\uDD0F':'Lfr','\uD835\uDD43':'Lopf','\u013A':'lacute','\u0139':'Lacute','\u013E':'lcaron','\u013D':'Lcaron','\u013C':'lcedil','\u013B':'Lcedil','\u0142':'lstrok','\u0141':'Lstrok','\u0140':'lmidot','\u013F':'Lmidot','\uD835\uDD2A':'mfr','\uD835\uDD5E':'mopf','\uD835\uDCC2':'mscr','\uD835\uDD10':'Mfr','\uD835\uDD44':'Mopf','\u2133':'Mscr','\uD835\uDD2B':'nfr','\uD835\uDD5F':'nopf','\uD835\uDCC3':'nscr','\u2115':'Nopf','\uD835\uDCA9':'Nscr','\uD835\uDD11':'Nfr','\u0144':'nacute','\u0143':'Nacute','\u0148':'ncaron','\u0147':'Ncaron','\xF1':'ntilde','\xD1':'Ntilde','\u0146':'ncedil','\u0145':'Ncedil','\u2116':'numero','\u014B':'eng','\u014A':'ENG','\uD835\uDD60':'oopf','\uD835\uDD2C':'ofr','\u2134':'oscr','\uD835\uDCAA':'Oscr','\uD835\uDD12':'Ofr','\uD835\uDD46':'Oopf','\xBA':'ordm','\xF3':'oacute','\xD3':'Oacute','\xF2':'ograve','\xD2':'Ograve','\xF4':'ocirc','\xD4':'Ocirc','\xF6':'ouml','\xD6':'Ouml','\u0151':'odblac','\u0150':'Odblac','\xF5':'otilde','\xD5':'Otilde','\xF8':'oslash','\xD8':'Oslash','\u014D':'omacr','\u014C':'Omacr','\u0153':'oelig','\u0152':'OElig','\uD835\uDD2D':'pfr','\uD835\uDCC5':'pscr','\uD835\uDD61':'popf','\u2119':'Popf','\uD835\uDD13':'Pfr','\uD835\uDCAB':'Pscr','\uD835\uDD62':'qopf','\uD835\uDD2E':'qfr','\uD835\uDCC6':'qscr','\uD835\uDCAC':'Qscr','\uD835\uDD14':'Qfr','\u211A':'Qopf','\u0138':'kgreen','\uD835\uDD2F':'rfr','\uD835\uDD63':'ropf','\uD835\uDCC7':'rscr','\u211B':'Rscr','\u211C':'Re','\u211D':'Ropf','\u0155':'racute','\u0154':'Racute','\u0159':'rcaron','\u0158':'Rcaron','\u0157':'rcedil','\u0156':'Rcedil','\uD835\uDD64':'sopf','\uD835\uDCC8':'sscr','\uD835\uDD30':'sfr','\uD835\uDD4A':'Sopf','\uD835\uDD16':'Sfr','\uD835\uDCAE':'Sscr','\u24C8':'oS','\u015B':'sacute','\u015A':'Sacute','\u015D':'scirc','\u015C':'Scirc','\u0161':'scaron','\u0160':'Scaron','\u015F':'scedil','\u015E':'Scedil','\xDF':'szlig','\uD835\uDD31':'tfr','\uD835\uDCC9':'tscr','\uD835\uDD65':'topf','\uD835\uDCAF':'Tscr','\uD835\uDD17':'Tfr','\uD835\uDD4B':'Topf','\u0165':'tcaron','\u0164':'Tcaron','\u0163':'tcedil','\u0162':'Tcedil','\u2122':'trade','\u0167':'tstrok','\u0166':'Tstrok','\uD835\uDCCA':'uscr','\uD835\uDD66':'uopf','\uD835\uDD32':'ufr','\uD835\uDD4C':'Uopf','\uD835\uDD18':'Ufr','\uD835\uDCB0':'Uscr','\xFA':'uacute','\xDA':'Uacute','\xF9':'ugrave','\xD9':'Ugrave','\u016D':'ubreve','\u016C':'Ubreve','\xFB':'ucirc','\xDB':'Ucirc','\u016F':'uring','\u016E':'Uring','\xFC':'uuml','\xDC':'Uuml','\u0171':'udblac','\u0170':'Udblac','\u0169':'utilde','\u0168':'Utilde','\u0173':'uogon','\u0172':'Uogon','\u016B':'umacr','\u016A':'Umacr','\uD835\uDD33':'vfr','\uD835\uDD67':'vopf','\uD835\uDCCB':'vscr','\uD835\uDD19':'Vfr','\uD835\uDD4D':'Vopf','\uD835\uDCB1':'Vscr','\uD835\uDD68':'wopf','\uD835\uDCCC':'wscr','\uD835\uDD34':'wfr','\uD835\uDCB2':'Wscr','\uD835\uDD4E':'Wopf','\uD835\uDD1A':'Wfr','\u0175':'wcirc','\u0174':'Wcirc','\uD835\uDD35':'xfr','\uD835\uDCCD':'xscr','\uD835\uDD69':'xopf','\uD835\uDD4F':'Xopf','\uD835\uDD1B':'Xfr','\uD835\uDCB3':'Xscr','\uD835\uDD36':'yfr','\uD835\uDCCE':'yscr','\uD835\uDD6A':'yopf','\uD835\uDCB4':'Yscr','\uD835\uDD1C':'Yfr','\uD835\uDD50':'Yopf','\xFD':'yacute','\xDD':'Yacute','\u0177':'ycirc','\u0176':'Ycirc','\xFF':'yuml','\u0178':'Yuml','\uD835\uDCCF':'zscr','\uD835\uDD37':'zfr','\uD835\uDD6B':'zopf','\u2128':'Zfr','\u2124':'Zopf','\uD835\uDCB5':'Zscr','\u017A':'zacute','\u0179':'Zacute','\u017E':'zcaron','\u017D':'Zcaron','\u017C':'zdot','\u017B':'Zdot','\u01B5':'imped','\xFE':'thorn','\xDE':'THORN','\u0149':'napos','\u03B1':'alpha','\u0391':'Alpha','\u03B2':'beta','\u0392':'Beta','\u03B3':'gamma','\u0393':'Gamma','\u03B4':'delta','\u0394':'Delta','\u03B5':'epsi','\u03F5':'epsiv','\u0395':'Epsilon','\u03DD':'gammad','\u03DC':'Gammad','\u03B6':'zeta','\u0396':'Zeta','\u03B7':'eta','\u0397':'Eta','\u03B8':'theta','\u03D1':'thetav','\u0398':'Theta','\u03B9':'iota','\u0399':'Iota','\u03BA':'kappa','\u03F0':'kappav','\u039A':'Kappa','\u03BB':'lambda','\u039B':'Lambda','\u03BC':'mu','\xB5':'micro','\u039C':'Mu','\u03BD':'nu','\u039D':'Nu','\u03BE':'xi','\u039E':'Xi','\u03BF':'omicron','\u039F':'Omicron','\u03C0':'pi','\u03D6':'piv','\u03A0':'Pi','\u03C1':'rho','\u03F1':'rhov','\u03A1':'Rho','\u03C3':'sigma','\u03A3':'Sigma','\u03C2':'sigmaf','\u03C4':'tau','\u03A4':'Tau','\u03C5':'upsi','\u03A5':'Upsilon','\u03D2':'Upsi','\u03C6':'phi','\u03D5':'phiv','\u03A6':'Phi','\u03C7':'chi','\u03A7':'Chi','\u03C8':'psi','\u03A8':'Psi','\u03C9':'omega','\u03A9':'ohm','\u0430':'acy','\u0410':'Acy','\u0431':'bcy','\u0411':'Bcy','\u0432':'vcy','\u0412':'Vcy','\u0433':'gcy','\u0413':'Gcy','\u0453':'gjcy','\u0403':'GJcy','\u0434':'dcy','\u0414':'Dcy','\u0452':'djcy','\u0402':'DJcy','\u0435':'iecy','\u0415':'IEcy','\u0451':'iocy','\u0401':'IOcy','\u0454':'jukcy','\u0404':'Jukcy','\u0436':'zhcy','\u0416':'ZHcy','\u0437':'zcy','\u0417':'Zcy','\u0455':'dscy','\u0405':'DScy','\u0438':'icy','\u0418':'Icy','\u0456':'iukcy','\u0406':'Iukcy','\u0457':'yicy','\u0407':'YIcy','\u0439':'jcy','\u0419':'Jcy','\u0458':'jsercy','\u0408':'Jsercy','\u043A':'kcy','\u041A':'Kcy','\u045C':'kjcy','\u040C':'KJcy','\u043B':'lcy','\u041B':'Lcy','\u0459':'ljcy','\u0409':'LJcy','\u043C':'mcy','\u041C':'Mcy','\u043D':'ncy','\u041D':'Ncy','\u045A':'njcy','\u040A':'NJcy','\u043E':'ocy','\u041E':'Ocy','\u043F':'pcy','\u041F':'Pcy','\u0440':'rcy','\u0420':'Rcy','\u0441':'scy','\u0421':'Scy','\u0442':'tcy','\u0422':'Tcy','\u045B':'tshcy','\u040B':'TSHcy','\u0443':'ucy','\u0423':'Ucy','\u045E':'ubrcy','\u040E':'Ubrcy','\u0444':'fcy','\u0424':'Fcy','\u0445':'khcy','\u0425':'KHcy','\u0446':'tscy','\u0426':'TScy','\u0447':'chcy','\u0427':'CHcy','\u045F':'dzcy','\u040F':'DZcy','\u0448':'shcy','\u0428':'SHcy','\u0449':'shchcy','\u0429':'SHCHcy','\u044A':'hardcy','\u042A':'HARDcy','\u044B':'ycy','\u042B':'Ycy','\u044C':'softcy','\u042C':'SOFTcy','\u044D':'ecy','\u042D':'Ecy','\u044E':'yucy','\u042E':'YUcy','\u044F':'yacy','\u042F':'YAcy','\u2135':'aleph','\u2136':'beth','\u2137':'gimel','\u2138':'daleth'};
	
		var regexEscape = /["&'<>`]/g;
		var escapeMap = {
			'"': '&quot;',
			'&': '&amp;',
			'\'': '&#x27;',
			'<': '&lt;',
			// See https://mathiasbynens.be/notes/ambiguous-ampersands: in HTML, the
			// following is not strictly necessary unless it’s part of a tag or an
			// unquoted attribute value. We’re only escaping it to support those
			// situations, and for XML support.
			'>': '&gt;',
			// In Internet Explorer ≤ 8, the backtick character can be used
			// to break out of (un)quoted attribute values or HTML comments.
			// See http://html5sec.org/#102, http://html5sec.org/#108, and
			// http://html5sec.org/#133.
			'`': '&#x60;'
		};
	
		var regexInvalidEntity = /&#(?:[xX][^a-fA-F0-9]|[^0-9xX])/;
		var regexInvalidRawCodePoint = /[\0-\x08\x0B\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]|[\uD83F\uD87F\uD8BF\uD8FF\uD93F\uD97F\uD9BF\uD9FF\uDA3F\uDA7F\uDABF\uDAFF\uDB3F\uDB7F\uDBBF\uDBFF][\uDFFE\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
		var regexDecode = /&#([0-9]+)(;?)|&#[xX]([a-fA-F0-9]+)(;?)|&([0-9a-zA-Z]+);|&(Aacute|Agrave|Atilde|Ccedil|Eacute|Egrave|Iacute|Igrave|Ntilde|Oacute|Ograve|Oslash|Otilde|Uacute|Ugrave|Yacute|aacute|agrave|atilde|brvbar|ccedil|curren|divide|eacute|egrave|frac12|frac14|frac34|iacute|igrave|iquest|middot|ntilde|oacute|ograve|oslash|otilde|plusmn|uacute|ugrave|yacute|AElig|Acirc|Aring|Ecirc|Icirc|Ocirc|THORN|Ucirc|acirc|acute|aelig|aring|cedil|ecirc|icirc|iexcl|laquo|micro|ocirc|pound|raquo|szlig|thorn|times|ucirc|Auml|COPY|Euml|Iuml|Ouml|QUOT|Uuml|auml|cent|copy|euml|iuml|macr|nbsp|ordf|ordm|ouml|para|quot|sect|sup1|sup2|sup3|uuml|yuml|AMP|ETH|REG|amp|deg|eth|not|reg|shy|uml|yen|GT|LT|gt|lt)([=a-zA-Z0-9])?/g;
		var decodeMap = {'aacute':'\xE1','Aacute':'\xC1','abreve':'\u0103','Abreve':'\u0102','ac':'\u223E','acd':'\u223F','acE':'\u223E\u0333','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','acy':'\u0430','Acy':'\u0410','aelig':'\xE6','AElig':'\xC6','af':'\u2061','afr':'\uD835\uDD1E','Afr':'\uD835\uDD04','agrave':'\xE0','Agrave':'\xC0','alefsym':'\u2135','aleph':'\u2135','alpha':'\u03B1','Alpha':'\u0391','amacr':'\u0101','Amacr':'\u0100','amalg':'\u2A3F','amp':'&','AMP':'&','and':'\u2227','And':'\u2A53','andand':'\u2A55','andd':'\u2A5C','andslope':'\u2A58','andv':'\u2A5A','ang':'\u2220','ange':'\u29A4','angle':'\u2220','angmsd':'\u2221','angmsdaa':'\u29A8','angmsdab':'\u29A9','angmsdac':'\u29AA','angmsdad':'\u29AB','angmsdae':'\u29AC','angmsdaf':'\u29AD','angmsdag':'\u29AE','angmsdah':'\u29AF','angrt':'\u221F','angrtvb':'\u22BE','angrtvbd':'\u299D','angsph':'\u2222','angst':'\xC5','angzarr':'\u237C','aogon':'\u0105','Aogon':'\u0104','aopf':'\uD835\uDD52','Aopf':'\uD835\uDD38','ap':'\u2248','apacir':'\u2A6F','ape':'\u224A','apE':'\u2A70','apid':'\u224B','apos':'\'','ApplyFunction':'\u2061','approx':'\u2248','approxeq':'\u224A','aring':'\xE5','Aring':'\xC5','ascr':'\uD835\uDCB6','Ascr':'\uD835\uDC9C','Assign':'\u2254','ast':'*','asymp':'\u2248','asympeq':'\u224D','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','awconint':'\u2233','awint':'\u2A11','backcong':'\u224C','backepsilon':'\u03F6','backprime':'\u2035','backsim':'\u223D','backsimeq':'\u22CD','Backslash':'\u2216','Barv':'\u2AE7','barvee':'\u22BD','barwed':'\u2305','Barwed':'\u2306','barwedge':'\u2305','bbrk':'\u23B5','bbrktbrk':'\u23B6','bcong':'\u224C','bcy':'\u0431','Bcy':'\u0411','bdquo':'\u201E','becaus':'\u2235','because':'\u2235','Because':'\u2235','bemptyv':'\u29B0','bepsi':'\u03F6','bernou':'\u212C','Bernoullis':'\u212C','beta':'\u03B2','Beta':'\u0392','beth':'\u2136','between':'\u226C','bfr':'\uD835\uDD1F','Bfr':'\uD835\uDD05','bigcap':'\u22C2','bigcirc':'\u25EF','bigcup':'\u22C3','bigodot':'\u2A00','bigoplus':'\u2A01','bigotimes':'\u2A02','bigsqcup':'\u2A06','bigstar':'\u2605','bigtriangledown':'\u25BD','bigtriangleup':'\u25B3','biguplus':'\u2A04','bigvee':'\u22C1','bigwedge':'\u22C0','bkarow':'\u290D','blacklozenge':'\u29EB','blacksquare':'\u25AA','blacktriangle':'\u25B4','blacktriangledown':'\u25BE','blacktriangleleft':'\u25C2','blacktriangleright':'\u25B8','blank':'\u2423','blk12':'\u2592','blk14':'\u2591','blk34':'\u2593','block':'\u2588','bne':'=\u20E5','bnequiv':'\u2261\u20E5','bnot':'\u2310','bNot':'\u2AED','bopf':'\uD835\uDD53','Bopf':'\uD835\uDD39','bot':'\u22A5','bottom':'\u22A5','bowtie':'\u22C8','boxbox':'\u29C9','boxdl':'\u2510','boxdL':'\u2555','boxDl':'\u2556','boxDL':'\u2557','boxdr':'\u250C','boxdR':'\u2552','boxDr':'\u2553','boxDR':'\u2554','boxh':'\u2500','boxH':'\u2550','boxhd':'\u252C','boxhD':'\u2565','boxHd':'\u2564','boxHD':'\u2566','boxhu':'\u2534','boxhU':'\u2568','boxHu':'\u2567','boxHU':'\u2569','boxminus':'\u229F','boxplus':'\u229E','boxtimes':'\u22A0','boxul':'\u2518','boxuL':'\u255B','boxUl':'\u255C','boxUL':'\u255D','boxur':'\u2514','boxuR':'\u2558','boxUr':'\u2559','boxUR':'\u255A','boxv':'\u2502','boxV':'\u2551','boxvh':'\u253C','boxvH':'\u256A','boxVh':'\u256B','boxVH':'\u256C','boxvl':'\u2524','boxvL':'\u2561','boxVl':'\u2562','boxVL':'\u2563','boxvr':'\u251C','boxvR':'\u255E','boxVr':'\u255F','boxVR':'\u2560','bprime':'\u2035','breve':'\u02D8','Breve':'\u02D8','brvbar':'\xA6','bscr':'\uD835\uDCB7','Bscr':'\u212C','bsemi':'\u204F','bsim':'\u223D','bsime':'\u22CD','bsol':'\\','bsolb':'\u29C5','bsolhsub':'\u27C8','bull':'\u2022','bullet':'\u2022','bump':'\u224E','bumpe':'\u224F','bumpE':'\u2AAE','bumpeq':'\u224F','Bumpeq':'\u224E','cacute':'\u0107','Cacute':'\u0106','cap':'\u2229','Cap':'\u22D2','capand':'\u2A44','capbrcup':'\u2A49','capcap':'\u2A4B','capcup':'\u2A47','capdot':'\u2A40','CapitalDifferentialD':'\u2145','caps':'\u2229\uFE00','caret':'\u2041','caron':'\u02C7','Cayleys':'\u212D','ccaps':'\u2A4D','ccaron':'\u010D','Ccaron':'\u010C','ccedil':'\xE7','Ccedil':'\xC7','ccirc':'\u0109','Ccirc':'\u0108','Cconint':'\u2230','ccups':'\u2A4C','ccupssm':'\u2A50','cdot':'\u010B','Cdot':'\u010A','cedil':'\xB8','Cedilla':'\xB8','cemptyv':'\u29B2','cent':'\xA2','centerdot':'\xB7','CenterDot':'\xB7','cfr':'\uD835\uDD20','Cfr':'\u212D','chcy':'\u0447','CHcy':'\u0427','check':'\u2713','checkmark':'\u2713','chi':'\u03C7','Chi':'\u03A7','cir':'\u25CB','circ':'\u02C6','circeq':'\u2257','circlearrowleft':'\u21BA','circlearrowright':'\u21BB','circledast':'\u229B','circledcirc':'\u229A','circleddash':'\u229D','CircleDot':'\u2299','circledR':'\xAE','circledS':'\u24C8','CircleMinus':'\u2296','CirclePlus':'\u2295','CircleTimes':'\u2297','cire':'\u2257','cirE':'\u29C3','cirfnint':'\u2A10','cirmid':'\u2AEF','cirscir':'\u29C2','ClockwiseContourIntegral':'\u2232','CloseCurlyDoubleQuote':'\u201D','CloseCurlyQuote':'\u2019','clubs':'\u2663','clubsuit':'\u2663','colon':':','Colon':'\u2237','colone':'\u2254','Colone':'\u2A74','coloneq':'\u2254','comma':',','commat':'@','comp':'\u2201','compfn':'\u2218','complement':'\u2201','complexes':'\u2102','cong':'\u2245','congdot':'\u2A6D','Congruent':'\u2261','conint':'\u222E','Conint':'\u222F','ContourIntegral':'\u222E','copf':'\uD835\uDD54','Copf':'\u2102','coprod':'\u2210','Coproduct':'\u2210','copy':'\xA9','COPY':'\xA9','copysr':'\u2117','CounterClockwiseContourIntegral':'\u2233','crarr':'\u21B5','cross':'\u2717','Cross':'\u2A2F','cscr':'\uD835\uDCB8','Cscr':'\uD835\uDC9E','csub':'\u2ACF','csube':'\u2AD1','csup':'\u2AD0','csupe':'\u2AD2','ctdot':'\u22EF','cudarrl':'\u2938','cudarrr':'\u2935','cuepr':'\u22DE','cuesc':'\u22DF','cularr':'\u21B6','cularrp':'\u293D','cup':'\u222A','Cup':'\u22D3','cupbrcap':'\u2A48','cupcap':'\u2A46','CupCap':'\u224D','cupcup':'\u2A4A','cupdot':'\u228D','cupor':'\u2A45','cups':'\u222A\uFE00','curarr':'\u21B7','curarrm':'\u293C','curlyeqprec':'\u22DE','curlyeqsucc':'\u22DF','curlyvee':'\u22CE','curlywedge':'\u22CF','curren':'\xA4','curvearrowleft':'\u21B6','curvearrowright':'\u21B7','cuvee':'\u22CE','cuwed':'\u22CF','cwconint':'\u2232','cwint':'\u2231','cylcty':'\u232D','dagger':'\u2020','Dagger':'\u2021','daleth':'\u2138','darr':'\u2193','dArr':'\u21D3','Darr':'\u21A1','dash':'\u2010','dashv':'\u22A3','Dashv':'\u2AE4','dbkarow':'\u290F','dblac':'\u02DD','dcaron':'\u010F','Dcaron':'\u010E','dcy':'\u0434','Dcy':'\u0414','dd':'\u2146','DD':'\u2145','ddagger':'\u2021','ddarr':'\u21CA','DDotrahd':'\u2911','ddotseq':'\u2A77','deg':'\xB0','Del':'\u2207','delta':'\u03B4','Delta':'\u0394','demptyv':'\u29B1','dfisht':'\u297F','dfr':'\uD835\uDD21','Dfr':'\uD835\uDD07','dHar':'\u2965','dharl':'\u21C3','dharr':'\u21C2','DiacriticalAcute':'\xB4','DiacriticalDot':'\u02D9','DiacriticalDoubleAcute':'\u02DD','DiacriticalGrave':'`','DiacriticalTilde':'\u02DC','diam':'\u22C4','diamond':'\u22C4','Diamond':'\u22C4','diamondsuit':'\u2666','diams':'\u2666','die':'\xA8','DifferentialD':'\u2146','digamma':'\u03DD','disin':'\u22F2','div':'\xF7','divide':'\xF7','divideontimes':'\u22C7','divonx':'\u22C7','djcy':'\u0452','DJcy':'\u0402','dlcorn':'\u231E','dlcrop':'\u230D','dollar':'$','dopf':'\uD835\uDD55','Dopf':'\uD835\uDD3B','dot':'\u02D9','Dot':'\xA8','DotDot':'\u20DC','doteq':'\u2250','doteqdot':'\u2251','DotEqual':'\u2250','dotminus':'\u2238','dotplus':'\u2214','dotsquare':'\u22A1','doublebarwedge':'\u2306','DoubleContourIntegral':'\u222F','DoubleDot':'\xA8','DoubleDownArrow':'\u21D3','DoubleLeftArrow':'\u21D0','DoubleLeftRightArrow':'\u21D4','DoubleLeftTee':'\u2AE4','DoubleLongLeftArrow':'\u27F8','DoubleLongLeftRightArrow':'\u27FA','DoubleLongRightArrow':'\u27F9','DoubleRightArrow':'\u21D2','DoubleRightTee':'\u22A8','DoubleUpArrow':'\u21D1','DoubleUpDownArrow':'\u21D5','DoubleVerticalBar':'\u2225','downarrow':'\u2193','Downarrow':'\u21D3','DownArrow':'\u2193','DownArrowBar':'\u2913','DownArrowUpArrow':'\u21F5','DownBreve':'\u0311','downdownarrows':'\u21CA','downharpoonleft':'\u21C3','downharpoonright':'\u21C2','DownLeftRightVector':'\u2950','DownLeftTeeVector':'\u295E','DownLeftVector':'\u21BD','DownLeftVectorBar':'\u2956','DownRightTeeVector':'\u295F','DownRightVector':'\u21C1','DownRightVectorBar':'\u2957','DownTee':'\u22A4','DownTeeArrow':'\u21A7','drbkarow':'\u2910','drcorn':'\u231F','drcrop':'\u230C','dscr':'\uD835\uDCB9','Dscr':'\uD835\uDC9F','dscy':'\u0455','DScy':'\u0405','dsol':'\u29F6','dstrok':'\u0111','Dstrok':'\u0110','dtdot':'\u22F1','dtri':'\u25BF','dtrif':'\u25BE','duarr':'\u21F5','duhar':'\u296F','dwangle':'\u29A6','dzcy':'\u045F','DZcy':'\u040F','dzigrarr':'\u27FF','eacute':'\xE9','Eacute':'\xC9','easter':'\u2A6E','ecaron':'\u011B','Ecaron':'\u011A','ecir':'\u2256','ecirc':'\xEA','Ecirc':'\xCA','ecolon':'\u2255','ecy':'\u044D','Ecy':'\u042D','eDDot':'\u2A77','edot':'\u0117','eDot':'\u2251','Edot':'\u0116','ee':'\u2147','efDot':'\u2252','efr':'\uD835\uDD22','Efr':'\uD835\uDD08','eg':'\u2A9A','egrave':'\xE8','Egrave':'\xC8','egs':'\u2A96','egsdot':'\u2A98','el':'\u2A99','Element':'\u2208','elinters':'\u23E7','ell':'\u2113','els':'\u2A95','elsdot':'\u2A97','emacr':'\u0113','Emacr':'\u0112','empty':'\u2205','emptyset':'\u2205','EmptySmallSquare':'\u25FB','emptyv':'\u2205','EmptyVerySmallSquare':'\u25AB','emsp':'\u2003','emsp13':'\u2004','emsp14':'\u2005','eng':'\u014B','ENG':'\u014A','ensp':'\u2002','eogon':'\u0119','Eogon':'\u0118','eopf':'\uD835\uDD56','Eopf':'\uD835\uDD3C','epar':'\u22D5','eparsl':'\u29E3','eplus':'\u2A71','epsi':'\u03B5','epsilon':'\u03B5','Epsilon':'\u0395','epsiv':'\u03F5','eqcirc':'\u2256','eqcolon':'\u2255','eqsim':'\u2242','eqslantgtr':'\u2A96','eqslantless':'\u2A95','Equal':'\u2A75','equals':'=','EqualTilde':'\u2242','equest':'\u225F','Equilibrium':'\u21CC','equiv':'\u2261','equivDD':'\u2A78','eqvparsl':'\u29E5','erarr':'\u2971','erDot':'\u2253','escr':'\u212F','Escr':'\u2130','esdot':'\u2250','esim':'\u2242','Esim':'\u2A73','eta':'\u03B7','Eta':'\u0397','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','euro':'\u20AC','excl':'!','exist':'\u2203','Exists':'\u2203','expectation':'\u2130','exponentiale':'\u2147','ExponentialE':'\u2147','fallingdotseq':'\u2252','fcy':'\u0444','Fcy':'\u0424','female':'\u2640','ffilig':'\uFB03','fflig':'\uFB00','ffllig':'\uFB04','ffr':'\uD835\uDD23','Ffr':'\uD835\uDD09','filig':'\uFB01','FilledSmallSquare':'\u25FC','FilledVerySmallSquare':'\u25AA','fjlig':'fj','flat':'\u266D','fllig':'\uFB02','fltns':'\u25B1','fnof':'\u0192','fopf':'\uD835\uDD57','Fopf':'\uD835\uDD3D','forall':'\u2200','ForAll':'\u2200','fork':'\u22D4','forkv':'\u2AD9','Fouriertrf':'\u2131','fpartint':'\u2A0D','frac12':'\xBD','frac13':'\u2153','frac14':'\xBC','frac15':'\u2155','frac16':'\u2159','frac18':'\u215B','frac23':'\u2154','frac25':'\u2156','frac34':'\xBE','frac35':'\u2157','frac38':'\u215C','frac45':'\u2158','frac56':'\u215A','frac58':'\u215D','frac78':'\u215E','frasl':'\u2044','frown':'\u2322','fscr':'\uD835\uDCBB','Fscr':'\u2131','gacute':'\u01F5','gamma':'\u03B3','Gamma':'\u0393','gammad':'\u03DD','Gammad':'\u03DC','gap':'\u2A86','gbreve':'\u011F','Gbreve':'\u011E','Gcedil':'\u0122','gcirc':'\u011D','Gcirc':'\u011C','gcy':'\u0433','Gcy':'\u0413','gdot':'\u0121','Gdot':'\u0120','ge':'\u2265','gE':'\u2267','gel':'\u22DB','gEl':'\u2A8C','geq':'\u2265','geqq':'\u2267','geqslant':'\u2A7E','ges':'\u2A7E','gescc':'\u2AA9','gesdot':'\u2A80','gesdoto':'\u2A82','gesdotol':'\u2A84','gesl':'\u22DB\uFE00','gesles':'\u2A94','gfr':'\uD835\uDD24','Gfr':'\uD835\uDD0A','gg':'\u226B','Gg':'\u22D9','ggg':'\u22D9','gimel':'\u2137','gjcy':'\u0453','GJcy':'\u0403','gl':'\u2277','gla':'\u2AA5','glE':'\u2A92','glj':'\u2AA4','gnap':'\u2A8A','gnapprox':'\u2A8A','gne':'\u2A88','gnE':'\u2269','gneq':'\u2A88','gneqq':'\u2269','gnsim':'\u22E7','gopf':'\uD835\uDD58','Gopf':'\uD835\uDD3E','grave':'`','GreaterEqual':'\u2265','GreaterEqualLess':'\u22DB','GreaterFullEqual':'\u2267','GreaterGreater':'\u2AA2','GreaterLess':'\u2277','GreaterSlantEqual':'\u2A7E','GreaterTilde':'\u2273','gscr':'\u210A','Gscr':'\uD835\uDCA2','gsim':'\u2273','gsime':'\u2A8E','gsiml':'\u2A90','gt':'>','Gt':'\u226B','GT':'>','gtcc':'\u2AA7','gtcir':'\u2A7A','gtdot':'\u22D7','gtlPar':'\u2995','gtquest':'\u2A7C','gtrapprox':'\u2A86','gtrarr':'\u2978','gtrdot':'\u22D7','gtreqless':'\u22DB','gtreqqless':'\u2A8C','gtrless':'\u2277','gtrsim':'\u2273','gvertneqq':'\u2269\uFE00','gvnE':'\u2269\uFE00','Hacek':'\u02C7','hairsp':'\u200A','half':'\xBD','hamilt':'\u210B','hardcy':'\u044A','HARDcy':'\u042A','harr':'\u2194','hArr':'\u21D4','harrcir':'\u2948','harrw':'\u21AD','Hat':'^','hbar':'\u210F','hcirc':'\u0125','Hcirc':'\u0124','hearts':'\u2665','heartsuit':'\u2665','hellip':'\u2026','hercon':'\u22B9','hfr':'\uD835\uDD25','Hfr':'\u210C','HilbertSpace':'\u210B','hksearow':'\u2925','hkswarow':'\u2926','hoarr':'\u21FF','homtht':'\u223B','hookleftarrow':'\u21A9','hookrightarrow':'\u21AA','hopf':'\uD835\uDD59','Hopf':'\u210D','horbar':'\u2015','HorizontalLine':'\u2500','hscr':'\uD835\uDCBD','Hscr':'\u210B','hslash':'\u210F','hstrok':'\u0127','Hstrok':'\u0126','HumpDownHump':'\u224E','HumpEqual':'\u224F','hybull':'\u2043','hyphen':'\u2010','iacute':'\xED','Iacute':'\xCD','ic':'\u2063','icirc':'\xEE','Icirc':'\xCE','icy':'\u0438','Icy':'\u0418','Idot':'\u0130','iecy':'\u0435','IEcy':'\u0415','iexcl':'\xA1','iff':'\u21D4','ifr':'\uD835\uDD26','Ifr':'\u2111','igrave':'\xEC','Igrave':'\xCC','ii':'\u2148','iiiint':'\u2A0C','iiint':'\u222D','iinfin':'\u29DC','iiota':'\u2129','ijlig':'\u0133','IJlig':'\u0132','Im':'\u2111','imacr':'\u012B','Imacr':'\u012A','image':'\u2111','ImaginaryI':'\u2148','imagline':'\u2110','imagpart':'\u2111','imath':'\u0131','imof':'\u22B7','imped':'\u01B5','Implies':'\u21D2','in':'\u2208','incare':'\u2105','infin':'\u221E','infintie':'\u29DD','inodot':'\u0131','int':'\u222B','Int':'\u222C','intcal':'\u22BA','integers':'\u2124','Integral':'\u222B','intercal':'\u22BA','Intersection':'\u22C2','intlarhk':'\u2A17','intprod':'\u2A3C','InvisibleComma':'\u2063','InvisibleTimes':'\u2062','iocy':'\u0451','IOcy':'\u0401','iogon':'\u012F','Iogon':'\u012E','iopf':'\uD835\uDD5A','Iopf':'\uD835\uDD40','iota':'\u03B9','Iota':'\u0399','iprod':'\u2A3C','iquest':'\xBF','iscr':'\uD835\uDCBE','Iscr':'\u2110','isin':'\u2208','isindot':'\u22F5','isinE':'\u22F9','isins':'\u22F4','isinsv':'\u22F3','isinv':'\u2208','it':'\u2062','itilde':'\u0129','Itilde':'\u0128','iukcy':'\u0456','Iukcy':'\u0406','iuml':'\xEF','Iuml':'\xCF','jcirc':'\u0135','Jcirc':'\u0134','jcy':'\u0439','Jcy':'\u0419','jfr':'\uD835\uDD27','Jfr':'\uD835\uDD0D','jmath':'\u0237','jopf':'\uD835\uDD5B','Jopf':'\uD835\uDD41','jscr':'\uD835\uDCBF','Jscr':'\uD835\uDCA5','jsercy':'\u0458','Jsercy':'\u0408','jukcy':'\u0454','Jukcy':'\u0404','kappa':'\u03BA','Kappa':'\u039A','kappav':'\u03F0','kcedil':'\u0137','Kcedil':'\u0136','kcy':'\u043A','Kcy':'\u041A','kfr':'\uD835\uDD28','Kfr':'\uD835\uDD0E','kgreen':'\u0138','khcy':'\u0445','KHcy':'\u0425','kjcy':'\u045C','KJcy':'\u040C','kopf':'\uD835\uDD5C','Kopf':'\uD835\uDD42','kscr':'\uD835\uDCC0','Kscr':'\uD835\uDCA6','lAarr':'\u21DA','lacute':'\u013A','Lacute':'\u0139','laemptyv':'\u29B4','lagran':'\u2112','lambda':'\u03BB','Lambda':'\u039B','lang':'\u27E8','Lang':'\u27EA','langd':'\u2991','langle':'\u27E8','lap':'\u2A85','Laplacetrf':'\u2112','laquo':'\xAB','larr':'\u2190','lArr':'\u21D0','Larr':'\u219E','larrb':'\u21E4','larrbfs':'\u291F','larrfs':'\u291D','larrhk':'\u21A9','larrlp':'\u21AB','larrpl':'\u2939','larrsim':'\u2973','larrtl':'\u21A2','lat':'\u2AAB','latail':'\u2919','lAtail':'\u291B','late':'\u2AAD','lates':'\u2AAD\uFE00','lbarr':'\u290C','lBarr':'\u290E','lbbrk':'\u2772','lbrace':'{','lbrack':'[','lbrke':'\u298B','lbrksld':'\u298F','lbrkslu':'\u298D','lcaron':'\u013E','Lcaron':'\u013D','lcedil':'\u013C','Lcedil':'\u013B','lceil':'\u2308','lcub':'{','lcy':'\u043B','Lcy':'\u041B','ldca':'\u2936','ldquo':'\u201C','ldquor':'\u201E','ldrdhar':'\u2967','ldrushar':'\u294B','ldsh':'\u21B2','le':'\u2264','lE':'\u2266','LeftAngleBracket':'\u27E8','leftarrow':'\u2190','Leftarrow':'\u21D0','LeftArrow':'\u2190','LeftArrowBar':'\u21E4','LeftArrowRightArrow':'\u21C6','leftarrowtail':'\u21A2','LeftCeiling':'\u2308','LeftDoubleBracket':'\u27E6','LeftDownTeeVector':'\u2961','LeftDownVector':'\u21C3','LeftDownVectorBar':'\u2959','LeftFloor':'\u230A','leftharpoondown':'\u21BD','leftharpoonup':'\u21BC','leftleftarrows':'\u21C7','leftrightarrow':'\u2194','Leftrightarrow':'\u21D4','LeftRightArrow':'\u2194','leftrightarrows':'\u21C6','leftrightharpoons':'\u21CB','leftrightsquigarrow':'\u21AD','LeftRightVector':'\u294E','LeftTee':'\u22A3','LeftTeeArrow':'\u21A4','LeftTeeVector':'\u295A','leftthreetimes':'\u22CB','LeftTriangle':'\u22B2','LeftTriangleBar':'\u29CF','LeftTriangleEqual':'\u22B4','LeftUpDownVector':'\u2951','LeftUpTeeVector':'\u2960','LeftUpVector':'\u21BF','LeftUpVectorBar':'\u2958','LeftVector':'\u21BC','LeftVectorBar':'\u2952','leg':'\u22DA','lEg':'\u2A8B','leq':'\u2264','leqq':'\u2266','leqslant':'\u2A7D','les':'\u2A7D','lescc':'\u2AA8','lesdot':'\u2A7F','lesdoto':'\u2A81','lesdotor':'\u2A83','lesg':'\u22DA\uFE00','lesges':'\u2A93','lessapprox':'\u2A85','lessdot':'\u22D6','lesseqgtr':'\u22DA','lesseqqgtr':'\u2A8B','LessEqualGreater':'\u22DA','LessFullEqual':'\u2266','LessGreater':'\u2276','lessgtr':'\u2276','LessLess':'\u2AA1','lesssim':'\u2272','LessSlantEqual':'\u2A7D','LessTilde':'\u2272','lfisht':'\u297C','lfloor':'\u230A','lfr':'\uD835\uDD29','Lfr':'\uD835\uDD0F','lg':'\u2276','lgE':'\u2A91','lHar':'\u2962','lhard':'\u21BD','lharu':'\u21BC','lharul':'\u296A','lhblk':'\u2584','ljcy':'\u0459','LJcy':'\u0409','ll':'\u226A','Ll':'\u22D8','llarr':'\u21C7','llcorner':'\u231E','Lleftarrow':'\u21DA','llhard':'\u296B','lltri':'\u25FA','lmidot':'\u0140','Lmidot':'\u013F','lmoust':'\u23B0','lmoustache':'\u23B0','lnap':'\u2A89','lnapprox':'\u2A89','lne':'\u2A87','lnE':'\u2268','lneq':'\u2A87','lneqq':'\u2268','lnsim':'\u22E6','loang':'\u27EC','loarr':'\u21FD','lobrk':'\u27E6','longleftarrow':'\u27F5','Longleftarrow':'\u27F8','LongLeftArrow':'\u27F5','longleftrightarrow':'\u27F7','Longleftrightarrow':'\u27FA','LongLeftRightArrow':'\u27F7','longmapsto':'\u27FC','longrightarrow':'\u27F6','Longrightarrow':'\u27F9','LongRightArrow':'\u27F6','looparrowleft':'\u21AB','looparrowright':'\u21AC','lopar':'\u2985','lopf':'\uD835\uDD5D','Lopf':'\uD835\uDD43','loplus':'\u2A2D','lotimes':'\u2A34','lowast':'\u2217','lowbar':'_','LowerLeftArrow':'\u2199','LowerRightArrow':'\u2198','loz':'\u25CA','lozenge':'\u25CA','lozf':'\u29EB','lpar':'(','lparlt':'\u2993','lrarr':'\u21C6','lrcorner':'\u231F','lrhar':'\u21CB','lrhard':'\u296D','lrm':'\u200E','lrtri':'\u22BF','lsaquo':'\u2039','lscr':'\uD835\uDCC1','Lscr':'\u2112','lsh':'\u21B0','Lsh':'\u21B0','lsim':'\u2272','lsime':'\u2A8D','lsimg':'\u2A8F','lsqb':'[','lsquo':'\u2018','lsquor':'\u201A','lstrok':'\u0142','Lstrok':'\u0141','lt':'<','Lt':'\u226A','LT':'<','ltcc':'\u2AA6','ltcir':'\u2A79','ltdot':'\u22D6','lthree':'\u22CB','ltimes':'\u22C9','ltlarr':'\u2976','ltquest':'\u2A7B','ltri':'\u25C3','ltrie':'\u22B4','ltrif':'\u25C2','ltrPar':'\u2996','lurdshar':'\u294A','luruhar':'\u2966','lvertneqq':'\u2268\uFE00','lvnE':'\u2268\uFE00','macr':'\xAF','male':'\u2642','malt':'\u2720','maltese':'\u2720','map':'\u21A6','Map':'\u2905','mapsto':'\u21A6','mapstodown':'\u21A7','mapstoleft':'\u21A4','mapstoup':'\u21A5','marker':'\u25AE','mcomma':'\u2A29','mcy':'\u043C','Mcy':'\u041C','mdash':'\u2014','mDDot':'\u223A','measuredangle':'\u2221','MediumSpace':'\u205F','Mellintrf':'\u2133','mfr':'\uD835\uDD2A','Mfr':'\uD835\uDD10','mho':'\u2127','micro':'\xB5','mid':'\u2223','midast':'*','midcir':'\u2AF0','middot':'\xB7','minus':'\u2212','minusb':'\u229F','minusd':'\u2238','minusdu':'\u2A2A','MinusPlus':'\u2213','mlcp':'\u2ADB','mldr':'\u2026','mnplus':'\u2213','models':'\u22A7','mopf':'\uD835\uDD5E','Mopf':'\uD835\uDD44','mp':'\u2213','mscr':'\uD835\uDCC2','Mscr':'\u2133','mstpos':'\u223E','mu':'\u03BC','Mu':'\u039C','multimap':'\u22B8','mumap':'\u22B8','nabla':'\u2207','nacute':'\u0144','Nacute':'\u0143','nang':'\u2220\u20D2','nap':'\u2249','napE':'\u2A70\u0338','napid':'\u224B\u0338','napos':'\u0149','napprox':'\u2249','natur':'\u266E','natural':'\u266E','naturals':'\u2115','nbsp':'\xA0','nbump':'\u224E\u0338','nbumpe':'\u224F\u0338','ncap':'\u2A43','ncaron':'\u0148','Ncaron':'\u0147','ncedil':'\u0146','Ncedil':'\u0145','ncong':'\u2247','ncongdot':'\u2A6D\u0338','ncup':'\u2A42','ncy':'\u043D','Ncy':'\u041D','ndash':'\u2013','ne':'\u2260','nearhk':'\u2924','nearr':'\u2197','neArr':'\u21D7','nearrow':'\u2197','nedot':'\u2250\u0338','NegativeMediumSpace':'\u200B','NegativeThickSpace':'\u200B','NegativeThinSpace':'\u200B','NegativeVeryThinSpace':'\u200B','nequiv':'\u2262','nesear':'\u2928','nesim':'\u2242\u0338','NestedGreaterGreater':'\u226B','NestedLessLess':'\u226A','NewLine':'\n','nexist':'\u2204','nexists':'\u2204','nfr':'\uD835\uDD2B','Nfr':'\uD835\uDD11','nge':'\u2271','ngE':'\u2267\u0338','ngeq':'\u2271','ngeqq':'\u2267\u0338','ngeqslant':'\u2A7E\u0338','nges':'\u2A7E\u0338','nGg':'\u22D9\u0338','ngsim':'\u2275','ngt':'\u226F','nGt':'\u226B\u20D2','ngtr':'\u226F','nGtv':'\u226B\u0338','nharr':'\u21AE','nhArr':'\u21CE','nhpar':'\u2AF2','ni':'\u220B','nis':'\u22FC','nisd':'\u22FA','niv':'\u220B','njcy':'\u045A','NJcy':'\u040A','nlarr':'\u219A','nlArr':'\u21CD','nldr':'\u2025','nle':'\u2270','nlE':'\u2266\u0338','nleftarrow':'\u219A','nLeftarrow':'\u21CD','nleftrightarrow':'\u21AE','nLeftrightarrow':'\u21CE','nleq':'\u2270','nleqq':'\u2266\u0338','nleqslant':'\u2A7D\u0338','nles':'\u2A7D\u0338','nless':'\u226E','nLl':'\u22D8\u0338','nlsim':'\u2274','nlt':'\u226E','nLt':'\u226A\u20D2','nltri':'\u22EA','nltrie':'\u22EC','nLtv':'\u226A\u0338','nmid':'\u2224','NoBreak':'\u2060','NonBreakingSpace':'\xA0','nopf':'\uD835\uDD5F','Nopf':'\u2115','not':'\xAC','Not':'\u2AEC','NotCongruent':'\u2262','NotCupCap':'\u226D','NotDoubleVerticalBar':'\u2226','NotElement':'\u2209','NotEqual':'\u2260','NotEqualTilde':'\u2242\u0338','NotExists':'\u2204','NotGreater':'\u226F','NotGreaterEqual':'\u2271','NotGreaterFullEqual':'\u2267\u0338','NotGreaterGreater':'\u226B\u0338','NotGreaterLess':'\u2279','NotGreaterSlantEqual':'\u2A7E\u0338','NotGreaterTilde':'\u2275','NotHumpDownHump':'\u224E\u0338','NotHumpEqual':'\u224F\u0338','notin':'\u2209','notindot':'\u22F5\u0338','notinE':'\u22F9\u0338','notinva':'\u2209','notinvb':'\u22F7','notinvc':'\u22F6','NotLeftTriangle':'\u22EA','NotLeftTriangleBar':'\u29CF\u0338','NotLeftTriangleEqual':'\u22EC','NotLess':'\u226E','NotLessEqual':'\u2270','NotLessGreater':'\u2278','NotLessLess':'\u226A\u0338','NotLessSlantEqual':'\u2A7D\u0338','NotLessTilde':'\u2274','NotNestedGreaterGreater':'\u2AA2\u0338','NotNestedLessLess':'\u2AA1\u0338','notni':'\u220C','notniva':'\u220C','notnivb':'\u22FE','notnivc':'\u22FD','NotPrecedes':'\u2280','NotPrecedesEqual':'\u2AAF\u0338','NotPrecedesSlantEqual':'\u22E0','NotReverseElement':'\u220C','NotRightTriangle':'\u22EB','NotRightTriangleBar':'\u29D0\u0338','NotRightTriangleEqual':'\u22ED','NotSquareSubset':'\u228F\u0338','NotSquareSubsetEqual':'\u22E2','NotSquareSuperset':'\u2290\u0338','NotSquareSupersetEqual':'\u22E3','NotSubset':'\u2282\u20D2','NotSubsetEqual':'\u2288','NotSucceeds':'\u2281','NotSucceedsEqual':'\u2AB0\u0338','NotSucceedsSlantEqual':'\u22E1','NotSucceedsTilde':'\u227F\u0338','NotSuperset':'\u2283\u20D2','NotSupersetEqual':'\u2289','NotTilde':'\u2241','NotTildeEqual':'\u2244','NotTildeFullEqual':'\u2247','NotTildeTilde':'\u2249','NotVerticalBar':'\u2224','npar':'\u2226','nparallel':'\u2226','nparsl':'\u2AFD\u20E5','npart':'\u2202\u0338','npolint':'\u2A14','npr':'\u2280','nprcue':'\u22E0','npre':'\u2AAF\u0338','nprec':'\u2280','npreceq':'\u2AAF\u0338','nrarr':'\u219B','nrArr':'\u21CF','nrarrc':'\u2933\u0338','nrarrw':'\u219D\u0338','nrightarrow':'\u219B','nRightarrow':'\u21CF','nrtri':'\u22EB','nrtrie':'\u22ED','nsc':'\u2281','nsccue':'\u22E1','nsce':'\u2AB0\u0338','nscr':'\uD835\uDCC3','Nscr':'\uD835\uDCA9','nshortmid':'\u2224','nshortparallel':'\u2226','nsim':'\u2241','nsime':'\u2244','nsimeq':'\u2244','nsmid':'\u2224','nspar':'\u2226','nsqsube':'\u22E2','nsqsupe':'\u22E3','nsub':'\u2284','nsube':'\u2288','nsubE':'\u2AC5\u0338','nsubset':'\u2282\u20D2','nsubseteq':'\u2288','nsubseteqq':'\u2AC5\u0338','nsucc':'\u2281','nsucceq':'\u2AB0\u0338','nsup':'\u2285','nsupe':'\u2289','nsupE':'\u2AC6\u0338','nsupset':'\u2283\u20D2','nsupseteq':'\u2289','nsupseteqq':'\u2AC6\u0338','ntgl':'\u2279','ntilde':'\xF1','Ntilde':'\xD1','ntlg':'\u2278','ntriangleleft':'\u22EA','ntrianglelefteq':'\u22EC','ntriangleright':'\u22EB','ntrianglerighteq':'\u22ED','nu':'\u03BD','Nu':'\u039D','num':'#','numero':'\u2116','numsp':'\u2007','nvap':'\u224D\u20D2','nvdash':'\u22AC','nvDash':'\u22AD','nVdash':'\u22AE','nVDash':'\u22AF','nvge':'\u2265\u20D2','nvgt':'>\u20D2','nvHarr':'\u2904','nvinfin':'\u29DE','nvlArr':'\u2902','nvle':'\u2264\u20D2','nvlt':'<\u20D2','nvltrie':'\u22B4\u20D2','nvrArr':'\u2903','nvrtrie':'\u22B5\u20D2','nvsim':'\u223C\u20D2','nwarhk':'\u2923','nwarr':'\u2196','nwArr':'\u21D6','nwarrow':'\u2196','nwnear':'\u2927','oacute':'\xF3','Oacute':'\xD3','oast':'\u229B','ocir':'\u229A','ocirc':'\xF4','Ocirc':'\xD4','ocy':'\u043E','Ocy':'\u041E','odash':'\u229D','odblac':'\u0151','Odblac':'\u0150','odiv':'\u2A38','odot':'\u2299','odsold':'\u29BC','oelig':'\u0153','OElig':'\u0152','ofcir':'\u29BF','ofr':'\uD835\uDD2C','Ofr':'\uD835\uDD12','ogon':'\u02DB','ograve':'\xF2','Ograve':'\xD2','ogt':'\u29C1','ohbar':'\u29B5','ohm':'\u03A9','oint':'\u222E','olarr':'\u21BA','olcir':'\u29BE','olcross':'\u29BB','oline':'\u203E','olt':'\u29C0','omacr':'\u014D','Omacr':'\u014C','omega':'\u03C9','Omega':'\u03A9','omicron':'\u03BF','Omicron':'\u039F','omid':'\u29B6','ominus':'\u2296','oopf':'\uD835\uDD60','Oopf':'\uD835\uDD46','opar':'\u29B7','OpenCurlyDoubleQuote':'\u201C','OpenCurlyQuote':'\u2018','operp':'\u29B9','oplus':'\u2295','or':'\u2228','Or':'\u2A54','orarr':'\u21BB','ord':'\u2A5D','order':'\u2134','orderof':'\u2134','ordf':'\xAA','ordm':'\xBA','origof':'\u22B6','oror':'\u2A56','orslope':'\u2A57','orv':'\u2A5B','oS':'\u24C8','oscr':'\u2134','Oscr':'\uD835\uDCAA','oslash':'\xF8','Oslash':'\xD8','osol':'\u2298','otilde':'\xF5','Otilde':'\xD5','otimes':'\u2297','Otimes':'\u2A37','otimesas':'\u2A36','ouml':'\xF6','Ouml':'\xD6','ovbar':'\u233D','OverBar':'\u203E','OverBrace':'\u23DE','OverBracket':'\u23B4','OverParenthesis':'\u23DC','par':'\u2225','para':'\xB6','parallel':'\u2225','parsim':'\u2AF3','parsl':'\u2AFD','part':'\u2202','PartialD':'\u2202','pcy':'\u043F','Pcy':'\u041F','percnt':'%','period':'.','permil':'\u2030','perp':'\u22A5','pertenk':'\u2031','pfr':'\uD835\uDD2D','Pfr':'\uD835\uDD13','phi':'\u03C6','Phi':'\u03A6','phiv':'\u03D5','phmmat':'\u2133','phone':'\u260E','pi':'\u03C0','Pi':'\u03A0','pitchfork':'\u22D4','piv':'\u03D6','planck':'\u210F','planckh':'\u210E','plankv':'\u210F','plus':'+','plusacir':'\u2A23','plusb':'\u229E','pluscir':'\u2A22','plusdo':'\u2214','plusdu':'\u2A25','pluse':'\u2A72','PlusMinus':'\xB1','plusmn':'\xB1','plussim':'\u2A26','plustwo':'\u2A27','pm':'\xB1','Poincareplane':'\u210C','pointint':'\u2A15','popf':'\uD835\uDD61','Popf':'\u2119','pound':'\xA3','pr':'\u227A','Pr':'\u2ABB','prap':'\u2AB7','prcue':'\u227C','pre':'\u2AAF','prE':'\u2AB3','prec':'\u227A','precapprox':'\u2AB7','preccurlyeq':'\u227C','Precedes':'\u227A','PrecedesEqual':'\u2AAF','PrecedesSlantEqual':'\u227C','PrecedesTilde':'\u227E','preceq':'\u2AAF','precnapprox':'\u2AB9','precneqq':'\u2AB5','precnsim':'\u22E8','precsim':'\u227E','prime':'\u2032','Prime':'\u2033','primes':'\u2119','prnap':'\u2AB9','prnE':'\u2AB5','prnsim':'\u22E8','prod':'\u220F','Product':'\u220F','profalar':'\u232E','profline':'\u2312','profsurf':'\u2313','prop':'\u221D','Proportion':'\u2237','Proportional':'\u221D','propto':'\u221D','prsim':'\u227E','prurel':'\u22B0','pscr':'\uD835\uDCC5','Pscr':'\uD835\uDCAB','psi':'\u03C8','Psi':'\u03A8','puncsp':'\u2008','qfr':'\uD835\uDD2E','Qfr':'\uD835\uDD14','qint':'\u2A0C','qopf':'\uD835\uDD62','Qopf':'\u211A','qprime':'\u2057','qscr':'\uD835\uDCC6','Qscr':'\uD835\uDCAC','quaternions':'\u210D','quatint':'\u2A16','quest':'?','questeq':'\u225F','quot':'"','QUOT':'"','rAarr':'\u21DB','race':'\u223D\u0331','racute':'\u0155','Racute':'\u0154','radic':'\u221A','raemptyv':'\u29B3','rang':'\u27E9','Rang':'\u27EB','rangd':'\u2992','range':'\u29A5','rangle':'\u27E9','raquo':'\xBB','rarr':'\u2192','rArr':'\u21D2','Rarr':'\u21A0','rarrap':'\u2975','rarrb':'\u21E5','rarrbfs':'\u2920','rarrc':'\u2933','rarrfs':'\u291E','rarrhk':'\u21AA','rarrlp':'\u21AC','rarrpl':'\u2945','rarrsim':'\u2974','rarrtl':'\u21A3','Rarrtl':'\u2916','rarrw':'\u219D','ratail':'\u291A','rAtail':'\u291C','ratio':'\u2236','rationals':'\u211A','rbarr':'\u290D','rBarr':'\u290F','RBarr':'\u2910','rbbrk':'\u2773','rbrace':'}','rbrack':']','rbrke':'\u298C','rbrksld':'\u298E','rbrkslu':'\u2990','rcaron':'\u0159','Rcaron':'\u0158','rcedil':'\u0157','Rcedil':'\u0156','rceil':'\u2309','rcub':'}','rcy':'\u0440','Rcy':'\u0420','rdca':'\u2937','rdldhar':'\u2969','rdquo':'\u201D','rdquor':'\u201D','rdsh':'\u21B3','Re':'\u211C','real':'\u211C','realine':'\u211B','realpart':'\u211C','reals':'\u211D','rect':'\u25AD','reg':'\xAE','REG':'\xAE','ReverseElement':'\u220B','ReverseEquilibrium':'\u21CB','ReverseUpEquilibrium':'\u296F','rfisht':'\u297D','rfloor':'\u230B','rfr':'\uD835\uDD2F','Rfr':'\u211C','rHar':'\u2964','rhard':'\u21C1','rharu':'\u21C0','rharul':'\u296C','rho':'\u03C1','Rho':'\u03A1','rhov':'\u03F1','RightAngleBracket':'\u27E9','rightarrow':'\u2192','Rightarrow':'\u21D2','RightArrow':'\u2192','RightArrowBar':'\u21E5','RightArrowLeftArrow':'\u21C4','rightarrowtail':'\u21A3','RightCeiling':'\u2309','RightDoubleBracket':'\u27E7','RightDownTeeVector':'\u295D','RightDownVector':'\u21C2','RightDownVectorBar':'\u2955','RightFloor':'\u230B','rightharpoondown':'\u21C1','rightharpoonup':'\u21C0','rightleftarrows':'\u21C4','rightleftharpoons':'\u21CC','rightrightarrows':'\u21C9','rightsquigarrow':'\u219D','RightTee':'\u22A2','RightTeeArrow':'\u21A6','RightTeeVector':'\u295B','rightthreetimes':'\u22CC','RightTriangle':'\u22B3','RightTriangleBar':'\u29D0','RightTriangleEqual':'\u22B5','RightUpDownVector':'\u294F','RightUpTeeVector':'\u295C','RightUpVector':'\u21BE','RightUpVectorBar':'\u2954','RightVector':'\u21C0','RightVectorBar':'\u2953','ring':'\u02DA','risingdotseq':'\u2253','rlarr':'\u21C4','rlhar':'\u21CC','rlm':'\u200F','rmoust':'\u23B1','rmoustache':'\u23B1','rnmid':'\u2AEE','roang':'\u27ED','roarr':'\u21FE','robrk':'\u27E7','ropar':'\u2986','ropf':'\uD835\uDD63','Ropf':'\u211D','roplus':'\u2A2E','rotimes':'\u2A35','RoundImplies':'\u2970','rpar':')','rpargt':'\u2994','rppolint':'\u2A12','rrarr':'\u21C9','Rrightarrow':'\u21DB','rsaquo':'\u203A','rscr':'\uD835\uDCC7','Rscr':'\u211B','rsh':'\u21B1','Rsh':'\u21B1','rsqb':']','rsquo':'\u2019','rsquor':'\u2019','rthree':'\u22CC','rtimes':'\u22CA','rtri':'\u25B9','rtrie':'\u22B5','rtrif':'\u25B8','rtriltri':'\u29CE','RuleDelayed':'\u29F4','ruluhar':'\u2968','rx':'\u211E','sacute':'\u015B','Sacute':'\u015A','sbquo':'\u201A','sc':'\u227B','Sc':'\u2ABC','scap':'\u2AB8','scaron':'\u0161','Scaron':'\u0160','sccue':'\u227D','sce':'\u2AB0','scE':'\u2AB4','scedil':'\u015F','Scedil':'\u015E','scirc':'\u015D','Scirc':'\u015C','scnap':'\u2ABA','scnE':'\u2AB6','scnsim':'\u22E9','scpolint':'\u2A13','scsim':'\u227F','scy':'\u0441','Scy':'\u0421','sdot':'\u22C5','sdotb':'\u22A1','sdote':'\u2A66','searhk':'\u2925','searr':'\u2198','seArr':'\u21D8','searrow':'\u2198','sect':'\xA7','semi':';','seswar':'\u2929','setminus':'\u2216','setmn':'\u2216','sext':'\u2736','sfr':'\uD835\uDD30','Sfr':'\uD835\uDD16','sfrown':'\u2322','sharp':'\u266F','shchcy':'\u0449','SHCHcy':'\u0429','shcy':'\u0448','SHcy':'\u0428','ShortDownArrow':'\u2193','ShortLeftArrow':'\u2190','shortmid':'\u2223','shortparallel':'\u2225','ShortRightArrow':'\u2192','ShortUpArrow':'\u2191','shy':'\xAD','sigma':'\u03C3','Sigma':'\u03A3','sigmaf':'\u03C2','sigmav':'\u03C2','sim':'\u223C','simdot':'\u2A6A','sime':'\u2243','simeq':'\u2243','simg':'\u2A9E','simgE':'\u2AA0','siml':'\u2A9D','simlE':'\u2A9F','simne':'\u2246','simplus':'\u2A24','simrarr':'\u2972','slarr':'\u2190','SmallCircle':'\u2218','smallsetminus':'\u2216','smashp':'\u2A33','smeparsl':'\u29E4','smid':'\u2223','smile':'\u2323','smt':'\u2AAA','smte':'\u2AAC','smtes':'\u2AAC\uFE00','softcy':'\u044C','SOFTcy':'\u042C','sol':'/','solb':'\u29C4','solbar':'\u233F','sopf':'\uD835\uDD64','Sopf':'\uD835\uDD4A','spades':'\u2660','spadesuit':'\u2660','spar':'\u2225','sqcap':'\u2293','sqcaps':'\u2293\uFE00','sqcup':'\u2294','sqcups':'\u2294\uFE00','Sqrt':'\u221A','sqsub':'\u228F','sqsube':'\u2291','sqsubset':'\u228F','sqsubseteq':'\u2291','sqsup':'\u2290','sqsupe':'\u2292','sqsupset':'\u2290','sqsupseteq':'\u2292','squ':'\u25A1','square':'\u25A1','Square':'\u25A1','SquareIntersection':'\u2293','SquareSubset':'\u228F','SquareSubsetEqual':'\u2291','SquareSuperset':'\u2290','SquareSupersetEqual':'\u2292','SquareUnion':'\u2294','squarf':'\u25AA','squf':'\u25AA','srarr':'\u2192','sscr':'\uD835\uDCC8','Sscr':'\uD835\uDCAE','ssetmn':'\u2216','ssmile':'\u2323','sstarf':'\u22C6','star':'\u2606','Star':'\u22C6','starf':'\u2605','straightepsilon':'\u03F5','straightphi':'\u03D5','strns':'\xAF','sub':'\u2282','Sub':'\u22D0','subdot':'\u2ABD','sube':'\u2286','subE':'\u2AC5','subedot':'\u2AC3','submult':'\u2AC1','subne':'\u228A','subnE':'\u2ACB','subplus':'\u2ABF','subrarr':'\u2979','subset':'\u2282','Subset':'\u22D0','subseteq':'\u2286','subseteqq':'\u2AC5','SubsetEqual':'\u2286','subsetneq':'\u228A','subsetneqq':'\u2ACB','subsim':'\u2AC7','subsub':'\u2AD5','subsup':'\u2AD3','succ':'\u227B','succapprox':'\u2AB8','succcurlyeq':'\u227D','Succeeds':'\u227B','SucceedsEqual':'\u2AB0','SucceedsSlantEqual':'\u227D','SucceedsTilde':'\u227F','succeq':'\u2AB0','succnapprox':'\u2ABA','succneqq':'\u2AB6','succnsim':'\u22E9','succsim':'\u227F','SuchThat':'\u220B','sum':'\u2211','Sum':'\u2211','sung':'\u266A','sup':'\u2283','Sup':'\u22D1','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','supdot':'\u2ABE','supdsub':'\u2AD8','supe':'\u2287','supE':'\u2AC6','supedot':'\u2AC4','Superset':'\u2283','SupersetEqual':'\u2287','suphsol':'\u27C9','suphsub':'\u2AD7','suplarr':'\u297B','supmult':'\u2AC2','supne':'\u228B','supnE':'\u2ACC','supplus':'\u2AC0','supset':'\u2283','Supset':'\u22D1','supseteq':'\u2287','supseteqq':'\u2AC6','supsetneq':'\u228B','supsetneqq':'\u2ACC','supsim':'\u2AC8','supsub':'\u2AD4','supsup':'\u2AD6','swarhk':'\u2926','swarr':'\u2199','swArr':'\u21D9','swarrow':'\u2199','swnwar':'\u292A','szlig':'\xDF','Tab':'\t','target':'\u2316','tau':'\u03C4','Tau':'\u03A4','tbrk':'\u23B4','tcaron':'\u0165','Tcaron':'\u0164','tcedil':'\u0163','Tcedil':'\u0162','tcy':'\u0442','Tcy':'\u0422','tdot':'\u20DB','telrec':'\u2315','tfr':'\uD835\uDD31','Tfr':'\uD835\uDD17','there4':'\u2234','therefore':'\u2234','Therefore':'\u2234','theta':'\u03B8','Theta':'\u0398','thetasym':'\u03D1','thetav':'\u03D1','thickapprox':'\u2248','thicksim':'\u223C','ThickSpace':'\u205F\u200A','thinsp':'\u2009','ThinSpace':'\u2009','thkap':'\u2248','thksim':'\u223C','thorn':'\xFE','THORN':'\xDE','tilde':'\u02DC','Tilde':'\u223C','TildeEqual':'\u2243','TildeFullEqual':'\u2245','TildeTilde':'\u2248','times':'\xD7','timesb':'\u22A0','timesbar':'\u2A31','timesd':'\u2A30','tint':'\u222D','toea':'\u2928','top':'\u22A4','topbot':'\u2336','topcir':'\u2AF1','topf':'\uD835\uDD65','Topf':'\uD835\uDD4B','topfork':'\u2ADA','tosa':'\u2929','tprime':'\u2034','trade':'\u2122','TRADE':'\u2122','triangle':'\u25B5','triangledown':'\u25BF','triangleleft':'\u25C3','trianglelefteq':'\u22B4','triangleq':'\u225C','triangleright':'\u25B9','trianglerighteq':'\u22B5','tridot':'\u25EC','trie':'\u225C','triminus':'\u2A3A','TripleDot':'\u20DB','triplus':'\u2A39','trisb':'\u29CD','tritime':'\u2A3B','trpezium':'\u23E2','tscr':'\uD835\uDCC9','Tscr':'\uD835\uDCAF','tscy':'\u0446','TScy':'\u0426','tshcy':'\u045B','TSHcy':'\u040B','tstrok':'\u0167','Tstrok':'\u0166','twixt':'\u226C','twoheadleftarrow':'\u219E','twoheadrightarrow':'\u21A0','uacute':'\xFA','Uacute':'\xDA','uarr':'\u2191','uArr':'\u21D1','Uarr':'\u219F','Uarrocir':'\u2949','ubrcy':'\u045E','Ubrcy':'\u040E','ubreve':'\u016D','Ubreve':'\u016C','ucirc':'\xFB','Ucirc':'\xDB','ucy':'\u0443','Ucy':'\u0423','udarr':'\u21C5','udblac':'\u0171','Udblac':'\u0170','udhar':'\u296E','ufisht':'\u297E','ufr':'\uD835\uDD32','Ufr':'\uD835\uDD18','ugrave':'\xF9','Ugrave':'\xD9','uHar':'\u2963','uharl':'\u21BF','uharr':'\u21BE','uhblk':'\u2580','ulcorn':'\u231C','ulcorner':'\u231C','ulcrop':'\u230F','ultri':'\u25F8','umacr':'\u016B','Umacr':'\u016A','uml':'\xA8','UnderBar':'_','UnderBrace':'\u23DF','UnderBracket':'\u23B5','UnderParenthesis':'\u23DD','Union':'\u22C3','UnionPlus':'\u228E','uogon':'\u0173','Uogon':'\u0172','uopf':'\uD835\uDD66','Uopf':'\uD835\uDD4C','uparrow':'\u2191','Uparrow':'\u21D1','UpArrow':'\u2191','UpArrowBar':'\u2912','UpArrowDownArrow':'\u21C5','updownarrow':'\u2195','Updownarrow':'\u21D5','UpDownArrow':'\u2195','UpEquilibrium':'\u296E','upharpoonleft':'\u21BF','upharpoonright':'\u21BE','uplus':'\u228E','UpperLeftArrow':'\u2196','UpperRightArrow':'\u2197','upsi':'\u03C5','Upsi':'\u03D2','upsih':'\u03D2','upsilon':'\u03C5','Upsilon':'\u03A5','UpTee':'\u22A5','UpTeeArrow':'\u21A5','upuparrows':'\u21C8','urcorn':'\u231D','urcorner':'\u231D','urcrop':'\u230E','uring':'\u016F','Uring':'\u016E','urtri':'\u25F9','uscr':'\uD835\uDCCA','Uscr':'\uD835\uDCB0','utdot':'\u22F0','utilde':'\u0169','Utilde':'\u0168','utri':'\u25B5','utrif':'\u25B4','uuarr':'\u21C8','uuml':'\xFC','Uuml':'\xDC','uwangle':'\u29A7','vangrt':'\u299C','varepsilon':'\u03F5','varkappa':'\u03F0','varnothing':'\u2205','varphi':'\u03D5','varpi':'\u03D6','varpropto':'\u221D','varr':'\u2195','vArr':'\u21D5','varrho':'\u03F1','varsigma':'\u03C2','varsubsetneq':'\u228A\uFE00','varsubsetneqq':'\u2ACB\uFE00','varsupsetneq':'\u228B\uFE00','varsupsetneqq':'\u2ACC\uFE00','vartheta':'\u03D1','vartriangleleft':'\u22B2','vartriangleright':'\u22B3','vBar':'\u2AE8','Vbar':'\u2AEB','vBarv':'\u2AE9','vcy':'\u0432','Vcy':'\u0412','vdash':'\u22A2','vDash':'\u22A8','Vdash':'\u22A9','VDash':'\u22AB','Vdashl':'\u2AE6','vee':'\u2228','Vee':'\u22C1','veebar':'\u22BB','veeeq':'\u225A','vellip':'\u22EE','verbar':'|','Verbar':'\u2016','vert':'|','Vert':'\u2016','VerticalBar':'\u2223','VerticalLine':'|','VerticalSeparator':'\u2758','VerticalTilde':'\u2240','VeryThinSpace':'\u200A','vfr':'\uD835\uDD33','Vfr':'\uD835\uDD19','vltri':'\u22B2','vnsub':'\u2282\u20D2','vnsup':'\u2283\u20D2','vopf':'\uD835\uDD67','Vopf':'\uD835\uDD4D','vprop':'\u221D','vrtri':'\u22B3','vscr':'\uD835\uDCCB','Vscr':'\uD835\uDCB1','vsubne':'\u228A\uFE00','vsubnE':'\u2ACB\uFE00','vsupne':'\u228B\uFE00','vsupnE':'\u2ACC\uFE00','Vvdash':'\u22AA','vzigzag':'\u299A','wcirc':'\u0175','Wcirc':'\u0174','wedbar':'\u2A5F','wedge':'\u2227','Wedge':'\u22C0','wedgeq':'\u2259','weierp':'\u2118','wfr':'\uD835\uDD34','Wfr':'\uD835\uDD1A','wopf':'\uD835\uDD68','Wopf':'\uD835\uDD4E','wp':'\u2118','wr':'\u2240','wreath':'\u2240','wscr':'\uD835\uDCCC','Wscr':'\uD835\uDCB2','xcap':'\u22C2','xcirc':'\u25EF','xcup':'\u22C3','xdtri':'\u25BD','xfr':'\uD835\uDD35','Xfr':'\uD835\uDD1B','xharr':'\u27F7','xhArr':'\u27FA','xi':'\u03BE','Xi':'\u039E','xlarr':'\u27F5','xlArr':'\u27F8','xmap':'\u27FC','xnis':'\u22FB','xodot':'\u2A00','xopf':'\uD835\uDD69','Xopf':'\uD835\uDD4F','xoplus':'\u2A01','xotime':'\u2A02','xrarr':'\u27F6','xrArr':'\u27F9','xscr':'\uD835\uDCCD','Xscr':'\uD835\uDCB3','xsqcup':'\u2A06','xuplus':'\u2A04','xutri':'\u25B3','xvee':'\u22C1','xwedge':'\u22C0','yacute':'\xFD','Yacute':'\xDD','yacy':'\u044F','YAcy':'\u042F','ycirc':'\u0177','Ycirc':'\u0176','ycy':'\u044B','Ycy':'\u042B','yen':'\xA5','yfr':'\uD835\uDD36','Yfr':'\uD835\uDD1C','yicy':'\u0457','YIcy':'\u0407','yopf':'\uD835\uDD6A','Yopf':'\uD835\uDD50','yscr':'\uD835\uDCCE','Yscr':'\uD835\uDCB4','yucy':'\u044E','YUcy':'\u042E','yuml':'\xFF','Yuml':'\u0178','zacute':'\u017A','Zacute':'\u0179','zcaron':'\u017E','Zcaron':'\u017D','zcy':'\u0437','Zcy':'\u0417','zdot':'\u017C','Zdot':'\u017B','zeetrf':'\u2128','ZeroWidthSpace':'\u200B','zeta':'\u03B6','Zeta':'\u0396','zfr':'\uD835\uDD37','Zfr':'\u2128','zhcy':'\u0436','ZHcy':'\u0416','zigrarr':'\u21DD','zopf':'\uD835\uDD6B','Zopf':'\u2124','zscr':'\uD835\uDCCF','Zscr':'\uD835\uDCB5','zwj':'\u200D','zwnj':'\u200C'};
		var decodeMapLegacy = {'aacute':'\xE1','Aacute':'\xC1','acirc':'\xE2','Acirc':'\xC2','acute':'\xB4','aelig':'\xE6','AElig':'\xC6','agrave':'\xE0','Agrave':'\xC0','amp':'&','AMP':'&','aring':'\xE5','Aring':'\xC5','atilde':'\xE3','Atilde':'\xC3','auml':'\xE4','Auml':'\xC4','brvbar':'\xA6','ccedil':'\xE7','Ccedil':'\xC7','cedil':'\xB8','cent':'\xA2','copy':'\xA9','COPY':'\xA9','curren':'\xA4','deg':'\xB0','divide':'\xF7','eacute':'\xE9','Eacute':'\xC9','ecirc':'\xEA','Ecirc':'\xCA','egrave':'\xE8','Egrave':'\xC8','eth':'\xF0','ETH':'\xD0','euml':'\xEB','Euml':'\xCB','frac12':'\xBD','frac14':'\xBC','frac34':'\xBE','gt':'>','GT':'>','iacute':'\xED','Iacute':'\xCD','icirc':'\xEE','Icirc':'\xCE','iexcl':'\xA1','igrave':'\xEC','Igrave':'\xCC','iquest':'\xBF','iuml':'\xEF','Iuml':'\xCF','laquo':'\xAB','lt':'<','LT':'<','macr':'\xAF','micro':'\xB5','middot':'\xB7','nbsp':'\xA0','not':'\xAC','ntilde':'\xF1','Ntilde':'\xD1','oacute':'\xF3','Oacute':'\xD3','ocirc':'\xF4','Ocirc':'\xD4','ograve':'\xF2','Ograve':'\xD2','ordf':'\xAA','ordm':'\xBA','oslash':'\xF8','Oslash':'\xD8','otilde':'\xF5','Otilde':'\xD5','ouml':'\xF6','Ouml':'\xD6','para':'\xB6','plusmn':'\xB1','pound':'\xA3','quot':'"','QUOT':'"','raquo':'\xBB','reg':'\xAE','REG':'\xAE','sect':'\xA7','shy':'\xAD','sup1':'\xB9','sup2':'\xB2','sup3':'\xB3','szlig':'\xDF','thorn':'\xFE','THORN':'\xDE','times':'\xD7','uacute':'\xFA','Uacute':'\xDA','ucirc':'\xFB','Ucirc':'\xDB','ugrave':'\xF9','Ugrave':'\xD9','uml':'\xA8','uuml':'\xFC','Uuml':'\xDC','yacute':'\xFD','Yacute':'\xDD','yen':'\xA5','yuml':'\xFF'};
		var decodeMapNumeric = {'0':'\uFFFD','128':'\u20AC','130':'\u201A','131':'\u0192','132':'\u201E','133':'\u2026','134':'\u2020','135':'\u2021','136':'\u02C6','137':'\u2030','138':'\u0160','139':'\u2039','140':'\u0152','142':'\u017D','145':'\u2018','146':'\u2019','147':'\u201C','148':'\u201D','149':'\u2022','150':'\u2013','151':'\u2014','152':'\u02DC','153':'\u2122','154':'\u0161','155':'\u203A','156':'\u0153','158':'\u017E','159':'\u0178'};
		var invalidReferenceCodePoints = [1,2,3,4,5,6,7,8,11,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,64976,64977,64978,64979,64980,64981,64982,64983,64984,64985,64986,64987,64988,64989,64990,64991,64992,64993,64994,64995,64996,64997,64998,64999,65000,65001,65002,65003,65004,65005,65006,65007,65534,65535,131070,131071,196606,196607,262142,262143,327678,327679,393214,393215,458750,458751,524286,524287,589822,589823,655358,655359,720894,720895,786430,786431,851966,851967,917502,917503,983038,983039,1048574,1048575,1114110,1114111];
	
		/*--------------------------------------------------------------------------*/
	
		var stringFromCharCode = String.fromCharCode;
	
		var object = {};
		var hasOwnProperty = object.hasOwnProperty;
		var has = function(object, propertyName) {
			return hasOwnProperty.call(object, propertyName);
		};
	
		var contains = function(array, value) {
			var index = -1;
			var length = array.length;
			while (++index < length) {
				if (array[index] == value) {
					return true;
				}
			}
			return false;
		};
	
		var merge = function(options, defaults) {
			if (!options) {
				return defaults;
			}
			var result = {};
			var key;
			for (key in defaults) {
				// A `hasOwnProperty` check is not needed here, since only recognized
				// option names are used anyway. Any others are ignored.
				result[key] = has(options, key) ? options[key] : defaults[key];
			}
			return result;
		};
	
		// Modified version of `ucs2encode`; see https://mths.be/punycode.
		var codePointToSymbol = function(codePoint, strict) {
			var output = '';
			if ((codePoint >= 0xD800 && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
				// See issue #4:
				// “Otherwise, if the number is in the range 0xD800 to 0xDFFF or is
				// greater than 0x10FFFF, then this is a parse error. Return a U+FFFD
				// REPLACEMENT CHARACTER.”
				if (strict) {
					parseError('character reference outside the permissible Unicode range');
				}
				return '\uFFFD';
			}
			if (has(decodeMapNumeric, codePoint)) {
				if (strict) {
					parseError('disallowed character reference');
				}
				return decodeMapNumeric[codePoint];
			}
			if (strict && contains(invalidReferenceCodePoints, codePoint)) {
				parseError('disallowed character reference');
			}
			if (codePoint > 0xFFFF) {
				codePoint -= 0x10000;
				output += stringFromCharCode(codePoint >>> 10 & 0x3FF | 0xD800);
				codePoint = 0xDC00 | codePoint & 0x3FF;
			}
			output += stringFromCharCode(codePoint);
			return output;
		};
	
		var hexEscape = function(codePoint) {
			return '&#x' + codePoint.toString(16).toUpperCase() + ';';
		};
	
		var decEscape = function(codePoint) {
			return '&#' + codePoint + ';';
		};
	
		var parseError = function(message) {
			throw Error('Parse error: ' + message);
		};
	
		/*--------------------------------------------------------------------------*/
	
		var encode = function(string, options) {
			options = merge(options, encode.options);
			var strict = options.strict;
			if (strict && regexInvalidRawCodePoint.test(string)) {
				parseError('forbidden code point');
			}
			var encodeEverything = options.encodeEverything;
			var useNamedReferences = options.useNamedReferences;
			var allowUnsafeSymbols = options.allowUnsafeSymbols;
			var escapeCodePoint = options.decimal ? decEscape : hexEscape;
	
			var escapeBmpSymbol = function(symbol) {
				return escapeCodePoint(symbol.charCodeAt(0));
			};
	
			if (encodeEverything) {
				// Encode ASCII symbols.
				string = string.replace(regexAsciiWhitelist, function(symbol) {
					// Use named references if requested & possible.
					if (useNamedReferences && has(encodeMap, symbol)) {
						return '&' + encodeMap[symbol] + ';';
					}
					return escapeBmpSymbol(symbol);
				});
				// Shorten a few escapes that represent two symbols, of which at least one
				// is within the ASCII range.
				if (useNamedReferences) {
					string = string
						.replace(/&gt;\u20D2/g, '&nvgt;')
						.replace(/&lt;\u20D2/g, '&nvlt;')
						.replace(/&#x66;&#x6A;/g, '&fjlig;');
				}
				// Encode non-ASCII symbols.
				if (useNamedReferences) {
					// Encode non-ASCII symbols that can be replaced with a named reference.
					string = string.replace(regexEncodeNonAscii, function(string) {
						// Note: there is no need to check `has(encodeMap, string)` here.
						return '&' + encodeMap[string] + ';';
					});
				}
				// Note: any remaining non-ASCII symbols are handled outside of the `if`.
			} else if (useNamedReferences) {
				// Apply named character references.
				// Encode `<>"'&` using named character references.
				if (!allowUnsafeSymbols) {
					string = string.replace(regexEscape, function(string) {
						return '&' + encodeMap[string] + ';'; // no need to check `has()` here
					});
				}
				// Shorten escapes that represent two symbols, of which at least one is
				// `<>"'&`.
				string = string
					.replace(/&gt;\u20D2/g, '&nvgt;')
					.replace(/&lt;\u20D2/g, '&nvlt;');
				// Encode non-ASCII symbols that can be replaced with a named reference.
				string = string.replace(regexEncodeNonAscii, function(string) {
					// Note: there is no need to check `has(encodeMap, string)` here.
					return '&' + encodeMap[string] + ';';
				});
			} else if (!allowUnsafeSymbols) {
				// Encode `<>"'&` using hexadecimal escapes, now that they’re not handled
				// using named character references.
				string = string.replace(regexEscape, escapeBmpSymbol);
			}
			return string
				// Encode astral symbols.
				.replace(regexAstralSymbols, function($0) {
					// https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
					var high = $0.charCodeAt(0);
					var low = $0.charCodeAt(1);
					var codePoint = (high - 0xD800) * 0x400 + low - 0xDC00 + 0x10000;
					return escapeCodePoint(codePoint);
				})
				// Encode any remaining BMP symbols that are not printable ASCII symbols
				// using a hexadecimal escape.
				.replace(regexBmpWhitelist, escapeBmpSymbol);
		};
		// Expose default options (so they can be overridden globally).
		encode.options = {
			'allowUnsafeSymbols': false,
			'encodeEverything': false,
			'strict': false,
			'useNamedReferences': false,
			'decimal' : false
		};
	
		var decode = function(html, options) {
			options = merge(options, decode.options);
			var strict = options.strict;
			if (strict && regexInvalidEntity.test(html)) {
				parseError('malformed character reference');
			}
			return html.replace(regexDecode, function($0, $1, $2, $3, $4, $5, $6, $7) {
				var codePoint;
				var semicolon;
				var decDigits;
				var hexDigits;
				var reference;
				var next;
				if ($1) {
					// Decode decimal escapes, e.g. `&#119558;`.
					decDigits = $1;
					semicolon = $2;
					if (strict && !semicolon) {
						parseError('character reference was not terminated by a semicolon');
					}
					codePoint = parseInt(decDigits, 10);
					return codePointToSymbol(codePoint, strict);
				}
				if ($3) {
					// Decode hexadecimal escapes, e.g. `&#x1D306;`.
					hexDigits = $3;
					semicolon = $4;
					if (strict && !semicolon) {
						parseError('character reference was not terminated by a semicolon');
					}
					codePoint = parseInt(hexDigits, 16);
					return codePointToSymbol(codePoint, strict);
				}
				if ($5) {
					// Decode named character references with trailing `;`, e.g. `&copy;`.
					reference = $5;
					if (has(decodeMap, reference)) {
						return decodeMap[reference];
					} else {
						// Ambiguous ampersand. https://mths.be/notes/ambiguous-ampersands
						if (strict) {
							parseError(
								'named character reference was not terminated by a semicolon'
							);
						}
						return $0;
					}
				}
				// If we’re still here, it’s a legacy reference for sure. No need for an
				// extra `if` check.
				// Decode named character references without trailing `;`, e.g. `&amp`
				// This is only a parse error if it gets converted to `&`, or if it is
				// followed by `=` in an attribute context.
				reference = $6;
				next = $7;
				if (next && options.isAttributeValue) {
					if (strict && next == '=') {
						parseError('`&` did not start a character reference');
					}
					return $0;
				} else {
					if (strict) {
						parseError(
							'named character reference was not terminated by a semicolon'
						);
					}
					// Note: there is no need to check `has(decodeMapLegacy, reference)`.
					return decodeMapLegacy[reference] + (next || '');
				}
			});
		};
		// Expose default options (so they can be overridden globally).
		decode.options = {
			'isAttributeValue': false,
			'strict': false
		};
	
		var escape = function(string) {
			return string.replace(regexEscape, function($0) {
				// Note: there is no need to check `has(escapeMap, $0)` here.
				return escapeMap[$0];
			});
		};
	
		/*--------------------------------------------------------------------------*/
	
		var he = {
			'version': '1.1.0',
			'encode': encode,
			'decode': decode,
			'escape': escape,
			'unescape': decode
		};
	
		// Some AMD build optimizers, like r.js, check for specific condition patterns
		// like the following:
		if (
			true
		) {
			!(__WEBPACK_AMD_DEFINE_RESULT__ = function() {
				return he;
			}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}	else if (freeExports && !freeExports.nodeType) {
			if (freeModule) { // in Node.js, io.js, or RingoJS v0.8.0+
				freeModule.exports = he;
			} else { // in Narwhal or RingoJS v0.7.0-
				for (var key in he) {
					has(he, key) && (freeExports[key] = he[key]);
				}
			}
		} else { // in Rhino or a web browser
			root.he = he;
		}
	
	}(this));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(12)(module), (function() { return this; }())))

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	/* tslint:disable:no-unused-variable */
	// Subject imported before Observable to bypass circular dependency issue since
	// Subject extends Observable and Observable references Subject in it's
	// definition
	var Subject_1 = __webpack_require__(15);
	exports.Subject = Subject_1.Subject;
	/* tslint:enable:no-unused-variable */
	var Observable_1 = __webpack_require__(16);
	exports.Observable = Observable_1.Observable;
	// statics
	/* tslint:disable:no-use-before-declare */
	__webpack_require__(32);
	__webpack_require__(36);
	__webpack_require__(39);
	__webpack_require__(51);
	__webpack_require__(55);
	__webpack_require__(58);
	__webpack_require__(60);
	__webpack_require__(63);
	__webpack_require__(71);
	__webpack_require__(74);
	__webpack_require__(77);
	__webpack_require__(79);
	__webpack_require__(81);
	__webpack_require__(84);
	__webpack_require__(93);
	__webpack_require__(96);
	__webpack_require__(98);
	__webpack_require__(102);
	__webpack_require__(104);
	__webpack_require__(106);
	__webpack_require__(109);
	__webpack_require__(112);
	__webpack_require__(115);
	__webpack_require__(118);
	__webpack_require__(122);
	//dom
	__webpack_require__(125);
	__webpack_require__(129);
	//operators
	__webpack_require__(137);
	__webpack_require__(139);
	__webpack_require__(141);
	__webpack_require__(143);
	__webpack_require__(145);
	__webpack_require__(147);
	__webpack_require__(149);
	__webpack_require__(151);
	__webpack_require__(153);
	__webpack_require__(154);
	__webpack_require__(155);
	__webpack_require__(157);
	__webpack_require__(160);
	__webpack_require__(163);
	__webpack_require__(165);
	__webpack_require__(167);
	__webpack_require__(169);
	__webpack_require__(171);
	__webpack_require__(173);
	__webpack_require__(175);
	__webpack_require__(177);
	__webpack_require__(179);
	__webpack_require__(181);
	__webpack_require__(183);
	__webpack_require__(185);
	__webpack_require__(187);
	__webpack_require__(189);
	__webpack_require__(191);
	__webpack_require__(193);
	__webpack_require__(196);
	__webpack_require__(198);
	__webpack_require__(200);
	__webpack_require__(202);
	__webpack_require__(204);
	__webpack_require__(207);
	__webpack_require__(212);
	__webpack_require__(214);
	__webpack_require__(216);
	__webpack_require__(218);
	__webpack_require__(220);
	__webpack_require__(222);
	__webpack_require__(224);
	__webpack_require__(226);
	__webpack_require__(227);
	__webpack_require__(229);
	__webpack_require__(231);
	__webpack_require__(234);
	__webpack_require__(235);
	__webpack_require__(236);
	__webpack_require__(237);
	__webpack_require__(238);
	__webpack_require__(240);
	__webpack_require__(242);
	__webpack_require__(246);
	__webpack_require__(247);
	__webpack_require__(248);
	__webpack_require__(250);
	__webpack_require__(253);
	__webpack_require__(255);
	__webpack_require__(257);
	__webpack_require__(260);
	__webpack_require__(262);
	__webpack_require__(264);
	__webpack_require__(265);
	__webpack_require__(266);
	__webpack_require__(268);
	__webpack_require__(270);
	__webpack_require__(272);
	__webpack_require__(274);
	__webpack_require__(276);
	__webpack_require__(278);
	__webpack_require__(280);
	__webpack_require__(282);
	__webpack_require__(284);
	__webpack_require__(286);
	__webpack_require__(288);
	__webpack_require__(290);
	__webpack_require__(292);
	__webpack_require__(294);
	__webpack_require__(303);
	__webpack_require__(305);
	__webpack_require__(307);
	__webpack_require__(309);
	__webpack_require__(311);
	__webpack_require__(313);
	__webpack_require__(315);
	__webpack_require__(317);
	__webpack_require__(319);
	__webpack_require__(321);
	__webpack_require__(323);
	__webpack_require__(325);
	__webpack_require__(327);
	__webpack_require__(329);
	__webpack_require__(331);
	__webpack_require__(333);
	__webpack_require__(335);
	__webpack_require__(337);
	__webpack_require__(339);
	__webpack_require__(341);
	__webpack_require__(343);
	__webpack_require__(345);
	__webpack_require__(346);
	/* tslint:disable:no-unused-variable */
	var Subscription_1 = __webpack_require__(21);
	exports.Subscription = Subscription_1.Subscription;
	var Subscriber_1 = __webpack_require__(19);
	exports.Subscriber = Subscriber_1.Subscriber;
	var AsyncSubject_1 = __webpack_require__(35);
	exports.AsyncSubject = AsyncSubject_1.AsyncSubject;
	var ReplaySubject_1 = __webpack_require__(132);
	exports.ReplaySubject = ReplaySubject_1.ReplaySubject;
	var BehaviorSubject_1 = __webpack_require__(259);
	exports.BehaviorSubject = BehaviorSubject_1.BehaviorSubject;
	var MulticastObservable_1 = __webpack_require__(244);
	exports.MulticastObservable = MulticastObservable_1.MulticastObservable;
	var ConnectableObservable_1 = __webpack_require__(245);
	exports.ConnectableObservable = ConnectableObservable_1.ConnectableObservable;
	var Notification_1 = __webpack_require__(70);
	exports.Notification = Notification_1.Notification;
	var EmptyError_1 = __webpack_require__(206);
	exports.EmptyError = EmptyError_1.EmptyError;
	var ArgumentOutOfRangeError_1 = __webpack_require__(195);
	exports.ArgumentOutOfRangeError = ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;
	var ObjectUnsubscribedError_1 = __webpack_require__(30);
	exports.ObjectUnsubscribedError = ObjectUnsubscribedError_1.ObjectUnsubscribedError;
	var UnsubscriptionError_1 = __webpack_require__(26);
	exports.UnsubscriptionError = UnsubscriptionError_1.UnsubscriptionError;
	var timeInterval_1 = __webpack_require__(322);
	exports.TimeInterval = timeInterval_1.TimeInterval;
	var timestamp_1 = __webpack_require__(328);
	exports.Timestamp = timestamp_1.Timestamp;
	var TestScheduler_1 = __webpack_require__(348);
	exports.TestScheduler = TestScheduler_1.TestScheduler;
	var VirtualTimeScheduler_1 = __webpack_require__(354);
	exports.VirtualTimeScheduler = VirtualTimeScheduler_1.VirtualTimeScheduler;
	var AjaxObservable_1 = __webpack_require__(127);
	exports.AjaxResponse = AjaxObservable_1.AjaxResponse;
	exports.AjaxError = AjaxObservable_1.AjaxError;
	exports.AjaxTimeoutError = AjaxObservable_1.AjaxTimeoutError;
	var asap_1 = __webpack_require__(297);
	var async_1 = __webpack_require__(88);
	var queue_1 = __webpack_require__(133);
	var animationFrame_1 = __webpack_require__(355);
	var rxSubscriber_1 = __webpack_require__(28);
	var iterator_1 = __webpack_require__(49);
	var observable_1 = __webpack_require__(29);
	/* tslint:enable:no-unused-variable */
	/**
	 * @typedef {Object} Rx.Scheduler
	 * @property {Scheduler} queue Schedules on a queue in the current event frame
	 * (trampoline scheduler). Use this for iteration operations.
	 * @property {Scheduler} asap Schedules on the micro task queue, which uses the
	 * fastest transport mechanism available, either Node.js' `process.nextTick()`
	 * or Web Worker MessageChannel or setTimeout or others. Use this for
	 * asynchronous conversions.
	 * @property {Scheduler} async Schedules work with `setInterval`. Use this for
	 * time-based operations.
	 * @property {Scheduler} animationFrame Schedules work with `requestAnimationFrame`.
	 * Use this for synchronizing with the platform's painting
	 */
	var Scheduler = {
	    asap: asap_1.asap,
	    queue: queue_1.queue,
	    animationFrame: animationFrame_1.animationFrame,
	    async: async_1.async
	};
	exports.Scheduler = Scheduler;
	/**
	 * @typedef {Object} Rx.Symbol
	 * @property {Symbol|string} rxSubscriber A symbol to use as a property name to
	 * retrieve an "Rx safe" Observer from an object. "Rx safety" can be defined as
	 * an object that has all of the traits of an Rx Subscriber, including the
	 * ability to add and remove subscriptions to the subscription chain and
	 * guarantees involving event triggering (can't "next" after unsubscription,
	 * etc).
	 * @property {Symbol|string} observable A symbol to use as a property name to
	 * retrieve an Observable as defined by the [ECMAScript "Observable" spec](https://github.com/zenparsing/es-observable).
	 * @property {Symbol|string} iterator The ES6 symbol to use as a property name
	 * to retrieve an iterator from an object.
	 */
	var Symbol = {
	    rxSubscriber: rxSubscriber_1.$$rxSubscriber,
	    observable: observable_1.$$observable,
	    iterator: iterator_1.$$iterator
	};
	exports.Symbol = Symbol;


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var Subscriber_1 = __webpack_require__(19);
	var Subscription_1 = __webpack_require__(21);
	var ObjectUnsubscribedError_1 = __webpack_require__(30);
	var SubjectSubscription_1 = __webpack_require__(31);
	var rxSubscriber_1 = __webpack_require__(28);
	/**
	 * @class SubjectSubscriber<T>
	 */
	var SubjectSubscriber = (function (_super) {
	    __extends(SubjectSubscriber, _super);
	    function SubjectSubscriber(destination) {
	        _super.call(this, destination);
	        this.destination = destination;
	    }
	    return SubjectSubscriber;
	}(Subscriber_1.Subscriber));
	exports.SubjectSubscriber = SubjectSubscriber;
	/**
	 * @class Subject<T>
	 */
	var Subject = (function (_super) {
	    __extends(Subject, _super);
	    function Subject() {
	        _super.call(this);
	        this.observers = [];
	        this.closed = false;
	        this.isStopped = false;
	        this.hasError = false;
	        this.thrownError = null;
	    }
	    Subject.prototype[rxSubscriber_1.$$rxSubscriber] = function () {
	        return new SubjectSubscriber(this);
	    };
	    Subject.prototype.lift = function (operator) {
	        var subject = new AnonymousSubject(this, this);
	        subject.operator = operator;
	        return subject;
	    };
	    Subject.prototype.next = function (value) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        if (!this.isStopped) {
	            var observers = this.observers;
	            var len = observers.length;
	            var copy = observers.slice();
	            for (var i = 0; i < len; i++) {
	                copy[i].next(value);
	            }
	        }
	    };
	    Subject.prototype.error = function (err) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        this.hasError = true;
	        this.thrownError = err;
	        this.isStopped = true;
	        var observers = this.observers;
	        var len = observers.length;
	        var copy = observers.slice();
	        for (var i = 0; i < len; i++) {
	            copy[i].error(err);
	        }
	        this.observers.length = 0;
	    };
	    Subject.prototype.complete = function () {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        this.isStopped = true;
	        var observers = this.observers;
	        var len = observers.length;
	        var copy = observers.slice();
	        for (var i = 0; i < len; i++) {
	            copy[i].complete();
	        }
	        this.observers.length = 0;
	    };
	    Subject.prototype.unsubscribe = function () {
	        this.isStopped = true;
	        this.closed = true;
	        this.observers = null;
	    };
	    Subject.prototype._subscribe = function (subscriber) {
	        if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        else if (this.hasError) {
	            subscriber.error(this.thrownError);
	            return Subscription_1.Subscription.EMPTY;
	        }
	        else if (this.isStopped) {
	            subscriber.complete();
	            return Subscription_1.Subscription.EMPTY;
	        }
	        else {
	            this.observers.push(subscriber);
	            return new SubjectSubscription_1.SubjectSubscription(this, subscriber);
	        }
	    };
	    Subject.prototype.asObservable = function () {
	        var observable = new Observable_1.Observable();
	        observable.source = this;
	        return observable;
	    };
	    Subject.create = function (destination, source) {
	        return new AnonymousSubject(destination, source);
	    };
	    return Subject;
	}(Observable_1.Observable));
	exports.Subject = Subject;
	/**
	 * @class AnonymousSubject<T>
	 */
	var AnonymousSubject = (function (_super) {
	    __extends(AnonymousSubject, _super);
	    function AnonymousSubject(destination, source) {
	        _super.call(this);
	        this.destination = destination;
	        this.source = source;
	    }
	    AnonymousSubject.prototype.next = function (value) {
	        var destination = this.destination;
	        if (destination && destination.next) {
	            destination.next(value);
	        }
	    };
	    AnonymousSubject.prototype.error = function (err) {
	        var destination = this.destination;
	        if (destination && destination.error) {
	            this.destination.error(err);
	        }
	    };
	    AnonymousSubject.prototype.complete = function () {
	        var destination = this.destination;
	        if (destination && destination.complete) {
	            this.destination.complete();
	        }
	    };
	    AnonymousSubject.prototype._subscribe = function (subscriber) {
	        var source = this.source;
	        if (source) {
	            return this.source.subscribe(subscriber);
	        }
	        else {
	            return Subscription_1.Subscription.EMPTY;
	        }
	    };
	    return AnonymousSubject;
	}(Subject));
	exports.AnonymousSubject = AnonymousSubject;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var toSubscriber_1 = __webpack_require__(18);
	var observable_1 = __webpack_require__(29);
	/**
	 * A representation of any set of values over any amount of time. This the most basic building block
	 * of RxJS.
	 *
	 * @class Observable<T>
	 */
	var Observable = (function () {
	    /**
	     * @constructor
	     * @param {Function} subscribe the function that is  called when the Observable is
	     * initially subscribed to. This function is given a Subscriber, to which new values
	     * can be `next`ed, or an `error` method can be called to raise an error, or
	     * `complete` can be called to notify of a successful completion.
	     */
	    function Observable(subscribe) {
	        this._isScalar = false;
	        if (subscribe) {
	            this._subscribe = subscribe;
	        }
	    }
	    /**
	     * Creates a new Observable, with this Observable as the source, and the passed
	     * operator defined as the new observable's operator.
	     * @method lift
	     * @param {Operator} operator the operator defining the operation to take on the observable
	     * @return {Observable} a new observable with the Operator applied
	     */
	    Observable.prototype.lift = function (operator) {
	        var observable = new Observable();
	        observable.source = this;
	        observable.operator = operator;
	        return observable;
	    };
	    /**
	     * Registers handlers for handling emitted values, error and completions from the observable, and
	     *  executes the observable's subscriber function, which will take action to set up the underlying data stream
	     * @method subscribe
	     * @param {PartialObserver|Function} observerOrNext (optional) either an observer defining all functions to be called,
	     *  or the first of three possible handlers, which is the handler for each value emitted from the observable.
	     * @param {Function} error (optional) a handler for a terminal event resulting from an error. If no error handler is provided,
	     *  the error will be thrown as unhandled
	     * @param {Function} complete (optional) a handler for a terminal event resulting from successful completion.
	     * @return {ISubscription} a subscription reference to the registered handlers
	     */
	    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
	        var operator = this.operator;
	        var sink = toSubscriber_1.toSubscriber(observerOrNext, error, complete);
	        if (operator) {
	            operator.call(sink, this);
	        }
	        else {
	            sink.add(this._subscribe(sink));
	        }
	        if (sink.syncErrorThrowable) {
	            sink.syncErrorThrowable = false;
	            if (sink.syncErrorThrown) {
	                throw sink.syncErrorValue;
	            }
	        }
	        return sink;
	    };
	    /**
	     * @method forEach
	     * @param {Function} next a handler for each value emitted by the observable
	     * @param {PromiseConstructor} [PromiseCtor] a constructor function used to instantiate the Promise
	     * @return {Promise} a promise that either resolves on observable completion or
	     *  rejects with the handled error
	     */
	    Observable.prototype.forEach = function (next, PromiseCtor) {
	        var _this = this;
	        if (!PromiseCtor) {
	            if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
	                PromiseCtor = root_1.root.Rx.config.Promise;
	            }
	            else if (root_1.root.Promise) {
	                PromiseCtor = root_1.root.Promise;
	            }
	        }
	        if (!PromiseCtor) {
	            throw new Error('no Promise impl found');
	        }
	        return new PromiseCtor(function (resolve, reject) {
	            var subscription = _this.subscribe(function (value) {
	                if (subscription) {
	                    // if there is a subscription, then we can surmise
	                    // the next handling is asynchronous. Any errors thrown
	                    // need to be rejected explicitly and unsubscribe must be
	                    // called manually
	                    try {
	                        next(value);
	                    }
	                    catch (err) {
	                        reject(err);
	                        subscription.unsubscribe();
	                    }
	                }
	                else {
	                    // if there is NO subscription, then we're getting a nexted
	                    // value synchronously during subscription. We can just call it.
	                    // If it errors, Observable's `subscribe` will ensure the
	                    // unsubscription logic is called, then synchronously rethrow the error.
	                    // After that, Promise will trap the error and send it
	                    // down the rejection path.
	                    next(value);
	                }
	            }, reject, resolve);
	        });
	    };
	    Observable.prototype._subscribe = function (subscriber) {
	        return this.source.subscribe(subscriber);
	    };
	    /**
	     * An interop point defined by the es7-observable spec https://github.com/zenparsing/es-observable
	     * @method Symbol.observable
	     * @return {Observable} this instance of the observable
	     */
	    Observable.prototype[observable_1.$$observable] = function () {
	        return this;
	    };
	    // HACK: Since TypeScript inherits static properties too, we have to
	    // fight against TypeScript here so Subject can have a different static create signature
	    /**
	     * Creates a new cold Observable by calling the Observable constructor
	     * @static true
	     * @owner Observable
	     * @method create
	     * @param {Function} subscribe? the subscriber function to be passed to the Observable constructor
	     * @return {Observable} a new cold observable
	     */
	    Observable.create = function (subscribe) {
	        return new Observable(subscribe);
	    };
	    return Observable;
	}());
	exports.Observable = Observable;


/***/ },
/* 17 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {"use strict";
	var objectTypes = {
	    'boolean': false,
	    'function': true,
	    'object': true,
	    'number': false,
	    'string': false,
	    'undefined': false
	};
	exports.root = (objectTypes[typeof self] && self) || (objectTypes[typeof window] && window);
	var freeGlobal = objectTypes[typeof global] && global;
	if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
	    exports.root = freeGlobal;
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Subscriber_1 = __webpack_require__(19);
	var rxSubscriber_1 = __webpack_require__(28);
	function toSubscriber(nextOrObserver, error, complete) {
	    if (nextOrObserver) {
	        if (nextOrObserver instanceof Subscriber_1.Subscriber) {
	            return nextOrObserver;
	        }
	        if (nextOrObserver[rxSubscriber_1.$$rxSubscriber]) {
	            return nextOrObserver[rxSubscriber_1.$$rxSubscriber]();
	        }
	    }
	    if (!nextOrObserver && !error && !complete) {
	        return new Subscriber_1.Subscriber();
	    }
	    return new Subscriber_1.Subscriber(nextOrObserver, error, complete);
	}
	exports.toSubscriber = toSubscriber;


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var isFunction_1 = __webpack_require__(20);
	var Subscription_1 = __webpack_require__(21);
	var Observer_1 = __webpack_require__(27);
	var rxSubscriber_1 = __webpack_require__(28);
	/**
	 * Implements the {@link Observer} interface and extends the
	 * {@link Subscription} class. While the {@link Observer} is the public API for
	 * consuming the values of an {@link Observable}, all Observers get converted to
	 * a Subscriber, in order to provide Subscription-like capabilities such as
	 * `unsubscribe`. Subscriber is a common type in RxJS, and crucial for
	 * implementing operators, but it is rarely used as a public API.
	 *
	 * @class Subscriber<T>
	 */
	var Subscriber = (function (_super) {
	    __extends(Subscriber, _super);
	    /**
	     * @param {Observer|function(value: T): void} [destinationOrNext] A partially
	     * defined Observer or a `next` callback function.
	     * @param {function(e: ?any): void} [error] The `error` callback of an
	     * Observer.
	     * @param {function(): void} [complete] The `complete` callback of an
	     * Observer.
	     */
	    function Subscriber(destinationOrNext, error, complete) {
	        _super.call(this);
	        this.syncErrorValue = null;
	        this.syncErrorThrown = false;
	        this.syncErrorThrowable = false;
	        this.isStopped = false;
	        switch (arguments.length) {
	            case 0:
	                this.destination = Observer_1.empty;
	                break;
	            case 1:
	                if (!destinationOrNext) {
	                    this.destination = Observer_1.empty;
	                    break;
	                }
	                if (typeof destinationOrNext === 'object') {
	                    if (destinationOrNext instanceof Subscriber) {
	                        this.destination = destinationOrNext;
	                        this.destination.add(this);
	                    }
	                    else {
	                        this.syncErrorThrowable = true;
	                        this.destination = new SafeSubscriber(this, destinationOrNext);
	                    }
	                    break;
	                }
	            default:
	                this.syncErrorThrowable = true;
	                this.destination = new SafeSubscriber(this, destinationOrNext, error, complete);
	                break;
	        }
	    }
	    Subscriber.prototype[rxSubscriber_1.$$rxSubscriber] = function () { return this; };
	    /**
	     * A static factory for a Subscriber, given a (potentially partial) definition
	     * of an Observer.
	     * @param {function(x: ?T): void} [next] The `next` callback of an Observer.
	     * @param {function(e: ?any): void} [error] The `error` callback of an
	     * Observer.
	     * @param {function(): void} [complete] The `complete` callback of an
	     * Observer.
	     * @return {Subscriber<T>} A Subscriber wrapping the (partially defined)
	     * Observer represented by the given arguments.
	     */
	    Subscriber.create = function (next, error, complete) {
	        var subscriber = new Subscriber(next, error, complete);
	        subscriber.syncErrorThrowable = false;
	        return subscriber;
	    };
	    /**
	     * The {@link Observer} callback to receive notifications of type `next` from
	     * the Observable, with a value. The Observable may call this method 0 or more
	     * times.
	     * @param {T} [value] The `next` value.
	     * @return {void}
	     */
	    Subscriber.prototype.next = function (value) {
	        if (!this.isStopped) {
	            this._next(value);
	        }
	    };
	    /**
	     * The {@link Observer} callback to receive notifications of type `error` from
	     * the Observable, with an attached {@link Error}. Notifies the Observer that
	     * the Observable has experienced an error condition.
	     * @param {any} [err] The `error` exception.
	     * @return {void}
	     */
	    Subscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            this.isStopped = true;
	            this._error(err);
	        }
	    };
	    /**
	     * The {@link Observer} callback to receive a valueless notification of type
	     * `complete` from the Observable. Notifies the Observer that the Observable
	     * has finished sending push-based notifications.
	     * @return {void}
	     */
	    Subscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            this.isStopped = true;
	            this._complete();
	        }
	    };
	    Subscriber.prototype.unsubscribe = function () {
	        if (this.closed) {
	            return;
	        }
	        this.isStopped = true;
	        _super.prototype.unsubscribe.call(this);
	    };
	    Subscriber.prototype._next = function (value) {
	        this.destination.next(value);
	    };
	    Subscriber.prototype._error = function (err) {
	        this.destination.error(err);
	        this.unsubscribe();
	    };
	    Subscriber.prototype._complete = function () {
	        this.destination.complete();
	        this.unsubscribe();
	    };
	    return Subscriber;
	}(Subscription_1.Subscription));
	exports.Subscriber = Subscriber;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SafeSubscriber = (function (_super) {
	    __extends(SafeSubscriber, _super);
	    function SafeSubscriber(_parent, observerOrNext, error, complete) {
	        _super.call(this);
	        this._parent = _parent;
	        var next;
	        var context = this;
	        if (isFunction_1.isFunction(observerOrNext)) {
	            next = observerOrNext;
	        }
	        else if (observerOrNext) {
	            context = observerOrNext;
	            next = observerOrNext.next;
	            error = observerOrNext.error;
	            complete = observerOrNext.complete;
	            if (isFunction_1.isFunction(context.unsubscribe)) {
	                this.add(context.unsubscribe.bind(context));
	            }
	            context.unsubscribe = this.unsubscribe.bind(this);
	        }
	        this._context = context;
	        this._next = next;
	        this._error = error;
	        this._complete = complete;
	    }
	    SafeSubscriber.prototype.next = function (value) {
	        if (!this.isStopped && this._next) {
	            var _parent = this._parent;
	            if (!_parent.syncErrorThrowable) {
	                this.__tryOrUnsub(this._next, value);
	            }
	            else if (this.__tryOrSetError(_parent, this._next, value)) {
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var _parent = this._parent;
	            if (this._error) {
	                if (!_parent.syncErrorThrowable) {
	                    this.__tryOrUnsub(this._error, err);
	                    this.unsubscribe();
	                }
	                else {
	                    this.__tryOrSetError(_parent, this._error, err);
	                    this.unsubscribe();
	                }
	            }
	            else if (!_parent.syncErrorThrowable) {
	                this.unsubscribe();
	                throw err;
	            }
	            else {
	                _parent.syncErrorValue = err;
	                _parent.syncErrorThrown = true;
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            var _parent = this._parent;
	            if (this._complete) {
	                if (!_parent.syncErrorThrowable) {
	                    this.__tryOrUnsub(this._complete);
	                    this.unsubscribe();
	                }
	                else {
	                    this.__tryOrSetError(_parent, this._complete);
	                    this.unsubscribe();
	                }
	            }
	            else {
	                this.unsubscribe();
	            }
	        }
	    };
	    SafeSubscriber.prototype.__tryOrUnsub = function (fn, value) {
	        try {
	            fn.call(this._context, value);
	        }
	        catch (err) {
	            this.unsubscribe();
	            throw err;
	        }
	    };
	    SafeSubscriber.prototype.__tryOrSetError = function (parent, fn, value) {
	        try {
	            fn.call(this._context, value);
	        }
	        catch (err) {
	            parent.syncErrorValue = err;
	            parent.syncErrorThrown = true;
	            return true;
	        }
	        return false;
	    };
	    SafeSubscriber.prototype._unsubscribe = function () {
	        var _parent = this._parent;
	        this._context = null;
	        this._parent = null;
	        _parent.unsubscribe();
	    };
	    return SafeSubscriber;
	}(Subscriber));


/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";
	function isFunction(x) {
	    return typeof x === 'function';
	}
	exports.isFunction = isFunction;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var isArray_1 = __webpack_require__(22);
	var isObject_1 = __webpack_require__(23);
	var isFunction_1 = __webpack_require__(20);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var UnsubscriptionError_1 = __webpack_require__(26);
	/**
	 * Represents a disposable resource, such as the execution of an Observable. A
	 * Subscription has one important method, `unsubscribe`, that takes no argument
	 * and just disposes the resource held by the subscription.
	 *
	 * Additionally, subscriptions may be grouped together through the `add()`
	 * method, which will attach a child Subscription to the current Subscription.
	 * When a Subscription is unsubscribed, all its children (and its grandchildren)
	 * will be unsubscribed as well.
	 *
	 * @class Subscription
	 */
	var Subscription = (function () {
	    /**
	     * @param {function(): void} [unsubscribe] A function describing how to
	     * perform the disposal of resources when the `unsubscribe` method is called.
	     */
	    function Subscription(unsubscribe) {
	        /**
	         * A flag to indicate whether this Subscription has already been unsubscribed.
	         * @type {boolean}
	         */
	        this.closed = false;
	        if (unsubscribe) {
	            this._unsubscribe = unsubscribe;
	        }
	    }
	    /**
	     * Disposes the resources held by the subscription. May, for instance, cancel
	     * an ongoing Observable execution or cancel any other type of work that
	     * started when the Subscription was created.
	     * @return {void}
	     */
	    Subscription.prototype.unsubscribe = function () {
	        var hasErrors = false;
	        var errors;
	        if (this.closed) {
	            return;
	        }
	        this.closed = true;
	        var _a = this, _unsubscribe = _a._unsubscribe, _subscriptions = _a._subscriptions;
	        this._subscriptions = null;
	        if (isFunction_1.isFunction(_unsubscribe)) {
	            var trial = tryCatch_1.tryCatch(_unsubscribe).call(this);
	            if (trial === errorObject_1.errorObject) {
	                hasErrors = true;
	                (errors = errors || []).push(errorObject_1.errorObject.e);
	            }
	        }
	        if (isArray_1.isArray(_subscriptions)) {
	            var index = -1;
	            var len = _subscriptions.length;
	            while (++index < len) {
	                var sub = _subscriptions[index];
	                if (isObject_1.isObject(sub)) {
	                    var trial = tryCatch_1.tryCatch(sub.unsubscribe).call(sub);
	                    if (trial === errorObject_1.errorObject) {
	                        hasErrors = true;
	                        errors = errors || [];
	                        var err = errorObject_1.errorObject.e;
	                        if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
	                            errors = errors.concat(err.errors);
	                        }
	                        else {
	                            errors.push(err);
	                        }
	                    }
	                }
	            }
	        }
	        if (hasErrors) {
	            throw new UnsubscriptionError_1.UnsubscriptionError(errors);
	        }
	    };
	    /**
	     * Adds a tear down to be called during the unsubscribe() of this
	     * Subscription.
	     *
	     * If the tear down being added is a subscription that is already
	     * unsubscribed, is the same reference `add` is being called on, or is
	     * `Subscription.EMPTY`, it will not be added.
	     *
	     * If this subscription is already in an `closed` state, the passed
	     * tear down logic will be executed immediately.
	     *
	     * @param {TeardownLogic} teardown The additional logic to execute on
	     * teardown.
	     * @return {Subscription} Returns the Subscription used or created to be
	     * added to the inner subscriptions list. This Subscription can be used with
	     * `remove()` to remove the passed teardown logic from the inner subscriptions
	     * list.
	     */
	    Subscription.prototype.add = function (teardown) {
	        if (!teardown || (teardown === Subscription.EMPTY)) {
	            return Subscription.EMPTY;
	        }
	        if (teardown === this) {
	            return this;
	        }
	        var sub = teardown;
	        switch (typeof teardown) {
	            case 'function':
	                sub = new Subscription(teardown);
	            case 'object':
	                if (sub.closed || typeof sub.unsubscribe !== 'function') {
	                    break;
	                }
	                else if (this.closed) {
	                    sub.unsubscribe();
	                }
	                else {
	                    (this._subscriptions || (this._subscriptions = [])).push(sub);
	                }
	                break;
	            default:
	                throw new Error('unrecognized teardown ' + teardown + ' added to Subscription.');
	        }
	        return sub;
	    };
	    /**
	     * Removes a Subscription from the internal list of subscriptions that will
	     * unsubscribe during the unsubscribe process of this Subscription.
	     * @param {Subscription} subscription The subscription to remove.
	     * @return {void}
	     */
	    Subscription.prototype.remove = function (subscription) {
	        // HACK: This might be redundant because of the logic in `add()`
	        if (subscription == null || (subscription === this) || (subscription === Subscription.EMPTY)) {
	            return;
	        }
	        var subscriptions = this._subscriptions;
	        if (subscriptions) {
	            var subscriptionIndex = subscriptions.indexOf(subscription);
	            if (subscriptionIndex !== -1) {
	                subscriptions.splice(subscriptionIndex, 1);
	            }
	        }
	    };
	    Subscription.EMPTY = (function (empty) {
	        empty.closed = true;
	        return empty;
	    }(new Subscription()));
	    return Subscription;
	}());
	exports.Subscription = Subscription;


/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";
	exports.isArray = Array.isArray || (function (x) { return x && typeof x.length === 'number'; });


/***/ },
/* 23 */
/***/ function(module, exports) {

	"use strict";
	function isObject(x) {
	    return x != null && typeof x === 'object';
	}
	exports.isObject = isObject;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var errorObject_1 = __webpack_require__(25);
	var tryCatchTarget;
	function tryCatcher() {
	    try {
	        return tryCatchTarget.apply(this, arguments);
	    }
	    catch (e) {
	        errorObject_1.errorObject.e = e;
	        return errorObject_1.errorObject;
	    }
	}
	function tryCatch(fn) {
	    tryCatchTarget = fn;
	    return tryCatcher;
	}
	exports.tryCatch = tryCatch;
	;


/***/ },
/* 25 */
/***/ function(module, exports) {

	"use strict";
	// typeof any so that it we don't have to cast when comparing a result to the error object
	exports.errorObject = { e: {} };


/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/**
	 * An error thrown when one or more errors have occurred during the
	 * `unsubscribe` of a {@link Subscription}.
	 */
	var UnsubscriptionError = (function (_super) {
	    __extends(UnsubscriptionError, _super);
	    function UnsubscriptionError(errors) {
	        _super.call(this);
	        this.errors = errors;
	        var err = Error.call(this, errors ?
	            errors.length + " errors occurred during unsubscription:\n  " + errors.map(function (err, i) { return ((i + 1) + ") " + err.toString()); }).join('\n  ') : '');
	        this.name = err.name = 'UnsubscriptionError';
	        this.stack = err.stack;
	        this.message = err.message;
	    }
	    return UnsubscriptionError;
	}(Error));
	exports.UnsubscriptionError = UnsubscriptionError;


/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";
	exports.empty = {
	    closed: true,
	    next: function (value) { },
	    error: function (err) { throw err; },
	    complete: function () { }
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var Symbol = root_1.root.Symbol;
	exports.$$rxSubscriber = (typeof Symbol === 'function' && typeof Symbol.for === 'function') ?
	    Symbol.for('rxSubscriber') : '@@rxSubscriber';


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	function getSymbolObservable(context) {
	    var $$observable;
	    var Symbol = context.Symbol;
	    if (typeof Symbol === 'function') {
	        if (Symbol.observable) {
	            $$observable = Symbol.observable;
	        }
	        else {
	            $$observable = Symbol('observable');
	            Symbol.observable = $$observable;
	        }
	    }
	    else {
	        $$observable = '@@observable';
	    }
	    return $$observable;
	}
	exports.getSymbolObservable = getSymbolObservable;
	exports.$$observable = getSymbolObservable(root_1.root);


/***/ },
/* 30 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/**
	 * An error thrown when an action is invalid because the object has been
	 * unsubscribed.
	 *
	 * @see {@link Subject}
	 * @see {@link BehaviorSubject}
	 *
	 * @class ObjectUnsubscribedError
	 */
	var ObjectUnsubscribedError = (function (_super) {
	    __extends(ObjectUnsubscribedError, _super);
	    function ObjectUnsubscribedError() {
	        var err = _super.call(this, 'object unsubscribed');
	        this.name = err.name = 'ObjectUnsubscribedError';
	        this.stack = err.stack;
	        this.message = err.message;
	    }
	    return ObjectUnsubscribedError;
	}(Error));
	exports.ObjectUnsubscribedError = ObjectUnsubscribedError;


/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscription_1 = __webpack_require__(21);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SubjectSubscription = (function (_super) {
	    __extends(SubjectSubscription, _super);
	    function SubjectSubscription(subject, subscriber) {
	        _super.call(this);
	        this.subject = subject;
	        this.subscriber = subscriber;
	        this.closed = false;
	    }
	    SubjectSubscription.prototype.unsubscribe = function () {
	        if (this.closed) {
	            return;
	        }
	        this.closed = true;
	        var subject = this.subject;
	        var observers = subject.observers;
	        this.subject = null;
	        if (!observers || observers.length === 0 || subject.isStopped || subject.closed) {
	            return;
	        }
	        var subscriberIndex = observers.indexOf(this.subscriber);
	        if (subscriberIndex !== -1) {
	            observers.splice(subscriberIndex, 1);
	        }
	    };
	    return SubjectSubscription;
	}(Subscription_1.Subscription));
	exports.SubjectSubscription = SubjectSubscription;


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var bindCallback_1 = __webpack_require__(33);
	Observable_1.Observable.bindCallback = bindCallback_1.bindCallback;


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BoundCallbackObservable_1 = __webpack_require__(34);
	exports.bindCallback = BoundCallbackObservable_1.BoundCallbackObservable.create;


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var AsyncSubject_1 = __webpack_require__(35);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var BoundCallbackObservable = (function (_super) {
	    __extends(BoundCallbackObservable, _super);
	    function BoundCallbackObservable(callbackFunc, selector, args, scheduler) {
	        _super.call(this);
	        this.callbackFunc = callbackFunc;
	        this.selector = selector;
	        this.args = args;
	        this.scheduler = scheduler;
	    }
	    /* tslint:enable:max-line-length */
	    /**
	     * Converts a callback API to a function that returns an Observable.
	     *
	     * <span class="informal">Give it a function `f` of type `f(x, callback)` and
	     * it will return a function `g` that when called as `g(x)` will output an
	     * Observable.</span>
	     *
	     * `bindCallback` is not an operator because its input and output are not
	     * Observables. The input is a function `func` with some parameters, but the
	     * last parameter must be a callback function that `func` calls when it is
	     * done. The output of `bindCallback` is a function that takes the same
	     * parameters as `func`, except the last one (the callback). When the output
	     * function is called with arguments, it will return an Observable where the
	     * results will be delivered to.
	     *
	     * @example <caption>Convert jQuery's getJSON to an Observable API</caption>
	     * // Suppose we have jQuery.getJSON('/my/url', callback)
	     * var getJSONAsObservable = Rx.Observable.bindCallback(jQuery.getJSON);
	     * var result = getJSONAsObservable('/my/url');
	     * result.subscribe(x => console.log(x), e => console.error(e));
	     *
	     * @see {@link bindNodeCallback}
	     * @see {@link from}
	     * @see {@link fromPromise}
	     *
	     * @param {function} func Function with a callback as the last parameter.
	     * @param {function} selector A function which takes the arguments from the
	     * callback and maps those a value to emit on the output Observable.
	     * @param {Scheduler} [scheduler] The scheduler on which to schedule the
	     * callbacks.
	     * @return {function(...params: *): Observable} A function which returns the
	     * Observable that delivers the same values the callback would deliver.
	     * @static true
	     * @name bindCallback
	     * @owner Observable
	     */
	    BoundCallbackObservable.create = function (func, selector, scheduler) {
	        if (selector === void 0) { selector = undefined; }
	        return function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            return new BoundCallbackObservable(func, selector, args, scheduler);
	        };
	    };
	    BoundCallbackObservable.prototype._subscribe = function (subscriber) {
	        var callbackFunc = this.callbackFunc;
	        var args = this.args;
	        var scheduler = this.scheduler;
	        var subject = this.subject;
	        if (!scheduler) {
	            if (!subject) {
	                subject = this.subject = new AsyncSubject_1.AsyncSubject();
	                var handler = function handlerFn() {
	                    var innerArgs = [];
	                    for (var _i = 0; _i < arguments.length; _i++) {
	                        innerArgs[_i - 0] = arguments[_i];
	                    }
	                    var source = handlerFn.source;
	                    var selector = source.selector, subject = source.subject;
	                    if (selector) {
	                        var result_1 = tryCatch_1.tryCatch(selector).apply(this, innerArgs);
	                        if (result_1 === errorObject_1.errorObject) {
	                            subject.error(errorObject_1.errorObject.e);
	                        }
	                        else {
	                            subject.next(result_1);
	                            subject.complete();
	                        }
	                    }
	                    else {
	                        subject.next(innerArgs.length === 1 ? innerArgs[0] : innerArgs);
	                        subject.complete();
	                    }
	                };
	                // use named function instance to avoid closure.
	                handler.source = this;
	                var result = tryCatch_1.tryCatch(callbackFunc).apply(this, args.concat(handler));
	                if (result === errorObject_1.errorObject) {
	                    subject.error(errorObject_1.errorObject.e);
	                }
	            }
	            return subject.subscribe(subscriber);
	        }
	        else {
	            return scheduler.schedule(BoundCallbackObservable.dispatch, 0, { source: this, subscriber: subscriber });
	        }
	    };
	    BoundCallbackObservable.dispatch = function (state) {
	        var self = this;
	        var source = state.source, subscriber = state.subscriber;
	        var callbackFunc = source.callbackFunc, args = source.args, scheduler = source.scheduler;
	        var subject = source.subject;
	        if (!subject) {
	            subject = source.subject = new AsyncSubject_1.AsyncSubject();
	            var handler = function handlerFn() {
	                var innerArgs = [];
	                for (var _i = 0; _i < arguments.length; _i++) {
	                    innerArgs[_i - 0] = arguments[_i];
	                }
	                var source = handlerFn.source;
	                var selector = source.selector, subject = source.subject;
	                if (selector) {
	                    var result_2 = tryCatch_1.tryCatch(selector).apply(this, innerArgs);
	                    if (result_2 === errorObject_1.errorObject) {
	                        self.add(scheduler.schedule(dispatchError, 0, { err: errorObject_1.errorObject.e, subject: subject }));
	                    }
	                    else {
	                        self.add(scheduler.schedule(dispatchNext, 0, { value: result_2, subject: subject }));
	                    }
	                }
	                else {
	                    var value = innerArgs.length === 1 ? innerArgs[0] : innerArgs;
	                    self.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
	                }
	            };
	            // use named function to pass values in without closure
	            handler.source = source;
	            var result = tryCatch_1.tryCatch(callbackFunc).apply(this, args.concat(handler));
	            if (result === errorObject_1.errorObject) {
	                subject.error(errorObject_1.errorObject.e);
	            }
	        }
	        self.add(subject.subscribe(subscriber));
	    };
	    return BoundCallbackObservable;
	}(Observable_1.Observable));
	exports.BoundCallbackObservable = BoundCallbackObservable;
	function dispatchNext(arg) {
	    var value = arg.value, subject = arg.subject;
	    subject.next(value);
	    subject.complete();
	}
	function dispatchError(arg) {
	    var err = arg.err, subject = arg.subject;
	    subject.error(err);
	}


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var Subscription_1 = __webpack_require__(21);
	/**
	 * @class AsyncSubject<T>
	 */
	var AsyncSubject = (function (_super) {
	    __extends(AsyncSubject, _super);
	    function AsyncSubject() {
	        _super.apply(this, arguments);
	        this.value = null;
	        this.hasNext = false;
	        this.hasCompleted = false;
	    }
	    AsyncSubject.prototype._subscribe = function (subscriber) {
	        if (this.hasCompleted && this.hasNext) {
	            subscriber.next(this.value);
	            subscriber.complete();
	            return Subscription_1.Subscription.EMPTY;
	        }
	        else if (this.hasError) {
	            subscriber.error(this.thrownError);
	            return Subscription_1.Subscription.EMPTY;
	        }
	        return _super.prototype._subscribe.call(this, subscriber);
	    };
	    AsyncSubject.prototype.next = function (value) {
	        if (!this.hasCompleted) {
	            this.value = value;
	            this.hasNext = true;
	        }
	    };
	    AsyncSubject.prototype.complete = function () {
	        this.hasCompleted = true;
	        if (this.hasNext) {
	            _super.prototype.next.call(this, this.value);
	        }
	        _super.prototype.complete.call(this);
	    };
	    return AsyncSubject;
	}(Subject_1.Subject));
	exports.AsyncSubject = AsyncSubject;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var bindNodeCallback_1 = __webpack_require__(37);
	Observable_1.Observable.bindNodeCallback = bindNodeCallback_1.bindNodeCallback;


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BoundNodeCallbackObservable_1 = __webpack_require__(38);
	exports.bindNodeCallback = BoundNodeCallbackObservable_1.BoundNodeCallbackObservable.create;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var AsyncSubject_1 = __webpack_require__(35);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var BoundNodeCallbackObservable = (function (_super) {
	    __extends(BoundNodeCallbackObservable, _super);
	    function BoundNodeCallbackObservable(callbackFunc, selector, args, scheduler) {
	        _super.call(this);
	        this.callbackFunc = callbackFunc;
	        this.selector = selector;
	        this.args = args;
	        this.scheduler = scheduler;
	    }
	    /* tslint:enable:max-line-length */
	    /**
	     * Converts a Node.js-style callback API to a function that returns an
	     * Observable.
	     *
	     * <span class="informal">It's just like {@link bindCallback}, but the
	     * callback is expected to be of type `callback(error, result)`.</span>
	     *
	     * `bindNodeCallback` is not an operator because its input and output are not
	     * Observables. The input is a function `func` with some parameters, but the
	     * last parameter must be a callback function that `func` calls when it is
	     * done. The callback function is expected to follow Node.js conventions,
	     * where the first argument to the callback is an error, while remaining
	     * arguments are the callback result. The output of `bindNodeCallback` is a
	     * function that takes the same parameters as `func`, except the last one (the
	     * callback). When the output function is called with arguments, it will
	     * return an Observable where the results will be delivered to.
	     *
	     * @example <caption>Read a file from the filesystem and get the data as an Observable</caption>
	     * import * as fs from 'fs';
	     * var readFileAsObservable = Rx.Observable.bindNodeCallback(fs.readFile);
	     * var result = readFileAsObservable('./roadNames.txt', 'utf8');
	     * result.subscribe(x => console.log(x), e => console.error(e));
	     *
	     * @see {@link bindCallback}
	     * @see {@link from}
	     * @see {@link fromPromise}
	     *
	     * @param {function} func Function with a callback as the last parameter.
	     * @param {function} selector A function which takes the arguments from the
	     * callback and maps those a value to emit on the output Observable.
	     * @param {Scheduler} [scheduler] The scheduler on which to schedule the
	     * callbacks.
	     * @return {function(...params: *): Observable} A function which returns the
	     * Observable that delivers the same values the Node.js callback would
	     * deliver.
	     * @static true
	     * @name bindNodeCallback
	     * @owner Observable
	     */
	    BoundNodeCallbackObservable.create = function (func, selector, scheduler) {
	        if (selector === void 0) { selector = undefined; }
	        return function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            return new BoundNodeCallbackObservable(func, selector, args, scheduler);
	        };
	    };
	    BoundNodeCallbackObservable.prototype._subscribe = function (subscriber) {
	        var callbackFunc = this.callbackFunc;
	        var args = this.args;
	        var scheduler = this.scheduler;
	        var subject = this.subject;
	        if (!scheduler) {
	            if (!subject) {
	                subject = this.subject = new AsyncSubject_1.AsyncSubject();
	                var handler = function handlerFn() {
	                    var innerArgs = [];
	                    for (var _i = 0; _i < arguments.length; _i++) {
	                        innerArgs[_i - 0] = arguments[_i];
	                    }
	                    var source = handlerFn.source;
	                    var selector = source.selector, subject = source.subject;
	                    var err = innerArgs.shift();
	                    if (err) {
	                        subject.error(err);
	                    }
	                    else if (selector) {
	                        var result_1 = tryCatch_1.tryCatch(selector).apply(this, innerArgs);
	                        if (result_1 === errorObject_1.errorObject) {
	                            subject.error(errorObject_1.errorObject.e);
	                        }
	                        else {
	                            subject.next(result_1);
	                            subject.complete();
	                        }
	                    }
	                    else {
	                        subject.next(innerArgs.length === 1 ? innerArgs[0] : innerArgs);
	                        subject.complete();
	                    }
	                };
	                // use named function instance to avoid closure.
	                handler.source = this;
	                var result = tryCatch_1.tryCatch(callbackFunc).apply(this, args.concat(handler));
	                if (result === errorObject_1.errorObject) {
	                    subject.error(errorObject_1.errorObject.e);
	                }
	            }
	            return subject.subscribe(subscriber);
	        }
	        else {
	            return scheduler.schedule(dispatch, 0, { source: this, subscriber: subscriber });
	        }
	    };
	    return BoundNodeCallbackObservable;
	}(Observable_1.Observable));
	exports.BoundNodeCallbackObservable = BoundNodeCallbackObservable;
	function dispatch(state) {
	    var self = this;
	    var source = state.source, subscriber = state.subscriber;
	    // XXX: cast to `any` to access to the private field in `source`.
	    var _a = source, callbackFunc = _a.callbackFunc, args = _a.args, scheduler = _a.scheduler;
	    var subject = source.subject;
	    if (!subject) {
	        subject = source.subject = new AsyncSubject_1.AsyncSubject();
	        var handler = function handlerFn() {
	            var innerArgs = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                innerArgs[_i - 0] = arguments[_i];
	            }
	            var source = handlerFn.source;
	            var selector = source.selector, subject = source.subject;
	            var err = innerArgs.shift();
	            if (err) {
	                subject.error(err);
	            }
	            else if (selector) {
	                var result_2 = tryCatch_1.tryCatch(selector).apply(this, innerArgs);
	                if (result_2 === errorObject_1.errorObject) {
	                    self.add(scheduler.schedule(dispatchError, 0, { err: errorObject_1.errorObject.e, subject: subject }));
	                }
	                else {
	                    self.add(scheduler.schedule(dispatchNext, 0, { value: result_2, subject: subject }));
	                }
	            }
	            else {
	                var value = innerArgs.length === 1 ? innerArgs[0] : innerArgs;
	                self.add(scheduler.schedule(dispatchNext, 0, { value: value, subject: subject }));
	            }
	        };
	        // use named function to pass values in without closure
	        handler.source = source;
	        var result = tryCatch_1.tryCatch(callbackFunc).apply(this, args.concat(handler));
	        if (result === errorObject_1.errorObject) {
	            subject.error(errorObject_1.errorObject.e);
	        }
	    }
	    self.add(subject.subscribe(subscriber));
	}
	function dispatchNext(arg) {
	    var value = arg.value, subject = arg.subject;
	    subject.next(value);
	    subject.complete();
	}
	function dispatchError(arg) {
	    var err = arg.err, subject = arg.subject;
	    subject.error(err);
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var combineLatest_1 = __webpack_require__(40);
	Observable_1.Observable.combineLatest = combineLatest_1.combineLatest;


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var isScheduler_1 = __webpack_require__(41);
	var isArray_1 = __webpack_require__(22);
	var ArrayObservable_1 = __webpack_require__(42);
	var combineLatest_1 = __webpack_require__(45);
	/* tslint:enable:max-line-length */
	/**
	 * Combines multiple Observables to create an Observable whose values are
	 * calculated from the latest values of each of its input Observables.
	 *
	 * <span class="informal">Whenever any input Observable emits a value, it
	 * computes a formula using the latest values from all the inputs, then emits
	 * the output of that formula.</span>
	 *
	 * <img src="./img/combineLatest.png" width="100%">
	 *
	 * `combineLatest` combines the values from all the Observables passed as
	 * arguments. This is done by subscribing to each Observable, in order, and
	 * collecting an array of each of the most recent values any time any of the
	 * input Observables emits, then either taking that array and passing it as
	 * arguments to an optional `project` function and emitting the return value of
	 * that, or just emitting the array of recent values directly if there is no
	 * `project` function.
	 *
	 * @example <caption>Dynamically calculate the Body-Mass Index from an Observable of weight and one for height</caption>
	 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
	 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
	 * var bmi = Rx.Observable.combineLatest(weight, height, (w, h) => w / (h * h));
	 * bmi.subscribe(x => console.log('BMI is ' + x));
	 *
	 * @see {@link combineAll}
	 * @see {@link merge}
	 * @see {@link withLatestFrom}
	 *
	 * @param {Observable} observable1 An input Observable to combine with the
	 * source Observable.
	 * @param {Observable} observable2 An input Observable to combine with the
	 * source Observable. More than one input Observables may be given as argument.
	 * @param {function} [project] An optional function to project the values from
	 * the combined latest values into a new value on the output Observable.
	 * @param {Scheduler} [scheduler=null] The Scheduler to use for subscribing to
	 * each input Observable.
	 * @return {Observable} An Observable of projected values from the most recent
	 * values from each input Observable, or an array of the most recent values from
	 * each input Observable.
	 * @static true
	 * @name combineLatest
	 * @owner Observable
	 */
	function combineLatest() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    var project = null;
	    var scheduler = null;
	    if (isScheduler_1.isScheduler(observables[observables.length - 1])) {
	        scheduler = observables.pop();
	    }
	    if (typeof observables[observables.length - 1] === 'function') {
	        project = observables.pop();
	    }
	    // if the first and only other argument besides the resultSelector is an array
	    // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
	    if (observables.length === 1 && isArray_1.isArray(observables[0])) {
	        observables = observables[0];
	    }
	    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new combineLatest_1.CombineLatestOperator(project));
	}
	exports.combineLatest = combineLatest;


/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";
	function isScheduler(value) {
	    return value && typeof value.schedule === 'function';
	}
	exports.isScheduler = isScheduler;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var ScalarObservable_1 = __webpack_require__(43);
	var EmptyObservable_1 = __webpack_require__(44);
	var isScheduler_1 = __webpack_require__(41);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var ArrayObservable = (function (_super) {
	    __extends(ArrayObservable, _super);
	    function ArrayObservable(array, scheduler) {
	        _super.call(this);
	        this.array = array;
	        this.scheduler = scheduler;
	        if (!scheduler && array.length === 1) {
	            this._isScalar = true;
	            this.value = array[0];
	        }
	    }
	    ArrayObservable.create = function (array, scheduler) {
	        return new ArrayObservable(array, scheduler);
	    };
	    /**
	     * Creates an Observable that emits some values you specify as arguments,
	     * immediately one after the other, and then emits a complete notification.
	     *
	     * <span class="informal">Emits the arguments you provide, then completes.
	     * </span>
	     *
	     * <img src="./img/of.png" width="100%">
	     *
	     * This static operator is useful for creating a simple Observable that only
	     * emits the arguments given, and the complete notification thereafter. It can
	     * be used for composing with other Observables, such as with {@link concat}.
	     * By default, it uses a `null` Scheduler, which means the `next`
	     * notifications are sent synchronously, although with a different Scheduler
	     * it is possible to determine when those notifications will be delivered.
	     *
	     * @example <caption>Emit 10, 20, 30, then 'a', 'b', 'c', then start ticking every second.</caption>
	     * var numbers = Rx.Observable.of(10, 20, 30);
	     * var letters = Rx.Observable.of('a', 'b', 'c');
	     * var interval = Rx.Observable.interval(1000);
	     * var result = numbers.concat(letters).concat(interval);
	     * result.subscribe(x => console.log(x));
	     *
	     * @see {@link create}
	     * @see {@link empty}
	     * @see {@link never}
	     * @see {@link throw}
	     *
	     * @param {...T} values Arguments that represent `next` values to be emitted.
	     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
	     * the emissions of the `next` notifications.
	     * @return {Observable<T>} An Observable that emits each given input value.
	     * @static true
	     * @name of
	     * @owner Observable
	     */
	    ArrayObservable.of = function () {
	        var array = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            array[_i - 0] = arguments[_i];
	        }
	        var scheduler = array[array.length - 1];
	        if (isScheduler_1.isScheduler(scheduler)) {
	            array.pop();
	        }
	        else {
	            scheduler = null;
	        }
	        var len = array.length;
	        if (len > 1) {
	            return new ArrayObservable(array, scheduler);
	        }
	        else if (len === 1) {
	            return new ScalarObservable_1.ScalarObservable(array[0], scheduler);
	        }
	        else {
	            return new EmptyObservable_1.EmptyObservable(scheduler);
	        }
	    };
	    ArrayObservable.dispatch = function (state) {
	        var array = state.array, index = state.index, count = state.count, subscriber = state.subscriber;
	        if (index >= count) {
	            subscriber.complete();
	            return;
	        }
	        subscriber.next(array[index]);
	        if (subscriber.closed) {
	            return;
	        }
	        state.index = index + 1;
	        this.schedule(state);
	    };
	    ArrayObservable.prototype._subscribe = function (subscriber) {
	        var index = 0;
	        var array = this.array;
	        var count = array.length;
	        var scheduler = this.scheduler;
	        if (scheduler) {
	            return scheduler.schedule(ArrayObservable.dispatch, 0, {
	                array: array, index: index, count: count, subscriber: subscriber
	            });
	        }
	        else {
	            for (var i = 0; i < count && !subscriber.closed; i++) {
	                subscriber.next(array[i]);
	            }
	            subscriber.complete();
	        }
	    };
	    return ArrayObservable;
	}(Observable_1.Observable));
	exports.ArrayObservable = ArrayObservable;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var ScalarObservable = (function (_super) {
	    __extends(ScalarObservable, _super);
	    function ScalarObservable(value, scheduler) {
	        _super.call(this);
	        this.value = value;
	        this.scheduler = scheduler;
	        this._isScalar = true;
	        if (scheduler) {
	            this._isScalar = false;
	        }
	    }
	    ScalarObservable.create = function (value, scheduler) {
	        return new ScalarObservable(value, scheduler);
	    };
	    ScalarObservable.dispatch = function (state) {
	        var done = state.done, value = state.value, subscriber = state.subscriber;
	        if (done) {
	            subscriber.complete();
	            return;
	        }
	        subscriber.next(value);
	        if (subscriber.closed) {
	            return;
	        }
	        state.done = true;
	        this.schedule(state);
	    };
	    ScalarObservable.prototype._subscribe = function (subscriber) {
	        var value = this.value;
	        var scheduler = this.scheduler;
	        if (scheduler) {
	            return scheduler.schedule(ScalarObservable.dispatch, 0, {
	                done: false, value: value, subscriber: subscriber
	            });
	        }
	        else {
	            subscriber.next(value);
	            if (!subscriber.closed) {
	                subscriber.complete();
	            }
	        }
	    };
	    return ScalarObservable;
	}(Observable_1.Observable));
	exports.ScalarObservable = ScalarObservable;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var EmptyObservable = (function (_super) {
	    __extends(EmptyObservable, _super);
	    function EmptyObservable(scheduler) {
	        _super.call(this);
	        this.scheduler = scheduler;
	    }
	    /**
	     * Creates an Observable that emits no items to the Observer and immediately
	     * emits a complete notification.
	     *
	     * <span class="informal">Just emits 'complete', and nothing else.
	     * </span>
	     *
	     * <img src="./img/empty.png" width="100%">
	     *
	     * This static operator is useful for creating a simple Observable that only
	     * emits the complete notification. It can be used for composing with other
	     * Observables, such as in a {@link mergeMap}.
	     *
	     * @example <caption>Emit the number 7, then complete.</caption>
	     * var result = Rx.Observable.empty().startWith(7);
	     * result.subscribe(x => console.log(x));
	     *
	     * @example <caption>Map and flatten only odd numbers to the sequence 'a', 'b', 'c'</caption>
	     * var interval = Rx.Observable.interval(1000);
	     * var result = interval.mergeMap(x =>
	     *   x % 2 === 1 ? Rx.Observable.of('a', 'b', 'c') : Rx.Observable.empty()
	     * );
	     * result.subscribe(x => console.log(x));
	     *
	     * @see {@link create}
	     * @see {@link never}
	     * @see {@link of}
	     * @see {@link throw}
	     *
	     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
	     * the emission of the complete notification.
	     * @return {Observable} An "empty" Observable: emits only the complete
	     * notification.
	     * @static true
	     * @name empty
	     * @owner Observable
	     */
	    EmptyObservable.create = function (scheduler) {
	        return new EmptyObservable(scheduler);
	    };
	    EmptyObservable.dispatch = function (arg) {
	        var subscriber = arg.subscriber;
	        subscriber.complete();
	    };
	    EmptyObservable.prototype._subscribe = function (subscriber) {
	        var scheduler = this.scheduler;
	        if (scheduler) {
	            return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber: subscriber });
	        }
	        else {
	            subscriber.complete();
	        }
	    };
	    return EmptyObservable;
	}(Observable_1.Observable));
	exports.EmptyObservable = EmptyObservable;


/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var ArrayObservable_1 = __webpack_require__(42);
	var isArray_1 = __webpack_require__(22);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	var none = {};
	/**
	 * Combines multiple Observables to create an Observable whose values are
	 * calculated from the latest values of each of its input Observables.
	 *
	 * <span class="informal">Whenever any input Observable emits a value, it
	 * computes a formula using the latest values from all the inputs, then emits
	 * the output of that formula.</span>
	 *
	 * <img src="./img/combineLatest.png" width="100%">
	 *
	 * `combineLatest` combines the values from this Observable with values from
	 * Observables passed as arguments. This is done by subscribing to each
	 * Observable, in order, and collecting an array of each of the most recent
	 * values any time any of the input Observables emits, then either taking that
	 * array and passing it as arguments to an optional `project` function and
	 * emitting the return value of that, or just emitting the array of recent
	 * values directly if there is no `project` function.
	 *
	 * @example <caption>Dynamically calculate the Body-Mass Index from an Observable of weight and one for height</caption>
	 * var weight = Rx.Observable.of(70, 72, 76, 79, 75);
	 * var height = Rx.Observable.of(1.76, 1.77, 1.78);
	 * var bmi = weight.combineLatest(height, (w, h) => w / (h * h));
	 * bmi.subscribe(x => console.log('BMI is ' + x));
	 *
	 * @see {@link combineAll}
	 * @see {@link merge}
	 * @see {@link withLatestFrom}
	 *
	 * @param {Observable} other An input Observable to combine with the source
	 * Observable. More than one input Observables may be given as argument.
	 * @param {function} [project] An optional function to project the values from
	 * the combined latest values into a new value on the output Observable.
	 * @return {Observable} An Observable of projected values from the most recent
	 * values from each input Observable, or an array of the most recent values from
	 * each input Observable.
	 * @method combineLatest
	 * @owner Observable
	 */
	function combineLatest() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    var project = null;
	    if (typeof observables[observables.length - 1] === 'function') {
	        project = observables.pop();
	    }
	    // if the first and only other argument besides the resultSelector is an array
	    // assume it's been called with `combineLatest([obs1, obs2, obs3], project)`
	    if (observables.length === 1 && isArray_1.isArray(observables[0])) {
	        observables = observables[0];
	    }
	    observables.unshift(this);
	    return new ArrayObservable_1.ArrayObservable(observables).lift(new CombineLatestOperator(project));
	}
	exports.combineLatest = combineLatest;
	/* tslint:enable:max-line-length */
	var CombineLatestOperator = (function () {
	    function CombineLatestOperator(project) {
	        this.project = project;
	    }
	    CombineLatestOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new CombineLatestSubscriber(subscriber, this.project));
	    };
	    return CombineLatestOperator;
	}());
	exports.CombineLatestOperator = CombineLatestOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var CombineLatestSubscriber = (function (_super) {
	    __extends(CombineLatestSubscriber, _super);
	    function CombineLatestSubscriber(destination, project) {
	        _super.call(this, destination);
	        this.project = project;
	        this.active = 0;
	        this.values = [];
	        this.observables = [];
	    }
	    CombineLatestSubscriber.prototype._next = function (observable) {
	        this.values.push(none);
	        this.observables.push(observable);
	    };
	    CombineLatestSubscriber.prototype._complete = function () {
	        var observables = this.observables;
	        var len = observables.length;
	        if (len === 0) {
	            this.destination.complete();
	        }
	        else {
	            this.active = len;
	            this.toRespond = len;
	            for (var i = 0; i < len; i++) {
	                var observable = observables[i];
	                this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));
	            }
	        }
	    };
	    CombineLatestSubscriber.prototype.notifyComplete = function (unused) {
	        if ((this.active -= 1) === 0) {
	            this.destination.complete();
	        }
	    };
	    CombineLatestSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var values = this.values;
	        var oldVal = values[outerIndex];
	        var toRespond = !this.toRespond
	            ? 0
	            : oldVal === none ? --this.toRespond : this.toRespond;
	        values[outerIndex] = innerValue;
	        if (toRespond === 0) {
	            if (this.project) {
	                this._tryProject(values);
	            }
	            else {
	                this.destination.next(values.slice());
	            }
	        }
	    };
	    CombineLatestSubscriber.prototype._tryProject = function (values) {
	        var result;
	        try {
	            result = this.project.apply(this, values);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return CombineLatestSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.CombineLatestSubscriber = CombineLatestSubscriber;


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var OuterSubscriber = (function (_super) {
	    __extends(OuterSubscriber, _super);
	    function OuterSubscriber() {
	        _super.apply(this, arguments);
	    }
	    OuterSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.destination.next(innerValue);
	    };
	    OuterSubscriber.prototype.notifyError = function (error, innerSub) {
	        this.destination.error(error);
	    };
	    OuterSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.destination.complete();
	    };
	    return OuterSubscriber;
	}(Subscriber_1.Subscriber));
	exports.OuterSubscriber = OuterSubscriber;


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var isArray_1 = __webpack_require__(22);
	var isPromise_1 = __webpack_require__(48);
	var Observable_1 = __webpack_require__(16);
	var iterator_1 = __webpack_require__(49);
	var InnerSubscriber_1 = __webpack_require__(50);
	var observable_1 = __webpack_require__(29);
	function subscribeToResult(outerSubscriber, result, outerValue, outerIndex) {
	    var destination = new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex);
	    if (destination.closed) {
	        return null;
	    }
	    if (result instanceof Observable_1.Observable) {
	        if (result._isScalar) {
	            destination.next(result.value);
	            destination.complete();
	            return null;
	        }
	        else {
	            return result.subscribe(destination);
	        }
	    }
	    if (isArray_1.isArray(result)) {
	        for (var i = 0, len = result.length; i < len && !destination.closed; i++) {
	            destination.next(result[i]);
	        }
	        if (!destination.closed) {
	            destination.complete();
	        }
	    }
	    else if (isPromise_1.isPromise(result)) {
	        result.then(function (value) {
	            if (!destination.closed) {
	                destination.next(value);
	                destination.complete();
	            }
	        }, function (err) { return destination.error(err); })
	            .then(null, function (err) {
	            // Escaping the Promise trap: globally throw unhandled errors
	            root_1.root.setTimeout(function () { throw err; });
	        });
	        return destination;
	    }
	    else if (typeof result[iterator_1.$$iterator] === 'function') {
	        var iterator = result[iterator_1.$$iterator]();
	        do {
	            var item = iterator.next();
	            if (item.done) {
	                destination.complete();
	                break;
	            }
	            destination.next(item.value);
	            if (destination.closed) {
	                break;
	            }
	        } while (true);
	    }
	    else if (typeof result[observable_1.$$observable] === 'function') {
	        var obs = result[observable_1.$$observable]();
	        if (typeof obs.subscribe !== 'function') {
	            destination.error(new Error('invalid observable'));
	        }
	        else {
	            return obs.subscribe(new InnerSubscriber_1.InnerSubscriber(outerSubscriber, outerValue, outerIndex));
	        }
	    }
	    else {
	        destination.error(new TypeError('unknown type returned'));
	    }
	    return null;
	}
	exports.subscribeToResult = subscribeToResult;


/***/ },
/* 48 */
/***/ function(module, exports) {

	"use strict";
	function isPromise(value) {
	    return value && typeof value.subscribe !== 'function' && typeof value.then === 'function';
	}
	exports.isPromise = isPromise;


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var Symbol = root_1.root.Symbol;
	if (typeof Symbol === 'function') {
	    if (Symbol.iterator) {
	        exports.$$iterator = Symbol.iterator;
	    }
	    else if (typeof Symbol.for === 'function') {
	        exports.$$iterator = Symbol.for('iterator');
	    }
	}
	else {
	    if (root_1.root.Set && typeof new root_1.root.Set()['@@iterator'] === 'function') {
	        // Bug for mozilla version
	        exports.$$iterator = '@@iterator';
	    }
	    else if (root_1.root.Map) {
	        // es6-shim specific logic
	        var keys = Object.getOwnPropertyNames(root_1.root.Map.prototype);
	        for (var i = 0; i < keys.length; ++i) {
	            var key = keys[i];
	            if (key !== 'entries' && key !== 'size' && root_1.root.Map.prototype[key] === root_1.root.Map.prototype['entries']) {
	                exports.$$iterator = key;
	                break;
	            }
	        }
	    }
	    else {
	        exports.$$iterator = '@@iterator';
	    }
	}


/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var InnerSubscriber = (function (_super) {
	    __extends(InnerSubscriber, _super);
	    function InnerSubscriber(parent, outerValue, outerIndex) {
	        _super.call(this);
	        this.parent = parent;
	        this.outerValue = outerValue;
	        this.outerIndex = outerIndex;
	        this.index = 0;
	    }
	    InnerSubscriber.prototype._next = function (value) {
	        this.parent.notifyNext(this.outerValue, value, this.outerIndex, this.index++, this);
	    };
	    InnerSubscriber.prototype._error = function (error) {
	        this.parent.notifyError(error, this);
	        this.unsubscribe();
	    };
	    InnerSubscriber.prototype._complete = function () {
	        this.parent.notifyComplete(this);
	        this.unsubscribe();
	    };
	    return InnerSubscriber;
	}(Subscriber_1.Subscriber));
	exports.InnerSubscriber = InnerSubscriber;


/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var concat_1 = __webpack_require__(52);
	Observable_1.Observable.concat = concat_1.concat;


/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var concat_1 = __webpack_require__(53);
	exports.concat = concat_1.concatStatic;


/***/ },
/* 53 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var isScheduler_1 = __webpack_require__(41);
	var ArrayObservable_1 = __webpack_require__(42);
	var mergeAll_1 = __webpack_require__(54);
	/**
	 * Creates an output Observable which sequentially emits all values from every
	 * given input Observable after the current Observable.
	 *
	 * <span class="informal">Concatenates multiple Observables together by
	 * sequentially emitting their values, one Observable after the other.</span>
	 *
	 * <img src="./img/concat.png" width="100%">
	 *
	 * Joins this Observable with multiple other Observables by subscribing to them
	 * one at a time, starting with the source, and merging their results into the
	 * output Observable. Will wait for each Observable to complete before moving
	 * on to the next.
	 *
	 * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>
	 * var timer = Rx.Observable.interval(1000).take(4);
	 * var sequence = Rx.Observable.range(1, 10);
	 * var result = timer.concat(sequence);
	 * result.subscribe(x => console.log(x));
	 *
	 * @example <caption>Concatenate 3 Observables</caption>
	 * var timer1 = Rx.Observable.interval(1000).take(10);
	 * var timer2 = Rx.Observable.interval(2000).take(6);
	 * var timer3 = Rx.Observable.interval(500).take(10);
	 * var result = timer1.concat(timer2, timer3);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatAll}
	 * @see {@link concatMap}
	 * @see {@link concatMapTo}
	 *
	 * @param {Observable} other An input Observable to concatenate after the source
	 * Observable. More than one input Observables may be given as argument.
	 * @param {Scheduler} [scheduler=null] An optional Scheduler to schedule each
	 * Observable subscription on.
	 * @return {Observable} All values of each passed Observable merged into a
	 * single Observable, in order, in serial fashion.
	 * @method concat
	 * @owner Observable
	 */
	function concat() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    return concatStatic.apply(void 0, [this].concat(observables));
	}
	exports.concat = concat;
	/* tslint:enable:max-line-length */
	/**
	 * Creates an output Observable which sequentially emits all values from every
	 * given input Observable after the current Observable.
	 *
	 * <span class="informal">Concatenates multiple Observables together by
	 * sequentially emitting their values, one Observable after the other.</span>
	 *
	 * <img src="./img/concat.png" width="100%">
	 *
	 * Joins multiple Observables together by subscribing to them one at a time and
	 * merging their results into the output Observable. Will wait for each
	 * Observable to complete before moving on to the next.
	 *
	 * @example <caption>Concatenate a timer counting from 0 to 3 with a synchronous sequence from 1 to 10</caption>
	 * var timer = Rx.Observable.interval(1000).take(4);
	 * var sequence = Rx.Observable.range(1, 10);
	 * var result = Rx.Observable.concat(timer, sequence);
	 * result.subscribe(x => console.log(x));
	 *
	 * @example <caption>Concatenate 3 Observables</caption>
	 * var timer1 = Rx.Observable.interval(1000).take(10);
	 * var timer2 = Rx.Observable.interval(2000).take(6);
	 * var timer3 = Rx.Observable.interval(500).take(10);
	 * var result = Rx.Observable.concat(timer1, timer2, timer3);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatAll}
	 * @see {@link concatMap}
	 * @see {@link concatMapTo}
	 *
	 * @param {Observable} input1 An input Observable to concatenate with others.
	 * @param {Observable} input2 An input Observable to concatenate with others.
	 * More than one input Observables may be given as argument.
	 * @param {Scheduler} [scheduler=null] An optional Scheduler to schedule each
	 * Observable subscription on.
	 * @return {Observable} All values of each passed Observable merged into a
	 * single Observable, in order, in serial fashion.
	 * @static true
	 * @name concat
	 * @owner Observable
	 */
	function concatStatic() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    var scheduler = null;
	    var args = observables;
	    if (isScheduler_1.isScheduler(args[observables.length - 1])) {
	        scheduler = args.pop();
	    }
	    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new mergeAll_1.MergeAllOperator(1));
	}
	exports.concatStatic = concatStatic;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Converts a higher-order Observable into a first-order Observable which
	 * concurrently delivers all values that are emitted on the inner Observables.
	 *
	 * <span class="informal">Flattens an Observable-of-Observables.</span>
	 *
	 * <img src="./img/mergeAll.png" width="100%">
	 *
	 * `mergeAll` subscribes to an Observable that emits Observables, also known as
	 * a higher-order Observable. Each time it observes one of these emitted inner
	 * Observables, it subscribes to that and delivers all the values from the
	 * inner Observable on the output Observable. The output Observable only
	 * completes once all inner Observables have completed. Any error delivered by
	 * a inner Observable will be immediately emitted on the output Observable.
	 *
	 * @example <caption>Spawn a new interval Observable for each click event, and blend their outputs as one Observable</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
	 * var firstOrder = higherOrder.mergeAll();
	 * firstOrder.subscribe(x => console.log(x));
	 *
	 * @example <caption>Count from 0 to 9 every second for each click, but only allow 2 concurrent timers</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000).take(10));
	 * var firstOrder = higherOrder.mergeAll(2);
	 * firstOrder.subscribe(x => console.log(x));
	 *
	 * @see {@link combineAll}
	 * @see {@link concatAll}
	 * @see {@link exhaust}
	 * @see {@link merge}
	 * @see {@link mergeMap}
	 * @see {@link mergeMapTo}
	 * @see {@link mergeScan}
	 * @see {@link switch}
	 * @see {@link zipAll}
	 *
	 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of inner
	 * Observables being subscribed to concurrently.
	 * @return {Observable} An Observable that emits values coming from all the
	 * inner Observables emitted by the source Observable.
	 * @method mergeAll
	 * @owner Observable
	 */
	function mergeAll(concurrent) {
	    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	    return this.lift(new MergeAllOperator(concurrent));
	}
	exports.mergeAll = mergeAll;
	var MergeAllOperator = (function () {
	    function MergeAllOperator(concurrent) {
	        this.concurrent = concurrent;
	    }
	    MergeAllOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new MergeAllSubscriber(observer, this.concurrent));
	    };
	    return MergeAllOperator;
	}());
	exports.MergeAllOperator = MergeAllOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MergeAllSubscriber = (function (_super) {
	    __extends(MergeAllSubscriber, _super);
	    function MergeAllSubscriber(destination, concurrent) {
	        _super.call(this, destination);
	        this.concurrent = concurrent;
	        this.hasCompleted = false;
	        this.buffer = [];
	        this.active = 0;
	    }
	    MergeAllSubscriber.prototype._next = function (observable) {
	        if (this.active < this.concurrent) {
	            this.active++;
	            this.add(subscribeToResult_1.subscribeToResult(this, observable));
	        }
	        else {
	            this.buffer.push(observable);
	        }
	    };
	    MergeAllSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            this.destination.complete();
	        }
	    };
	    MergeAllSubscriber.prototype.notifyComplete = function (innerSub) {
	        var buffer = this.buffer;
	        this.remove(innerSub);
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        else if (this.active === 0 && this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return MergeAllSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.MergeAllSubscriber = MergeAllSubscriber;


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var defer_1 = __webpack_require__(56);
	Observable_1.Observable.defer = defer_1.defer;


/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var DeferObservable_1 = __webpack_require__(57);
	exports.defer = DeferObservable_1.DeferObservable.create;


/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var DeferObservable = (function (_super) {
	    __extends(DeferObservable, _super);
	    function DeferObservable(observableFactory) {
	        _super.call(this);
	        this.observableFactory = observableFactory;
	    }
	    /**
	     * Creates an Observable that, on subscribe, calls an Observable factory to
	     * make an Observable for each new Observer.
	     *
	     * <span class="informal">Creates the Observable lazily, that is, only when it
	     * is subscribed.
	     * </span>
	     *
	     * <img src="./img/defer.png" width="100%">
	     *
	     * `defer` allows you to create the Observable only when the Observer
	     * subscribes, and create a fresh Observable for each Observer. It waits until
	     * an Observer subscribes to it, and then it generates an Observable,
	     * typically with an Observable factory function. It does this afresh for each
	     * subscriber, so although each subscriber may think it is subscribing to the
	     * same Observable, in fact each subscriber gets its own individual
	     * Observable.
	     *
	     * @example <caption>Subscribe to either an Observable of clicks or an Observable of interval, at random</caption>
	     * var clicksOrInterval = Rx.Observable.defer(function () {
	     *   if (Math.random() > 0.5) {
	     *     return Rx.Observable.fromEvent(document, 'click');
	     *   } else {
	     *     return Rx.Observable.interval(1000);
	     *   }
	     * });
	     * clicksOrInterval.subscribe(x => console.log(x));
	     *
	     * @see {@link create}
	     *
	     * @param {function(): Observable|Promise} observableFactory The Observable
	     * factory function to invoke for each Observer that subscribes to the output
	     * Observable. May also return a Promise, which will be converted on the fly
	     * to an Observable.
	     * @return {Observable} An Observable whose Observers' subscriptions trigger
	     * an invocation of the given Observable factory function.
	     * @static true
	     * @name defer
	     * @owner Observable
	     */
	    DeferObservable.create = function (observableFactory) {
	        return new DeferObservable(observableFactory);
	    };
	    DeferObservable.prototype._subscribe = function (subscriber) {
	        return new DeferSubscriber(subscriber, this.observableFactory);
	    };
	    return DeferObservable;
	}(Observable_1.Observable));
	exports.DeferObservable = DeferObservable;
	var DeferSubscriber = (function (_super) {
	    __extends(DeferSubscriber, _super);
	    function DeferSubscriber(destination, factory) {
	        _super.call(this, destination);
	        this.factory = factory;
	        this.tryDefer();
	    }
	    DeferSubscriber.prototype.tryDefer = function () {
	        try {
	            this._callFactory();
	        }
	        catch (err) {
	            this._error(err);
	        }
	    };
	    DeferSubscriber.prototype._callFactory = function () {
	        var result = this.factory();
	        if (result) {
	            this.add(subscribeToResult_1.subscribeToResult(this, result));
	        }
	    };
	    return DeferSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var empty_1 = __webpack_require__(59);
	Observable_1.Observable.empty = empty_1.empty;


/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var EmptyObservable_1 = __webpack_require__(44);
	exports.empty = EmptyObservable_1.EmptyObservable.create;


/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var forkJoin_1 = __webpack_require__(61);
	Observable_1.Observable.forkJoin = forkJoin_1.forkJoin;


/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ForkJoinObservable_1 = __webpack_require__(62);
	exports.forkJoin = ForkJoinObservable_1.ForkJoinObservable.create;


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var EmptyObservable_1 = __webpack_require__(44);
	var isArray_1 = __webpack_require__(22);
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var ForkJoinObservable = (function (_super) {
	    __extends(ForkJoinObservable, _super);
	    function ForkJoinObservable(sources, resultSelector) {
	        _super.call(this);
	        this.sources = sources;
	        this.resultSelector = resultSelector;
	    }
	    /* tslint:enable:max-line-length */
	    /**
	     * @param sources
	     * @return {any}
	     * @static true
	     * @name forkJoin
	     * @owner Observable
	     */
	    ForkJoinObservable.create = function () {
	        var sources = [];
	        for (var _i = 0; _i < arguments.length; _i++) {
	            sources[_i - 0] = arguments[_i];
	        }
	        if (sources === null || arguments.length === 0) {
	            return new EmptyObservable_1.EmptyObservable();
	        }
	        var resultSelector = null;
	        if (typeof sources[sources.length - 1] === 'function') {
	            resultSelector = sources.pop();
	        }
	        // if the first and only other argument besides the resultSelector is an array
	        // assume it's been called with `forkJoin([obs1, obs2, obs3], resultSelector)`
	        if (sources.length === 1 && isArray_1.isArray(sources[0])) {
	            sources = sources[0];
	        }
	        if (sources.length === 0) {
	            return new EmptyObservable_1.EmptyObservable();
	        }
	        return new ForkJoinObservable(sources, resultSelector);
	    };
	    ForkJoinObservable.prototype._subscribe = function (subscriber) {
	        return new ForkJoinSubscriber(subscriber, this.sources, this.resultSelector);
	    };
	    return ForkJoinObservable;
	}(Observable_1.Observable));
	exports.ForkJoinObservable = ForkJoinObservable;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ForkJoinSubscriber = (function (_super) {
	    __extends(ForkJoinSubscriber, _super);
	    function ForkJoinSubscriber(destination, sources, resultSelector) {
	        _super.call(this, destination);
	        this.sources = sources;
	        this.resultSelector = resultSelector;
	        this.completed = 0;
	        this.haveValues = 0;
	        var len = sources.length;
	        this.total = len;
	        this.values = new Array(len);
	        for (var i = 0; i < len; i++) {
	            var source = sources[i];
	            var innerSubscription = subscribeToResult_1.subscribeToResult(this, source, null, i);
	            if (innerSubscription) {
	                innerSubscription.outerIndex = i;
	                this.add(innerSubscription);
	            }
	        }
	    }
	    ForkJoinSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.values[outerIndex] = innerValue;
	        if (!innerSub._hasValue) {
	            innerSub._hasValue = true;
	            this.haveValues++;
	        }
	    };
	    ForkJoinSubscriber.prototype.notifyComplete = function (innerSub) {
	        var destination = this.destination;
	        var _a = this, haveValues = _a.haveValues, resultSelector = _a.resultSelector, values = _a.values;
	        var len = values.length;
	        if (!innerSub._hasValue) {
	            destination.complete();
	            return;
	        }
	        this.completed++;
	        if (this.completed !== len) {
	            return;
	        }
	        if (haveValues === len) {
	            var value = resultSelector ? resultSelector.apply(this, values) : values;
	            destination.next(value);
	        }
	        destination.complete();
	    };
	    return ForkJoinSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var from_1 = __webpack_require__(64);
	Observable_1.Observable.from = from_1.from;


/***/ },
/* 64 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var FromObservable_1 = __webpack_require__(65);
	exports.from = FromObservable_1.FromObservable.create;


/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var isArray_1 = __webpack_require__(22);
	var isPromise_1 = __webpack_require__(48);
	var PromiseObservable_1 = __webpack_require__(66);
	var IteratorObservable_1 = __webpack_require__(67);
	var ArrayObservable_1 = __webpack_require__(42);
	var ArrayLikeObservable_1 = __webpack_require__(68);
	var iterator_1 = __webpack_require__(49);
	var Observable_1 = __webpack_require__(16);
	var observeOn_1 = __webpack_require__(69);
	var observable_1 = __webpack_require__(29);
	var isArrayLike = (function (x) { return x && typeof x.length === 'number'; });
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var FromObservable = (function (_super) {
	    __extends(FromObservable, _super);
	    function FromObservable(ish, scheduler) {
	        _super.call(this, null);
	        this.ish = ish;
	        this.scheduler = scheduler;
	    }
	    /**
	     * Creates an Observable from an Array, an array-like object, a Promise, an
	     * iterable object, or an Observable-like object.
	     *
	     * <span class="informal">Converts almost anything to an Observable.</span>
	     *
	     * <img src="./img/from.png" width="100%">
	     *
	     * Convert various other objects and data types into Observables. `from`
	     * converts a Promise or an array-like or an
	     * [iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterable)
	     * object into an Observable that emits the items in that promise or array or
	     * iterable. A String, in this context, is treated as an array of characters.
	     * Observable-like objects (contains a function named with the ES2015 Symbol
	     * for Observable) can also be converted through this operator.
	     *
	     * @example <caption>Converts an array to an Observable</caption>
	     * var array = [10, 20, 30];
	     * var result = Rx.Observable.from(array);
	     * result.subscribe(x => console.log(x));
	     *
	     * @example <caption>Convert an infinite iterable (from a generator) to an Observable</caption>
	     * function* generateDoubles(seed) {
	     *   var i = seed;
	     *   while (true) {
	     *     yield i;
	     *     i = 2 * i; // double it
	     *   }
	     * }
	     *
	     * var iterator = generateDoubles(3);
	     * var result = Rx.Observable.from(iterator).take(10);
	     * result.subscribe(x => console.log(x));
	     *
	     * @see {@link create}
	     * @see {@link fromEvent}
	     * @see {@link fromEventPattern}
	     * @see {@link fromPromise}
	     *
	     * @param {ObservableInput<T>} ish A subscribable object, a Promise, an
	     * Observable-like, an Array, an iterable or an array-like object to be
	     * converted.
	     * @param {Scheduler} [scheduler] The scheduler on which to schedule the
	     * emissions of values.
	     * @return {Observable<T>} The Observable whose values are originally from the
	     * input object that was converted.
	     * @static true
	     * @name from
	     * @owner Observable
	     */
	    FromObservable.create = function (ish, scheduler) {
	        if (ish != null) {
	            if (typeof ish[observable_1.$$observable] === 'function') {
	                if (ish instanceof Observable_1.Observable && !scheduler) {
	                    return ish;
	                }
	                return new FromObservable(ish, scheduler);
	            }
	            else if (isArray_1.isArray(ish)) {
	                return new ArrayObservable_1.ArrayObservable(ish, scheduler);
	            }
	            else if (isPromise_1.isPromise(ish)) {
	                return new PromiseObservable_1.PromiseObservable(ish, scheduler);
	            }
	            else if (typeof ish[iterator_1.$$iterator] === 'function' || typeof ish === 'string') {
	                return new IteratorObservable_1.IteratorObservable(ish, scheduler);
	            }
	            else if (isArrayLike(ish)) {
	                return new ArrayLikeObservable_1.ArrayLikeObservable(ish, scheduler);
	            }
	        }
	        throw new TypeError((ish !== null && typeof ish || ish) + ' is not observable');
	    };
	    FromObservable.prototype._subscribe = function (subscriber) {
	        var ish = this.ish;
	        var scheduler = this.scheduler;
	        if (scheduler == null) {
	            return ish[observable_1.$$observable]().subscribe(subscriber);
	        }
	        else {
	            return ish[observable_1.$$observable]().subscribe(new observeOn_1.ObserveOnSubscriber(subscriber, scheduler, 0));
	        }
	    };
	    return FromObservable;
	}(Observable_1.Observable));
	exports.FromObservable = FromObservable;


/***/ },
/* 66 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var root_1 = __webpack_require__(17);
	var Observable_1 = __webpack_require__(16);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var PromiseObservable = (function (_super) {
	    __extends(PromiseObservable, _super);
	    function PromiseObservable(promise, scheduler) {
	        _super.call(this);
	        this.promise = promise;
	        this.scheduler = scheduler;
	    }
	    /**
	     * Converts a Promise to an Observable.
	     *
	     * <span class="informal">Returns an Observable that just emits the Promise's
	     * resolved value, then completes.</span>
	     *
	     * Converts an ES2015 Promise or a Promises/A+ spec compliant Promise to an
	     * Observable. If the Promise resolves with a value, the output Observable
	     * emits that resolved value as a `next`, and then completes. If the Promise
	     * is rejected, then the output Observable emits the corresponding Error.
	     *
	     * @example <caption>Convert the Promise returned by Fetch to an Observable</caption>
	     * var result = Rx.Observable.fromPromise(fetch('http://myserver.com/'));
	     * result.subscribe(x => console.log(x), e => console.error(e));
	     *
	     * @see {@link bindCallback}
	     * @see {@link from}
	     *
	     * @param {Promise<T>} promise The promise to be converted.
	     * @param {Scheduler} [scheduler] An optional Scheduler to use for scheduling
	     * the delivery of the resolved value (or the rejection).
	     * @return {Observable<T>} An Observable which wraps the Promise.
	     * @static true
	     * @name fromPromise
	     * @owner Observable
	     */
	    PromiseObservable.create = function (promise, scheduler) {
	        return new PromiseObservable(promise, scheduler);
	    };
	    PromiseObservable.prototype._subscribe = function (subscriber) {
	        var _this = this;
	        var promise = this.promise;
	        var scheduler = this.scheduler;
	        if (scheduler == null) {
	            if (this._isScalar) {
	                if (!subscriber.closed) {
	                    subscriber.next(this.value);
	                    subscriber.complete();
	                }
	            }
	            else {
	                promise.then(function (value) {
	                    _this.value = value;
	                    _this._isScalar = true;
	                    if (!subscriber.closed) {
	                        subscriber.next(value);
	                        subscriber.complete();
	                    }
	                }, function (err) {
	                    if (!subscriber.closed) {
	                        subscriber.error(err);
	                    }
	                })
	                    .then(null, function (err) {
	                    // escape the promise trap, throw unhandled errors
	                    root_1.root.setTimeout(function () { throw err; });
	                });
	            }
	        }
	        else {
	            if (this._isScalar) {
	                if (!subscriber.closed) {
	                    return scheduler.schedule(dispatchNext, 0, { value: this.value, subscriber: subscriber });
	                }
	            }
	            else {
	                promise.then(function (value) {
	                    _this.value = value;
	                    _this._isScalar = true;
	                    if (!subscriber.closed) {
	                        subscriber.add(scheduler.schedule(dispatchNext, 0, { value: value, subscriber: subscriber }));
	                    }
	                }, function (err) {
	                    if (!subscriber.closed) {
	                        subscriber.add(scheduler.schedule(dispatchError, 0, { err: err, subscriber: subscriber }));
	                    }
	                })
	                    .then(null, function (err) {
	                    // escape the promise trap, throw unhandled errors
	                    root_1.root.setTimeout(function () { throw err; });
	                });
	            }
	        }
	    };
	    return PromiseObservable;
	}(Observable_1.Observable));
	exports.PromiseObservable = PromiseObservable;
	function dispatchNext(arg) {
	    var value = arg.value, subscriber = arg.subscriber;
	    if (!subscriber.closed) {
	        subscriber.next(value);
	        subscriber.complete();
	    }
	}
	function dispatchError(arg) {
	    var err = arg.err, subscriber = arg.subscriber;
	    if (!subscriber.closed) {
	        subscriber.error(err);
	    }
	}


/***/ },
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var root_1 = __webpack_require__(17);
	var Observable_1 = __webpack_require__(16);
	var iterator_1 = __webpack_require__(49);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var IteratorObservable = (function (_super) {
	    __extends(IteratorObservable, _super);
	    function IteratorObservable(iterator, scheduler) {
	        _super.call(this);
	        this.scheduler = scheduler;
	        if (iterator == null) {
	            throw new Error('iterator cannot be null.');
	        }
	        this.iterator = getIterator(iterator);
	    }
	    IteratorObservable.create = function (iterator, scheduler) {
	        return new IteratorObservable(iterator, scheduler);
	    };
	    IteratorObservable.dispatch = function (state) {
	        var index = state.index, hasError = state.hasError, iterator = state.iterator, subscriber = state.subscriber;
	        if (hasError) {
	            subscriber.error(state.error);
	            return;
	        }
	        var result = iterator.next();
	        if (result.done) {
	            subscriber.complete();
	            return;
	        }
	        subscriber.next(result.value);
	        state.index = index + 1;
	        if (subscriber.closed) {
	            return;
	        }
	        this.schedule(state);
	    };
	    IteratorObservable.prototype._subscribe = function (subscriber) {
	        var index = 0;
	        var _a = this, iterator = _a.iterator, scheduler = _a.scheduler;
	        if (scheduler) {
	            return scheduler.schedule(IteratorObservable.dispatch, 0, {
	                index: index, iterator: iterator, subscriber: subscriber
	            });
	        }
	        else {
	            do {
	                var result = iterator.next();
	                if (result.done) {
	                    subscriber.complete();
	                    break;
	                }
	                else {
	                    subscriber.next(result.value);
	                }
	                if (subscriber.closed) {
	                    break;
	                }
	            } while (true);
	        }
	    };
	    return IteratorObservable;
	}(Observable_1.Observable));
	exports.IteratorObservable = IteratorObservable;
	var StringIterator = (function () {
	    function StringIterator(str, idx, len) {
	        if (idx === void 0) { idx = 0; }
	        if (len === void 0) { len = str.length; }
	        this.str = str;
	        this.idx = idx;
	        this.len = len;
	    }
	    StringIterator.prototype[iterator_1.$$iterator] = function () { return (this); };
	    StringIterator.prototype.next = function () {
	        return this.idx < this.len ? {
	            done: false,
	            value: this.str.charAt(this.idx++)
	        } : {
	            done: true,
	            value: undefined
	        };
	    };
	    return StringIterator;
	}());
	var ArrayIterator = (function () {
	    function ArrayIterator(arr, idx, len) {
	        if (idx === void 0) { idx = 0; }
	        if (len === void 0) { len = toLength(arr); }
	        this.arr = arr;
	        this.idx = idx;
	        this.len = len;
	    }
	    ArrayIterator.prototype[iterator_1.$$iterator] = function () { return this; };
	    ArrayIterator.prototype.next = function () {
	        return this.idx < this.len ? {
	            done: false,
	            value: this.arr[this.idx++]
	        } : {
	            done: true,
	            value: undefined
	        };
	    };
	    return ArrayIterator;
	}());
	function getIterator(obj) {
	    var i = obj[iterator_1.$$iterator];
	    if (!i && typeof obj === 'string') {
	        return new StringIterator(obj);
	    }
	    if (!i && obj.length !== undefined) {
	        return new ArrayIterator(obj);
	    }
	    if (!i) {
	        throw new TypeError('object is not iterable');
	    }
	    return obj[iterator_1.$$iterator]();
	}
	var maxSafeInteger = Math.pow(2, 53) - 1;
	function toLength(o) {
	    var len = +o.length;
	    if (isNaN(len)) {
	        return 0;
	    }
	    if (len === 0 || !numberIsFinite(len)) {
	        return len;
	    }
	    len = sign(len) * Math.floor(Math.abs(len));
	    if (len <= 0) {
	        return 0;
	    }
	    if (len > maxSafeInteger) {
	        return maxSafeInteger;
	    }
	    return len;
	}
	function numberIsFinite(value) {
	    return typeof value === 'number' && root_1.root.isFinite(value);
	}
	function sign(value) {
	    var valueAsNumber = +value;
	    if (valueAsNumber === 0) {
	        return valueAsNumber;
	    }
	    if (isNaN(valueAsNumber)) {
	        return valueAsNumber;
	    }
	    return valueAsNumber < 0 ? -1 : 1;
	}


/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var ScalarObservable_1 = __webpack_require__(43);
	var EmptyObservable_1 = __webpack_require__(44);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var ArrayLikeObservable = (function (_super) {
	    __extends(ArrayLikeObservable, _super);
	    function ArrayLikeObservable(arrayLike, scheduler) {
	        _super.call(this);
	        this.arrayLike = arrayLike;
	        this.scheduler = scheduler;
	        if (!scheduler && arrayLike.length === 1) {
	            this._isScalar = true;
	            this.value = arrayLike[0];
	        }
	    }
	    ArrayLikeObservable.create = function (arrayLike, scheduler) {
	        var length = arrayLike.length;
	        if (length === 0) {
	            return new EmptyObservable_1.EmptyObservable();
	        }
	        else if (length === 1) {
	            return new ScalarObservable_1.ScalarObservable(arrayLike[0], scheduler);
	        }
	        else {
	            return new ArrayLikeObservable(arrayLike, scheduler);
	        }
	    };
	    ArrayLikeObservable.dispatch = function (state) {
	        var arrayLike = state.arrayLike, index = state.index, length = state.length, subscriber = state.subscriber;
	        if (subscriber.closed) {
	            return;
	        }
	        if (index >= length) {
	            subscriber.complete();
	            return;
	        }
	        subscriber.next(arrayLike[index]);
	        state.index = index + 1;
	        this.schedule(state);
	    };
	    ArrayLikeObservable.prototype._subscribe = function (subscriber) {
	        var index = 0;
	        var _a = this, arrayLike = _a.arrayLike, scheduler = _a.scheduler;
	        var length = arrayLike.length;
	        if (scheduler) {
	            return scheduler.schedule(ArrayLikeObservable.dispatch, 0, {
	                arrayLike: arrayLike, index: index, length: length, subscriber: subscriber
	            });
	        }
	        else {
	            for (var i = 0; i < length && !subscriber.closed; i++) {
	                subscriber.next(arrayLike[i]);
	            }
	            subscriber.complete();
	        }
	    };
	    return ArrayLikeObservable;
	}(Observable_1.Observable));
	exports.ArrayLikeObservable = ArrayLikeObservable;


/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var Notification_1 = __webpack_require__(70);
	/**
	 * @see {@link Notification}
	 *
	 * @param scheduler
	 * @param delay
	 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
	 * @method observeOn
	 * @owner Observable
	 */
	function observeOn(scheduler, delay) {
	    if (delay === void 0) { delay = 0; }
	    return this.lift(new ObserveOnOperator(scheduler, delay));
	}
	exports.observeOn = observeOn;
	var ObserveOnOperator = (function () {
	    function ObserveOnOperator(scheduler, delay) {
	        if (delay === void 0) { delay = 0; }
	        this.scheduler = scheduler;
	        this.delay = delay;
	    }
	    ObserveOnOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ObserveOnSubscriber(subscriber, this.scheduler, this.delay));
	    };
	    return ObserveOnOperator;
	}());
	exports.ObserveOnOperator = ObserveOnOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ObserveOnSubscriber = (function (_super) {
	    __extends(ObserveOnSubscriber, _super);
	    function ObserveOnSubscriber(destination, scheduler, delay) {
	        if (delay === void 0) { delay = 0; }
	        _super.call(this, destination);
	        this.scheduler = scheduler;
	        this.delay = delay;
	    }
	    ObserveOnSubscriber.dispatch = function (arg) {
	        var notification = arg.notification, destination = arg.destination;
	        notification.observe(destination);
	    };
	    ObserveOnSubscriber.prototype.scheduleMessage = function (notification) {
	        this.add(this.scheduler.schedule(ObserveOnSubscriber.dispatch, this.delay, new ObserveOnMessage(notification, this.destination)));
	    };
	    ObserveOnSubscriber.prototype._next = function (value) {
	        this.scheduleMessage(Notification_1.Notification.createNext(value));
	    };
	    ObserveOnSubscriber.prototype._error = function (err) {
	        this.scheduleMessage(Notification_1.Notification.createError(err));
	    };
	    ObserveOnSubscriber.prototype._complete = function () {
	        this.scheduleMessage(Notification_1.Notification.createComplete());
	    };
	    return ObserveOnSubscriber;
	}(Subscriber_1.Subscriber));
	exports.ObserveOnSubscriber = ObserveOnSubscriber;
	var ObserveOnMessage = (function () {
	    function ObserveOnMessage(notification, destination) {
	        this.notification = notification;
	        this.destination = destination;
	    }
	    return ObserveOnMessage;
	}());
	exports.ObserveOnMessage = ObserveOnMessage;


/***/ },
/* 70 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	/**
	 * Represents a push-based event or value that an {@link Observable} can emit.
	 * This class is particularly useful for operators that manage notifications,
	 * like {@link materialize}, {@link dematerialize}, {@link observeOn}, and
	 * others. Besides wrapping the actual delivered value, it also annotates it
	 * with metadata of, for instance, what type of push message it is (`next`,
	 * `error`, or `complete`).
	 *
	 * @see {@link materialize}
	 * @see {@link dematerialize}
	 * @see {@link observeOn}
	 *
	 * @class Notification<T>
	 */
	var Notification = (function () {
	    function Notification(kind, value, exception) {
	        this.kind = kind;
	        this.value = value;
	        this.exception = exception;
	        this.hasValue = kind === 'N';
	    }
	    /**
	     * Delivers to the given `observer` the value wrapped by this Notification.
	     * @param {Observer} observer
	     * @return
	     */
	    Notification.prototype.observe = function (observer) {
	        switch (this.kind) {
	            case 'N':
	                return observer.next && observer.next(this.value);
	            case 'E':
	                return observer.error && observer.error(this.exception);
	            case 'C':
	                return observer.complete && observer.complete();
	        }
	    };
	    /**
	     * Given some {@link Observer} callbacks, deliver the value represented by the
	     * current Notification to the correctly corresponding callback.
	     * @param {function(value: T): void} next An Observer `next` callback.
	     * @param {function(err: any): void} [error] An Observer `error` callback.
	     * @param {function(): void} [complete] An Observer `complete` callback.
	     * @return {any}
	     */
	    Notification.prototype.do = function (next, error, complete) {
	        var kind = this.kind;
	        switch (kind) {
	            case 'N':
	                return next && next(this.value);
	            case 'E':
	                return error && error(this.exception);
	            case 'C':
	                return complete && complete();
	        }
	    };
	    /**
	     * Takes an Observer or its individual callback functions, and calls `observe`
	     * or `do` methods accordingly.
	     * @param {Observer|function(value: T): void} nextOrObserver An Observer or
	     * the `next` callback.
	     * @param {function(err: any): void} [error] An Observer `error` callback.
	     * @param {function(): void} [complete] An Observer `complete` callback.
	     * @return {any}
	     */
	    Notification.prototype.accept = function (nextOrObserver, error, complete) {
	        if (nextOrObserver && typeof nextOrObserver.next === 'function') {
	            return this.observe(nextOrObserver);
	        }
	        else {
	            return this.do(nextOrObserver, error, complete);
	        }
	    };
	    /**
	     * Returns a simple Observable that just delivers the notification represented
	     * by this Notification instance.
	     * @return {any}
	     */
	    Notification.prototype.toObservable = function () {
	        var kind = this.kind;
	        switch (kind) {
	            case 'N':
	                return Observable_1.Observable.of(this.value);
	            case 'E':
	                return Observable_1.Observable.throw(this.exception);
	            case 'C':
	                return Observable_1.Observable.empty();
	        }
	        throw new Error('unexpected notification kind value');
	    };
	    /**
	     * A shortcut to create a Notification instance of the type `next` from a
	     * given value.
	     * @param {T} value The `next` value.
	     * @return {Notification<T>} The "next" Notification representing the
	     * argument.
	     */
	    Notification.createNext = function (value) {
	        if (typeof value !== 'undefined') {
	            return new Notification('N', value);
	        }
	        return this.undefinedValueNotification;
	    };
	    /**
	     * A shortcut to create a Notification instance of the type `error` from a
	     * given error.
	     * @param {any} [err] The `error` exception.
	     * @return {Notification<T>} The "error" Notification representing the
	     * argument.
	     */
	    Notification.createError = function (err) {
	        return new Notification('E', undefined, err);
	    };
	    /**
	     * A shortcut to create a Notification instance of the type `complete`.
	     * @return {Notification<any>} The valueless "complete" Notification.
	     */
	    Notification.createComplete = function () {
	        return this.completeNotification;
	    };
	    Notification.completeNotification = new Notification('C');
	    Notification.undefinedValueNotification = new Notification('N', undefined);
	    return Notification;
	}());
	exports.Notification = Notification;


/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var fromEvent_1 = __webpack_require__(72);
	Observable_1.Observable.fromEvent = fromEvent_1.fromEvent;


/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var FromEventObservable_1 = __webpack_require__(73);
	exports.fromEvent = FromEventObservable_1.FromEventObservable.create;


/***/ },
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var tryCatch_1 = __webpack_require__(24);
	var isFunction_1 = __webpack_require__(20);
	var errorObject_1 = __webpack_require__(25);
	var Subscription_1 = __webpack_require__(21);
	function isNodeStyleEventEmmitter(sourceObj) {
	    return !!sourceObj && typeof sourceObj.addListener === 'function' && typeof sourceObj.removeListener === 'function';
	}
	function isJQueryStyleEventEmitter(sourceObj) {
	    return !!sourceObj && typeof sourceObj.on === 'function' && typeof sourceObj.off === 'function';
	}
	function isNodeList(sourceObj) {
	    return !!sourceObj && sourceObj.toString() === '[object NodeList]';
	}
	function isHTMLCollection(sourceObj) {
	    return !!sourceObj && sourceObj.toString() === '[object HTMLCollection]';
	}
	function isEventTarget(sourceObj) {
	    return !!sourceObj && typeof sourceObj.addEventListener === 'function' && typeof sourceObj.removeEventListener === 'function';
	}
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var FromEventObservable = (function (_super) {
	    __extends(FromEventObservable, _super);
	    function FromEventObservable(sourceObj, eventName, selector, options) {
	        _super.call(this);
	        this.sourceObj = sourceObj;
	        this.eventName = eventName;
	        this.selector = selector;
	        this.options = options;
	    }
	    /* tslint:enable:max-line-length */
	    /**
	     * Creates an Observable that emits events of a specific type coming from the
	     * given event target.
	     *
	     * <span class="informal">Creates an Observable from DOM events, or Node
	     * EventEmitter events or others.</span>
	     *
	     * <img src="./img/fromEvent.png" width="100%">
	     *
	     * Creates an Observable by attaching an event listener to an "event target",
	     * which may be an object with `addEventListener` and `removeEventListener`,
	     * a Node.js EventEmitter, a jQuery style EventEmitter, a NodeList from the
	     * DOM, or an HTMLCollection from the DOM. The event handler is attached when
	     * the output Observable is subscribed, and removed when the Subscription is
	     * unsubscribed.
	     *
	     * @example <caption>Emits clicks happening on the DOM document</caption>
	     * var clicks = Rx.Observable.fromEvent(document, 'click');
	     * clicks.subscribe(x => console.log(x));
	     *
	     * @see {@link from}
	     * @see {@link fromEventPattern}
	     *
	     * @param {EventTargetLike} target The DOMElement, event target, Node.js
	     * EventEmitter, NodeList or HTMLCollection to attach the event handler to.
	     * @param {string} eventName The event name of interest, being emitted by the
	     * `target`.
	     * @parm {EventListenerOptions} [options] Options to pass through to addEventListener
	     * @param {SelectorMethodSignature<T>} [selector] An optional function to
	     * post-process results. It takes the arguments from the event handler and
	     * should return a single value.
	     * @return {Observable<T>}
	     * @static true
	     * @name fromEvent
	     * @owner Observable
	     */
	    FromEventObservable.create = function (target, eventName, options, selector) {
	        if (isFunction_1.isFunction(options)) {
	            selector = options;
	            options = undefined;
	        }
	        return new FromEventObservable(target, eventName, selector, options);
	    };
	    FromEventObservable.setupSubscription = function (sourceObj, eventName, handler, subscriber, options) {
	        var unsubscribe;
	        if (isNodeList(sourceObj) || isHTMLCollection(sourceObj)) {
	            for (var i = 0, len = sourceObj.length; i < len; i++) {
	                FromEventObservable.setupSubscription(sourceObj[i], eventName, handler, subscriber, options);
	            }
	        }
	        else if (isEventTarget(sourceObj)) {
	            var source_1 = sourceObj;
	            sourceObj.addEventListener(eventName, handler, options);
	            unsubscribe = function () { return source_1.removeEventListener(eventName, handler); };
	        }
	        else if (isJQueryStyleEventEmitter(sourceObj)) {
	            var source_2 = sourceObj;
	            sourceObj.on(eventName, handler);
	            unsubscribe = function () { return source_2.off(eventName, handler); };
	        }
	        else if (isNodeStyleEventEmmitter(sourceObj)) {
	            var source_3 = sourceObj;
	            sourceObj.addListener(eventName, handler);
	            unsubscribe = function () { return source_3.removeListener(eventName, handler); };
	        }
	        subscriber.add(new Subscription_1.Subscription(unsubscribe));
	    };
	    FromEventObservable.prototype._subscribe = function (subscriber) {
	        var sourceObj = this.sourceObj;
	        var eventName = this.eventName;
	        var options = this.options;
	        var selector = this.selector;
	        var handler = selector ? function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            var result = tryCatch_1.tryCatch(selector).apply(void 0, args);
	            if (result === errorObject_1.errorObject) {
	                subscriber.error(errorObject_1.errorObject.e);
	            }
	            else {
	                subscriber.next(result);
	            }
	        } : function (e) { return subscriber.next(e); };
	        FromEventObservable.setupSubscription(sourceObj, eventName, handler, subscriber, options);
	    };
	    return FromEventObservable;
	}(Observable_1.Observable));
	exports.FromEventObservable = FromEventObservable;


/***/ },
/* 74 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var fromEventPattern_1 = __webpack_require__(75);
	Observable_1.Observable.fromEventPattern = fromEventPattern_1.fromEventPattern;


/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var FromEventPatternObservable_1 = __webpack_require__(76);
	exports.fromEventPattern = FromEventPatternObservable_1.FromEventPatternObservable.create;


/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var Subscription_1 = __webpack_require__(21);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var FromEventPatternObservable = (function (_super) {
	    __extends(FromEventPatternObservable, _super);
	    function FromEventPatternObservable(addHandler, removeHandler, selector) {
	        _super.call(this);
	        this.addHandler = addHandler;
	        this.removeHandler = removeHandler;
	        this.selector = selector;
	    }
	    /**
	     * Creates an Observable from an API based on addHandler/removeHandler
	     * functions.
	     *
	     * <span class="informal">Converts any addHandler/removeHandler API to an
	     * Observable.</span>
	     *
	     * <img src="./img/fromEventPattern.png" width="100%">
	     *
	     * Creates an Observable by using the `addHandler` and `removeHandler`
	     * functions to add and remove the handlers, with an optional selector
	     * function to project the event arguments to a result. The `addHandler` is
	     * called when the output Observable is subscribed, and `removeHandler` is
	     * called when the Subscription is unsubscribed.
	     *
	     * @example <caption>Emits clicks happening on the DOM document</caption>
	     * function addClickHandler(handler) {
	     *   document.addEventListener('click', handler);
	     * }
	     *
	     * function removeClickHandler(handler) {
	     *   document.removeEventListener('click', handler);
	     * }
	     *
	     * var clicks = Rx.Observable.fromEventPattern(
	     *   addClickHandler,
	     *   removeClickHandler
	     * );
	     * clicks.subscribe(x => console.log(x));
	     *
	     * @see {@link from}
	     * @see {@link fromEvent}
	     *
	     * @param {function(handler: Function): any} addHandler A function that takes
	     * a `handler` function as argument and attaches it somehow to the actual
	     * source of events.
	     * @param {function(handler: Function): void} removeHandler A function that
	     * takes a `handler` function as argument and removes it in case it was
	     * previously attached using `addHandler`.
	     * @param {function(...args: any): T} [selector] An optional function to
	     * post-process results. It takes the arguments from the event handler and
	     * should return a single value.
	     * @return {Observable<T>}
	     * @static true
	     * @name fromEventPattern
	     * @owner Observable
	     */
	    FromEventPatternObservable.create = function (addHandler, removeHandler, selector) {
	        return new FromEventPatternObservable(addHandler, removeHandler, selector);
	    };
	    FromEventPatternObservable.prototype._subscribe = function (subscriber) {
	        var _this = this;
	        var removeHandler = this.removeHandler;
	        var handler = !!this.selector ? function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            _this._callSelector(subscriber, args);
	        } : function (e) { subscriber.next(e); };
	        this._callAddHandler(handler, subscriber);
	        subscriber.add(new Subscription_1.Subscription(function () {
	            //TODO: determine whether or not to forward to error handler
	            removeHandler(handler);
	        }));
	    };
	    FromEventPatternObservable.prototype._callSelector = function (subscriber, args) {
	        try {
	            var result = this.selector.apply(this, args);
	            subscriber.next(result);
	        }
	        catch (e) {
	            subscriber.error(e);
	        }
	    };
	    FromEventPatternObservable.prototype._callAddHandler = function (handler, errorSubscriber) {
	        try {
	            this.addHandler(handler);
	        }
	        catch (e) {
	            errorSubscriber.error(e);
	        }
	    };
	    return FromEventPatternObservable;
	}(Observable_1.Observable));
	exports.FromEventPatternObservable = FromEventPatternObservable;


/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var fromPromise_1 = __webpack_require__(78);
	Observable_1.Observable.fromPromise = fromPromise_1.fromPromise;


/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var PromiseObservable_1 = __webpack_require__(66);
	exports.fromPromise = PromiseObservable_1.PromiseObservable.create;


/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var GenerateObservable_1 = __webpack_require__(80);
	Observable_1.Observable.generate = GenerateObservable_1.GenerateObservable.create;


/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var isScheduler_1 = __webpack_require__(41);
	var selfSelector = function (value) { return value; };
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var GenerateObservable = (function (_super) {
	    __extends(GenerateObservable, _super);
	    function GenerateObservable(initialState, condition, iterate, resultSelector, scheduler) {
	        _super.call(this);
	        this.initialState = initialState;
	        this.condition = condition;
	        this.iterate = iterate;
	        this.resultSelector = resultSelector;
	        this.scheduler = scheduler;
	    }
	    GenerateObservable.create = function (initialStateOrOptions, condition, iterate, resultSelectorOrObservable, scheduler) {
	        if (arguments.length == 1) {
	            return new GenerateObservable(initialStateOrOptions.initialState, initialStateOrOptions.condition, initialStateOrOptions.iterate, initialStateOrOptions.resultSelector || selfSelector, initialStateOrOptions.scheduler);
	        }
	        if (resultSelectorOrObservable === undefined || isScheduler_1.isScheduler(resultSelectorOrObservable)) {
	            return new GenerateObservable(initialStateOrOptions, condition, iterate, selfSelector, resultSelectorOrObservable);
	        }
	        return new GenerateObservable(initialStateOrOptions, condition, iterate, resultSelectorOrObservable, scheduler);
	    };
	    GenerateObservable.prototype._subscribe = function (subscriber) {
	        var state = this.initialState;
	        if (this.scheduler) {
	            return this.scheduler.schedule(GenerateObservable.dispatch, 0, {
	                subscriber: subscriber,
	                iterate: this.iterate,
	                condition: this.condition,
	                resultSelector: this.resultSelector,
	                state: state });
	        }
	        var _a = this, condition = _a.condition, resultSelector = _a.resultSelector, iterate = _a.iterate;
	        do {
	            if (condition) {
	                var conditionResult = void 0;
	                try {
	                    conditionResult = condition(state);
	                }
	                catch (err) {
	                    subscriber.error(err);
	                    return;
	                }
	                if (!conditionResult) {
	                    subscriber.complete();
	                    break;
	                }
	            }
	            var value = void 0;
	            try {
	                value = resultSelector(state);
	            }
	            catch (err) {
	                subscriber.error(err);
	                return;
	            }
	            subscriber.next(value);
	            if (subscriber.closed) {
	                break;
	            }
	            try {
	                state = iterate(state);
	            }
	            catch (err) {
	                subscriber.error(err);
	                return;
	            }
	        } while (true);
	    };
	    GenerateObservable.dispatch = function (state) {
	        var subscriber = state.subscriber, condition = state.condition;
	        if (subscriber.closed) {
	            return;
	        }
	        if (state.needIterate) {
	            try {
	                state.state = state.iterate(state.state);
	            }
	            catch (err) {
	                subscriber.error(err);
	                return;
	            }
	        }
	        else {
	            state.needIterate = true;
	        }
	        if (condition) {
	            var conditionResult = void 0;
	            try {
	                conditionResult = condition(state.state);
	            }
	            catch (err) {
	                subscriber.error(err);
	                return;
	            }
	            if (!conditionResult) {
	                subscriber.complete();
	                return;
	            }
	            if (subscriber.closed) {
	                return;
	            }
	        }
	        var value;
	        try {
	            value = state.resultSelector(state.state);
	        }
	        catch (err) {
	            subscriber.error(err);
	            return;
	        }
	        if (subscriber.closed) {
	            return;
	        }
	        subscriber.next(value);
	        if (subscriber.closed) {
	            return;
	        }
	        return this.schedule(state);
	    };
	    return GenerateObservable;
	}(Observable_1.Observable));
	exports.GenerateObservable = GenerateObservable;


/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var if_1 = __webpack_require__(82);
	Observable_1.Observable.if = if_1._if;


/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var IfObservable_1 = __webpack_require__(83);
	exports._if = IfObservable_1.IfObservable.create;


/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var IfObservable = (function (_super) {
	    __extends(IfObservable, _super);
	    function IfObservable(condition, thenSource, elseSource) {
	        _super.call(this);
	        this.condition = condition;
	        this.thenSource = thenSource;
	        this.elseSource = elseSource;
	    }
	    IfObservable.create = function (condition, thenSource, elseSource) {
	        return new IfObservable(condition, thenSource, elseSource);
	    };
	    IfObservable.prototype._subscribe = function (subscriber) {
	        var _a = this, condition = _a.condition, thenSource = _a.thenSource, elseSource = _a.elseSource;
	        return new IfSubscriber(subscriber, condition, thenSource, elseSource);
	    };
	    return IfObservable;
	}(Observable_1.Observable));
	exports.IfObservable = IfObservable;
	var IfSubscriber = (function (_super) {
	    __extends(IfSubscriber, _super);
	    function IfSubscriber(destination, condition, thenSource, elseSource) {
	        _super.call(this, destination);
	        this.condition = condition;
	        this.thenSource = thenSource;
	        this.elseSource = elseSource;
	        this.tryIf();
	    }
	    IfSubscriber.prototype.tryIf = function () {
	        var _a = this, condition = _a.condition, thenSource = _a.thenSource, elseSource = _a.elseSource;
	        var result;
	        try {
	            result = condition();
	            var source = result ? thenSource : elseSource;
	            if (source) {
	                this.add(subscribeToResult_1.subscribeToResult(this, source));
	            }
	            else {
	                this._complete();
	            }
	        }
	        catch (err) {
	            this._error(err);
	        }
	    };
	    return IfSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var interval_1 = __webpack_require__(85);
	Observable_1.Observable.interval = interval_1.interval;


/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var IntervalObservable_1 = __webpack_require__(86);
	exports.interval = IntervalObservable_1.IntervalObservable.create;


/***/ },
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var isNumeric_1 = __webpack_require__(87);
	var Observable_1 = __webpack_require__(16);
	var async_1 = __webpack_require__(88);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var IntervalObservable = (function (_super) {
	    __extends(IntervalObservable, _super);
	    function IntervalObservable(period, scheduler) {
	        if (period === void 0) { period = 0; }
	        if (scheduler === void 0) { scheduler = async_1.async; }
	        _super.call(this);
	        this.period = period;
	        this.scheduler = scheduler;
	        if (!isNumeric_1.isNumeric(period) || period < 0) {
	            this.period = 0;
	        }
	        if (!scheduler || typeof scheduler.schedule !== 'function') {
	            this.scheduler = async_1.async;
	        }
	    }
	    /**
	     * Creates an Observable that emits sequential numbers every specified
	     * interval of time, on a specified Scheduler.
	     *
	     * <span class="informal">Emits incremental numbers periodically in time.
	     * </span>
	     *
	     * <img src="./img/interval.png" width="100%">
	     *
	     * `interval` returns an Observable that emits an infinite sequence of
	     * ascending integers, with a constant interval of time of your choosing
	     * between those emissions. The first emission is not sent immediately, but
	     * only after the first period has passed. By default, this operator uses the
	     * `async` Scheduler to provide a notion of time, but you may pass any
	     * Scheduler to it.
	     *
	     * @example <caption>Emits ascending numbers, one every second (1000ms)</caption>
	     * var numbers = Rx.Observable.interval(1000);
	     * numbers.subscribe(x => console.log(x));
	     *
	     * @see {@link timer}
	     * @see {@link delay}
	     *
	     * @param {number} [period=0] The interval size in milliseconds (by default)
	     * or the time unit determined by the scheduler's clock.
	     * @param {Scheduler} [scheduler=async] The Scheduler to use for scheduling
	     * the emission of values, and providing a notion of "time".
	     * @return {Observable} An Observable that emits a sequential number each time
	     * interval.
	     * @static true
	     * @name interval
	     * @owner Observable
	     */
	    IntervalObservable.create = function (period, scheduler) {
	        if (period === void 0) { period = 0; }
	        if (scheduler === void 0) { scheduler = async_1.async; }
	        return new IntervalObservable(period, scheduler);
	    };
	    IntervalObservable.dispatch = function (state) {
	        var index = state.index, subscriber = state.subscriber, period = state.period;
	        subscriber.next(index);
	        if (subscriber.closed) {
	            return;
	        }
	        state.index += 1;
	        this.schedule(state, period);
	    };
	    IntervalObservable.prototype._subscribe = function (subscriber) {
	        var index = 0;
	        var period = this.period;
	        var scheduler = this.scheduler;
	        subscriber.add(scheduler.schedule(IntervalObservable.dispatch, period, {
	            index: index, subscriber: subscriber, period: period
	        }));
	    };
	    return IntervalObservable;
	}(Observable_1.Observable));
	exports.IntervalObservable = IntervalObservable;


/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var isArray_1 = __webpack_require__(22);
	function isNumeric(val) {
	    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
	    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
	    // subtraction forces infinities to NaN
	    // adding 1 corrects loss of precision from parseFloat (#15100)
	    return !isArray_1.isArray(val) && (val - parseFloat(val) + 1) >= 0;
	}
	exports.isNumeric = isNumeric;
	;


/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var AsyncAction_1 = __webpack_require__(89);
	var AsyncScheduler_1 = __webpack_require__(91);
	exports.async = new AsyncScheduler_1.AsyncScheduler(AsyncAction_1.AsyncAction);


/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var root_1 = __webpack_require__(17);
	var Action_1 = __webpack_require__(90);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var AsyncAction = (function (_super) {
	    __extends(AsyncAction, _super);
	    function AsyncAction(scheduler, work) {
	        _super.call(this, scheduler, work);
	        this.scheduler = scheduler;
	        this.work = work;
	        this.pending = false;
	    }
	    AsyncAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) { delay = 0; }
	        if (this.closed) {
	            return this;
	        }
	        // Always replace the current state with the new state.
	        this.state = state;
	        // Set the pending flag indicating that this action has been scheduled, or
	        // has recursively rescheduled itself.
	        this.pending = true;
	        var id = this.id;
	        var scheduler = this.scheduler;
	        //
	        // Important implementation note:
	        //
	        // Actions only execute once by default, unless rescheduled from within the
	        // scheduled callback. This allows us to implement single and repeat
	        // actions via the same code path, without adding API surface area, as well
	        // as mimic traditional recursion but across asynchronous boundaries.
	        //
	        // However, JS runtimes and timers distinguish between intervals achieved by
	        // serial `setTimeout` calls vs. a single `setInterval` call. An interval of
	        // serial `setTimeout` calls can be individually delayed, which delays
	        // scheduling the next `setTimeout`, and so on. `setInterval` attempts to
	        // guarantee the interval callback will be invoked more precisely to the
	        // interval period, regardless of load.
	        //
	        // Therefore, we use `setInterval` to schedule single and repeat actions.
	        // If the action reschedules itself with the same delay, the interval is not
	        // canceled. If the action doesn't reschedule, or reschedules with a
	        // different delay, the interval will be canceled after scheduled callback
	        // execution.
	        //
	        if (id != null) {
	            this.id = this.recycleAsyncId(scheduler, id, delay);
	        }
	        this.delay = delay;
	        // If this action has already an async Id, don't request a new one.
	        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
	        return this;
	    };
	    AsyncAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        return root_1.root.setInterval(scheduler.flush.bind(scheduler, this), delay);
	    };
	    AsyncAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        // If this action is rescheduled with the same delay time, don't clear the interval id.
	        if (delay !== null && this.delay === delay) {
	            return id;
	        }
	        // Otherwise, if the action's delay time is different from the current delay,
	        // clear the interval id
	        return root_1.root.clearInterval(id) && undefined || undefined;
	    };
	    /**
	     * Immediately executes this action and the `work` it contains.
	     * @return {any}
	     */
	    AsyncAction.prototype.execute = function (state, delay) {
	        if (this.closed) {
	            return new Error('executing a cancelled action');
	        }
	        this.pending = false;
	        var error = this._execute(state, delay);
	        if (error) {
	            return error;
	        }
	        else if (this.pending === false && this.id != null) {
	            // Dequeue if the action didn't reschedule itself. Don't call
	            // unsubscribe(), because the action could reschedule later.
	            // For example:
	            // ```
	            // scheduler.schedule(function doWork(counter) {
	            //   /* ... I'm a busy worker bee ... */
	            //   var originalAction = this;
	            //   /* wait 100ms before rescheduling the action */
	            //   setTimeout(function () {
	            //     originalAction.schedule(counter + 1);
	            //   }, 100);
	            // }, 1000);
	            // ```
	            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
	        }
	    };
	    AsyncAction.prototype._execute = function (state, delay) {
	        var errored = false;
	        var errorValue = undefined;
	        try {
	            this.work(state);
	        }
	        catch (e) {
	            errored = true;
	            errorValue = !!e && e || new Error(e);
	        }
	        if (errored) {
	            this.unsubscribe();
	            return errorValue;
	        }
	    };
	    AsyncAction.prototype._unsubscribe = function () {
	        var id = this.id;
	        var scheduler = this.scheduler;
	        var actions = scheduler.actions;
	        var index = actions.indexOf(this);
	        this.work = null;
	        this.delay = null;
	        this.state = null;
	        this.pending = false;
	        this.scheduler = null;
	        if (index !== -1) {
	            actions.splice(index, 1);
	        }
	        if (id != null) {
	            this.id = this.recycleAsyncId(scheduler, id, null);
	        }
	    };
	    return AsyncAction;
	}(Action_1.Action));
	exports.AsyncAction = AsyncAction;


/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscription_1 = __webpack_require__(21);
	/**
	 * A unit of work to be executed in a {@link Scheduler}. An action is typically
	 * created from within a Scheduler and an RxJS user does not need to concern
	 * themselves about creating and manipulating an Action.
	 *
	 * ```ts
	 * class Action<T> extends Subscription {
	 *   new (scheduler: Scheduler, work: (state?: T) => void);
	 *   schedule(state?: T, delay: number = 0): Subscription;
	 * }
	 * ```
	 *
	 * @class Action<T>
	 */
	var Action = (function (_super) {
	    __extends(Action, _super);
	    function Action(scheduler, work) {
	        _super.call(this);
	    }
	    /**
	     * Schedules this action on its parent Scheduler for execution. May be passed
	     * some context object, `state`. May happen at some point in the future,
	     * according to the `delay` parameter, if specified.
	     * @param {T} [state] Some contextual data that the `work` function uses when
	     * called by the Scheduler.
	     * @param {number} [delay] Time to wait before executing the work, where the
	     * time unit is implicit and defined by the Scheduler.
	     * @return {void}
	     */
	    Action.prototype.schedule = function (state, delay) {
	        if (delay === void 0) { delay = 0; }
	        return this;
	    };
	    return Action;
	}(Subscription_1.Subscription));
	exports.Action = Action;


/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Scheduler_1 = __webpack_require__(92);
	var AsyncScheduler = (function (_super) {
	    __extends(AsyncScheduler, _super);
	    function AsyncScheduler() {
	        _super.apply(this, arguments);
	        this.actions = [];
	        /**
	         * A flag to indicate whether the Scheduler is currently executing a batch of
	         * queued actions.
	         * @type {boolean}
	         */
	        this.active = false;
	        /**
	         * An internal ID used to track the latest asynchronous task such as those
	         * coming from `setTimeout`, `setInterval`, `requestAnimationFrame`, and
	         * others.
	         * @type {any}
	         */
	        this.scheduled = undefined;
	    }
	    AsyncScheduler.prototype.flush = function (action) {
	        var actions = this.actions;
	        if (this.active) {
	            actions.push(action);
	            return;
	        }
	        var error;
	        this.active = true;
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (action = actions.shift()); // exhaust the scheduler queue
	        this.active = false;
	        if (error) {
	            while (action = actions.shift()) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AsyncScheduler;
	}(Scheduler_1.Scheduler));
	exports.AsyncScheduler = AsyncScheduler;


/***/ },
/* 92 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * An execution context and a data structure to order tasks and schedule their
	 * execution. Provides a notion of (potentially virtual) time, through the
	 * `now()` getter method.
	 *
	 * Each unit of work in a Scheduler is called an {@link Action}.
	 *
	 * ```ts
	 * class Scheduler {
	 *   now(): number;
	 *   schedule(work, delay?, state?): Subscription;
	 * }
	 * ```
	 *
	 * @class Scheduler
	 */
	var Scheduler = (function () {
	    function Scheduler(SchedulerAction, now) {
	        if (now === void 0) { now = Scheduler.now; }
	        this.SchedulerAction = SchedulerAction;
	        this.now = now;
	    }
	    /**
	     * Schedules a function, `work`, for execution. May happen at some point in
	     * the future, according to the `delay` parameter, if specified. May be passed
	     * some context object, `state`, which will be passed to the `work` function.
	     *
	     * The given arguments will be processed an stored as an Action object in a
	     * queue of actions.
	     *
	     * @param {function(state: ?T): ?Subscription} work A function representing a
	     * task, or some unit of work to be executed by the Scheduler.
	     * @param {number} [delay] Time to wait before executing the work, where the
	     * time unit is implicit and defined by the Scheduler itself.
	     * @param {T} [state] Some contextual data that the `work` function uses when
	     * called by the Scheduler.
	     * @return {Subscription} A subscription in order to be able to unsubscribe
	     * the scheduled work.
	     */
	    Scheduler.prototype.schedule = function (work, delay, state) {
	        if (delay === void 0) { delay = 0; }
	        return new this.SchedulerAction(this, work).schedule(state, delay);
	    };
	    Scheduler.now = Date.now ? Date.now : function () { return +new Date(); };
	    return Scheduler;
	}());
	exports.Scheduler = Scheduler;


/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var merge_1 = __webpack_require__(94);
	Observable_1.Observable.merge = merge_1.merge;


/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var merge_1 = __webpack_require__(95);
	exports.merge = merge_1.mergeStatic;


/***/ },
/* 95 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ArrayObservable_1 = __webpack_require__(42);
	var mergeAll_1 = __webpack_require__(54);
	var isScheduler_1 = __webpack_require__(41);
	/**
	 * Creates an output Observable which concurrently emits all values from every
	 * given input Observable.
	 *
	 * <span class="informal">Flattens multiple Observables together by blending
	 * their values into one Observable.</span>
	 *
	 * <img src="./img/merge.png" width="100%">
	 *
	 * `merge` subscribes to each given input Observable (either the source or an
	 * Observable given as argument), and simply forwards (without doing any
	 * transformation) all the values from all the input Observables to the output
	 * Observable. The output Observable only completes once all input Observables
	 * have completed. Any error delivered by an input Observable will be immediately
	 * emitted on the output Observable.
	 *
	 * @example <caption>Merge together two Observables: 1s interval and clicks</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var timer = Rx.Observable.interval(1000);
	 * var clicksOrTimer = clicks.merge(timer);
	 * clicksOrTimer.subscribe(x => console.log(x));
	 *
	 * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>
	 * var timer1 = Rx.Observable.interval(1000).take(10);
	 * var timer2 = Rx.Observable.interval(2000).take(6);
	 * var timer3 = Rx.Observable.interval(500).take(10);
	 * var concurrent = 2; // the argument
	 * var merged = timer1.merge(timer2, timer3, concurrent);
	 * merged.subscribe(x => console.log(x));
	 *
	 * @see {@link mergeAll}
	 * @see {@link mergeMap}
	 * @see {@link mergeMapTo}
	 * @see {@link mergeScan}
	 *
	 * @param {Observable} other An input Observable to merge with the source
	 * Observable. More than one input Observables may be given as argument.
	 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
	 * Observables being subscribed to concurrently.
	 * @param {Scheduler} [scheduler=null] The Scheduler to use for managing
	 * concurrency of input Observables.
	 * @return {Observable} an Observable that emits items that are the result of
	 * every input Observable.
	 * @method merge
	 * @owner Observable
	 */
	function merge() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    observables.unshift(this);
	    return mergeStatic.apply(this, observables);
	}
	exports.merge = merge;
	/* tslint:enable:max-line-length */
	/**
	 * Creates an output Observable which concurrently emits all values from every
	 * given input Observable.
	 *
	 * <span class="informal">Flattens multiple Observables together by blending
	 * their values into one Observable.</span>
	 *
	 * <img src="./img/merge.png" width="100%">
	 *
	 * `merge` subscribes to each given input Observable (as arguments), and simply
	 * forwards (without doing any transformation) all the values from all the input
	 * Observables to the output Observable. The output Observable only completes
	 * once all input Observables have completed. Any error delivered by an input
	 * Observable will be immediately emitted on the output Observable.
	 *
	 * @example <caption>Merge together two Observables: 1s interval and clicks</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var timer = Rx.Observable.interval(1000);
	 * var clicksOrTimer = Rx.Observable.merge(clicks, timer);
	 * clicksOrTimer.subscribe(x => console.log(x));
	 *
	 * @example <caption>Merge together 3 Observables, but only 2 run concurrently</caption>
	 * var timer1 = Rx.Observable.interval(1000).take(10);
	 * var timer2 = Rx.Observable.interval(2000).take(6);
	 * var timer3 = Rx.Observable.interval(500).take(10);
	 * var concurrent = 2; // the argument
	 * var merged = Rx.Observable.merge(timer1, timer2, timer3, concurrent);
	 * merged.subscribe(x => console.log(x));
	 *
	 * @see {@link mergeAll}
	 * @see {@link mergeMap}
	 * @see {@link mergeMapTo}
	 * @see {@link mergeScan}
	 *
	 * @param {Observable} input1 An input Observable to merge with others.
	 * @param {Observable} input2 An input Observable to merge with others.
	 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
	 * Observables being subscribed to concurrently.
	 * @param {Scheduler} [scheduler=null] The Scheduler to use for managing
	 * concurrency of input Observables.
	 * @return {Observable} an Observable that emits items that are the result of
	 * every input Observable.
	 * @static true
	 * @name merge
	 * @owner Observable
	 */
	function mergeStatic() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    var concurrent = Number.POSITIVE_INFINITY;
	    var scheduler = null;
	    var last = observables[observables.length - 1];
	    if (isScheduler_1.isScheduler(last)) {
	        scheduler = observables.pop();
	        if (observables.length > 1 && typeof observables[observables.length - 1] === 'number') {
	            concurrent = observables.pop();
	        }
	    }
	    else if (typeof last === 'number') {
	        concurrent = observables.pop();
	    }
	    if (observables.length === 1) {
	        return observables[0];
	    }
	    return new ArrayObservable_1.ArrayObservable(observables, scheduler).lift(new mergeAll_1.MergeAllOperator(concurrent));
	}
	exports.mergeStatic = mergeStatic;


/***/ },
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var race_1 = __webpack_require__(97);
	Observable_1.Observable.race = race_1.raceStatic;


/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var isArray_1 = __webpack_require__(22);
	var ArrayObservable_1 = __webpack_require__(42);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Returns an Observable that mirrors the first source Observable to emit an item
	 * from the combination of this Observable and supplied Observables
	 * @param {...Observables} ...observables sources used to race for which Observable emits first.
	 * @return {Observable} an Observable that mirrors the output of the first Observable to emit an item.
	 * @method race
	 * @owner Observable
	 */
	function race() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    // if the only argument is an array, it was most likely called with
	    // `pair([obs1, obs2, ...])`
	    if (observables.length === 1 && isArray_1.isArray(observables[0])) {
	        observables = observables[0];
	    }
	    observables.unshift(this);
	    return raceStatic.apply(this, observables);
	}
	exports.race = race;
	function raceStatic() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    // if the only argument is an array, it was most likely called with
	    // `pair([obs1, obs2, ...])`
	    if (observables.length === 1) {
	        if (isArray_1.isArray(observables[0])) {
	            observables = observables[0];
	        }
	        else {
	            return observables[0];
	        }
	    }
	    return new ArrayObservable_1.ArrayObservable(observables).lift(new RaceOperator());
	}
	exports.raceStatic = raceStatic;
	var RaceOperator = (function () {
	    function RaceOperator() {
	    }
	    RaceOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new RaceSubscriber(subscriber));
	    };
	    return RaceOperator;
	}());
	exports.RaceOperator = RaceOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var RaceSubscriber = (function (_super) {
	    __extends(RaceSubscriber, _super);
	    function RaceSubscriber(destination) {
	        _super.call(this, destination);
	        this.hasFirst = false;
	        this.observables = [];
	        this.subscriptions = [];
	    }
	    RaceSubscriber.prototype._next = function (observable) {
	        this.observables.push(observable);
	    };
	    RaceSubscriber.prototype._complete = function () {
	        var observables = this.observables;
	        var len = observables.length;
	        if (len === 0) {
	            this.destination.complete();
	        }
	        else {
	            for (var i = 0; i < len; i++) {
	                var observable = observables[i];
	                var subscription = subscribeToResult_1.subscribeToResult(this, observable, observable, i);
	                if (this.subscriptions) {
	                    this.subscriptions.push(subscription);
	                    this.add(subscription);
	                }
	            }
	            this.observables = null;
	        }
	    };
	    RaceSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        if (!this.hasFirst) {
	            this.hasFirst = true;
	            for (var i = 0; i < this.subscriptions.length; i++) {
	                if (i !== outerIndex) {
	                    var subscription = this.subscriptions[i];
	                    subscription.unsubscribe();
	                    this.remove(subscription);
	                }
	            }
	            this.subscriptions = null;
	        }
	        this.destination.next(innerValue);
	    };
	    return RaceSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.RaceSubscriber = RaceSubscriber;


/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var never_1 = __webpack_require__(99);
	Observable_1.Observable.never = never_1.never;


/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var NeverObservable_1 = __webpack_require__(100);
	exports.never = NeverObservable_1.NeverObservable.create;


/***/ },
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var noop_1 = __webpack_require__(101);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var NeverObservable = (function (_super) {
	    __extends(NeverObservable, _super);
	    function NeverObservable() {
	        _super.call(this);
	    }
	    /**
	     * Creates an Observable that emits no items to the Observer.
	     *
	     * <span class="informal">An Observable that never emits anything.</span>
	     *
	     * <img src="./img/never.png" width="100%">
	     *
	     * This static operator is useful for creating a simple Observable that emits
	     * neither values nor errors nor the completion notification. It can be used
	     * for testing purposes or for composing with other Observables. Please not
	     * that by never emitting a complete notification, this Observable keeps the
	     * subscription from being disposed automatically. Subscriptions need to be
	     * manually disposed.
	     *
	     * @example <caption>Emit the number 7, then never emit anything else (not even complete).</caption>
	     * function info() {
	     *   console.log('Will not be called');
	     * }
	     * var result = Rx.Observable.never().startWith(7);
	     * result.subscribe(x => console.log(x), info, info);
	     *
	     * @see {@link create}
	     * @see {@link empty}
	     * @see {@link of}
	     * @see {@link throw}
	     *
	     * @return {Observable} A "never" Observable: never emits anything.
	     * @static true
	     * @name never
	     * @owner Observable
	     */
	    NeverObservable.create = function () {
	        return new NeverObservable();
	    };
	    NeverObservable.prototype._subscribe = function (subscriber) {
	        noop_1.noop();
	    };
	    return NeverObservable;
	}(Observable_1.Observable));
	exports.NeverObservable = NeverObservable;


/***/ },
/* 101 */
/***/ function(module, exports) {

	"use strict";
	/* tslint:disable:no-empty */
	function noop() { }
	exports.noop = noop;


/***/ },
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var of_1 = __webpack_require__(103);
	Observable_1.Observable.of = of_1.of;


/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ArrayObservable_1 = __webpack_require__(42);
	exports.of = ArrayObservable_1.ArrayObservable.of;


/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var onErrorResumeNext_1 = __webpack_require__(105);
	Observable_1.Observable.onErrorResumeNext = onErrorResumeNext_1.onErrorResumeNextStatic;


/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var FromObservable_1 = __webpack_require__(65);
	var isArray_1 = __webpack_require__(22);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	function onErrorResumeNext() {
	    var nextSources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        nextSources[_i - 0] = arguments[_i];
	    }
	    if (nextSources.length === 1 && isArray_1.isArray(nextSources[0])) {
	        nextSources = nextSources[0];
	    }
	    return this.lift(new OnErrorResumeNextOperator(nextSources));
	}
	exports.onErrorResumeNext = onErrorResumeNext;
	/* tslint:enable:max-line-length */
	function onErrorResumeNextStatic() {
	    var nextSources = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        nextSources[_i - 0] = arguments[_i];
	    }
	    var source = null;
	    if (nextSources.length === 1 && isArray_1.isArray(nextSources[0])) {
	        nextSources = nextSources[0];
	    }
	    source = nextSources.shift();
	    return new FromObservable_1.FromObservable(source, null).lift(new OnErrorResumeNextOperator(nextSources));
	}
	exports.onErrorResumeNextStatic = onErrorResumeNextStatic;
	var OnErrorResumeNextOperator = (function () {
	    function OnErrorResumeNextOperator(nextSources) {
	        this.nextSources = nextSources;
	    }
	    OnErrorResumeNextOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new OnErrorResumeNextSubscriber(subscriber, this.nextSources));
	    };
	    return OnErrorResumeNextOperator;
	}());
	var OnErrorResumeNextSubscriber = (function (_super) {
	    __extends(OnErrorResumeNextSubscriber, _super);
	    function OnErrorResumeNextSubscriber(destination, nextSources) {
	        _super.call(this, destination);
	        this.destination = destination;
	        this.nextSources = nextSources;
	    }
	    OnErrorResumeNextSubscriber.prototype.notifyError = function (error, innerSub) {
	        this.subscribeToNextSource();
	    };
	    OnErrorResumeNextSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.subscribeToNextSource();
	    };
	    OnErrorResumeNextSubscriber.prototype._error = function (err) {
	        this.subscribeToNextSource();
	    };
	    OnErrorResumeNextSubscriber.prototype._complete = function () {
	        this.subscribeToNextSource();
	    };
	    OnErrorResumeNextSubscriber.prototype.subscribeToNextSource = function () {
	        var next = this.nextSources.shift();
	        if (next) {
	            this.add(subscribeToResult_1.subscribeToResult(this, next));
	        }
	        else {
	            this.destination.complete();
	        }
	    };
	    return OnErrorResumeNextSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var pairs_1 = __webpack_require__(107);
	Observable_1.Observable.pairs = pairs_1.pairs;


/***/ },
/* 107 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var PairsObservable_1 = __webpack_require__(108);
	exports.pairs = PairsObservable_1.PairsObservable.create;


/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	function dispatch(state) {
	    var obj = state.obj, keys = state.keys, length = state.length, index = state.index, subscriber = state.subscriber;
	    if (index === length) {
	        subscriber.complete();
	        return;
	    }
	    var key = keys[index];
	    subscriber.next([key, obj[key]]);
	    state.index = index + 1;
	    this.schedule(state);
	}
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var PairsObservable = (function (_super) {
	    __extends(PairsObservable, _super);
	    function PairsObservable(obj, scheduler) {
	        _super.call(this);
	        this.obj = obj;
	        this.scheduler = scheduler;
	        this.keys = Object.keys(obj);
	    }
	    /**
	     * Convert an object into an observable sequence of [key, value] pairs
	     * using an optional Scheduler to enumerate the object.
	     *
	     * @example <caption>Converts a javascript object to an Observable</caption>
	     * var obj = {
	     *   foo: 42,
	     *   bar: 56,
	     *   baz: 78
	     * };
	     *
	     * var source = Rx.Observable.pairs(obj);
	     *
	     * var subscription = source.subscribe(
	     *   function (x) {
	     *     console.log('Next: %s', x);
	     *   },
	     *   function (err) {
	     *     console.log('Error: %s', err);
	     *   },
	     *   function () {
	     *     console.log('Completed');
	     *   });
	     *
	     * @param {Object} obj The object to inspect and turn into an
	     * Observable sequence.
	     * @param {Scheduler} [scheduler] An optional Scheduler to run the
	     * enumeration of the input sequence on.
	     * @returns {(Observable<Array<string | T>>)} An observable sequence of
	     * [key, value] pairs from the object.
	     */
	    PairsObservable.create = function (obj, scheduler) {
	        return new PairsObservable(obj, scheduler);
	    };
	    PairsObservable.prototype._subscribe = function (subscriber) {
	        var _a = this, keys = _a.keys, scheduler = _a.scheduler;
	        var length = keys.length;
	        if (scheduler) {
	            return scheduler.schedule(dispatch, 0, {
	                obj: this.obj, keys: keys, length: length, index: 0, subscriber: subscriber
	            });
	        }
	        else {
	            for (var idx = 0; idx < length; idx++) {
	                var key = keys[idx];
	                subscriber.next([key, this.obj[key]]);
	            }
	            subscriber.complete();
	        }
	    };
	    return PairsObservable;
	}(Observable_1.Observable));
	exports.PairsObservable = PairsObservable;


/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var range_1 = __webpack_require__(110);
	Observable_1.Observable.range = range_1.range;


/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var RangeObservable_1 = __webpack_require__(111);
	exports.range = RangeObservable_1.RangeObservable.create;


/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var RangeObservable = (function (_super) {
	    __extends(RangeObservable, _super);
	    function RangeObservable(start, count, scheduler) {
	        _super.call(this);
	        this.start = start;
	        this._count = count;
	        this.scheduler = scheduler;
	    }
	    /**
	     * Creates an Observable that emits a sequence of numbers within a specified
	     * range.
	     *
	     * <span class="informal">Emits a sequence of numbers in a range.</span>
	     *
	     * <img src="./img/range.png" width="100%">
	     *
	     * `range` operator emits a range of sequential integers, in order, where you
	     * select the `start` of the range and its `length`. By default, uses no
	     * Scheduler and just delivers the notifications synchronously, but may use
	     * an optional Scheduler to regulate those deliveries.
	     *
	     * @example <caption>Emits the numbers 1 to 10</caption>
	     * var numbers = Rx.Observable.range(1, 10);
	     * numbers.subscribe(x => console.log(x));
	     *
	     * @see {@link timer}
	     * @see {@link interval}
	     *
	     * @param {number} [start=0] The value of the first integer in the sequence.
	     * @param {number} [count=0] The number of sequential integers to generate.
	     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
	     * the emissions of the notifications.
	     * @return {Observable} An Observable of numbers that emits a finite range of
	     * sequential integers.
	     * @static true
	     * @name range
	     * @owner Observable
	     */
	    RangeObservable.create = function (start, count, scheduler) {
	        if (start === void 0) { start = 0; }
	        if (count === void 0) { count = 0; }
	        return new RangeObservable(start, count, scheduler);
	    };
	    RangeObservable.dispatch = function (state) {
	        var start = state.start, index = state.index, count = state.count, subscriber = state.subscriber;
	        if (index >= count) {
	            subscriber.complete();
	            return;
	        }
	        subscriber.next(start);
	        if (subscriber.closed) {
	            return;
	        }
	        state.index = index + 1;
	        state.start = start + 1;
	        this.schedule(state);
	    };
	    RangeObservable.prototype._subscribe = function (subscriber) {
	        var index = 0;
	        var start = this.start;
	        var count = this._count;
	        var scheduler = this.scheduler;
	        if (scheduler) {
	            return scheduler.schedule(RangeObservable.dispatch, 0, {
	                index: index, count: count, start: start, subscriber: subscriber
	            });
	        }
	        else {
	            do {
	                if (index++ >= count) {
	                    subscriber.complete();
	                    break;
	                }
	                subscriber.next(start++);
	                if (subscriber.closed) {
	                    break;
	                }
	            } while (true);
	        }
	    };
	    return RangeObservable;
	}(Observable_1.Observable));
	exports.RangeObservable = RangeObservable;


/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var using_1 = __webpack_require__(113);
	Observable_1.Observable.using = using_1.using;


/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var UsingObservable_1 = __webpack_require__(114);
	exports.using = UsingObservable_1.UsingObservable.create;


/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var UsingObservable = (function (_super) {
	    __extends(UsingObservable, _super);
	    function UsingObservable(resourceFactory, observableFactory) {
	        _super.call(this);
	        this.resourceFactory = resourceFactory;
	        this.observableFactory = observableFactory;
	    }
	    UsingObservable.create = function (resourceFactory, observableFactory) {
	        return new UsingObservable(resourceFactory, observableFactory);
	    };
	    UsingObservable.prototype._subscribe = function (subscriber) {
	        var _a = this, resourceFactory = _a.resourceFactory, observableFactory = _a.observableFactory;
	        var resource;
	        try {
	            resource = resourceFactory();
	            return new UsingSubscriber(subscriber, resource, observableFactory);
	        }
	        catch (err) {
	            subscriber.error(err);
	        }
	    };
	    return UsingObservable;
	}(Observable_1.Observable));
	exports.UsingObservable = UsingObservable;
	var UsingSubscriber = (function (_super) {
	    __extends(UsingSubscriber, _super);
	    function UsingSubscriber(destination, resource, observableFactory) {
	        _super.call(this, destination);
	        this.resource = resource;
	        this.observableFactory = observableFactory;
	        destination.add(resource);
	        this.tryUse();
	    }
	    UsingSubscriber.prototype.tryUse = function () {
	        try {
	            var source = this.observableFactory.call(this, this.resource);
	            if (source) {
	                this.add(subscribeToResult_1.subscribeToResult(this, source));
	            }
	        }
	        catch (err) {
	            this._error(err);
	        }
	    };
	    return UsingSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var throw_1 = __webpack_require__(116);
	Observable_1.Observable.throw = throw_1._throw;


/***/ },
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ErrorObservable_1 = __webpack_require__(117);
	exports._throw = ErrorObservable_1.ErrorObservable.create;


/***/ },
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var ErrorObservable = (function (_super) {
	    __extends(ErrorObservable, _super);
	    function ErrorObservable(error, scheduler) {
	        _super.call(this);
	        this.error = error;
	        this.scheduler = scheduler;
	    }
	    /**
	     * Creates an Observable that emits no items to the Observer and immediately
	     * emits an error notification.
	     *
	     * <span class="informal">Just emits 'error', and nothing else.
	     * </span>
	     *
	     * <img src="./img/throw.png" width="100%">
	     *
	     * This static operator is useful for creating a simple Observable that only
	     * emits the error notification. It can be used for composing with other
	     * Observables, such as in a {@link mergeMap}.
	     *
	     * @example <caption>Emit the number 7, then emit an error.</caption>
	     * var result = Rx.Observable.throw(new Error('oops!')).startWith(7);
	     * result.subscribe(x => console.log(x), e => console.error(e));
	     *
	     * @example <caption>Map and flattens numbers to the sequence 'a', 'b', 'c', but throw an error for 13</caption>
	     * var interval = Rx.Observable.interval(1000);
	     * var result = interval.mergeMap(x =>
	     *   x === 13 ?
	     *     Rx.Observable.throw('Thirteens are bad') :
	     *     Rx.Observable.of('a', 'b', 'c')
	     * );
	     * result.subscribe(x => console.log(x), e => console.error(e));
	     *
	     * @see {@link create}
	     * @see {@link empty}
	     * @see {@link never}
	     * @see {@link of}
	     *
	     * @param {any} error The particular Error to pass to the error notification.
	     * @param {Scheduler} [scheduler] A {@link Scheduler} to use for scheduling
	     * the emission of the error notification.
	     * @return {Observable} An error Observable: emits only the error notification
	     * using the given error argument.
	     * @static true
	     * @name throw
	     * @owner Observable
	     */
	    ErrorObservable.create = function (error, scheduler) {
	        return new ErrorObservable(error, scheduler);
	    };
	    ErrorObservable.dispatch = function (arg) {
	        var error = arg.error, subscriber = arg.subscriber;
	        subscriber.error(error);
	    };
	    ErrorObservable.prototype._subscribe = function (subscriber) {
	        var error = this.error;
	        var scheduler = this.scheduler;
	        if (scheduler) {
	            return scheduler.schedule(ErrorObservable.dispatch, 0, {
	                error: error, subscriber: subscriber
	            });
	        }
	        else {
	            subscriber.error(error);
	        }
	    };
	    return ErrorObservable;
	}(Observable_1.Observable));
	exports.ErrorObservable = ErrorObservable;


/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var timer_1 = __webpack_require__(119);
	Observable_1.Observable.timer = timer_1.timer;


/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var TimerObservable_1 = __webpack_require__(120);
	exports.timer = TimerObservable_1.TimerObservable.create;


/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var isNumeric_1 = __webpack_require__(87);
	var Observable_1 = __webpack_require__(16);
	var async_1 = __webpack_require__(88);
	var isScheduler_1 = __webpack_require__(41);
	var isDate_1 = __webpack_require__(121);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var TimerObservable = (function (_super) {
	    __extends(TimerObservable, _super);
	    function TimerObservable(dueTime, period, scheduler) {
	        if (dueTime === void 0) { dueTime = 0; }
	        _super.call(this);
	        this.period = -1;
	        this.dueTime = 0;
	        if (isNumeric_1.isNumeric(period)) {
	            this.period = Number(period) < 1 && 1 || Number(period);
	        }
	        else if (isScheduler_1.isScheduler(period)) {
	            scheduler = period;
	        }
	        if (!isScheduler_1.isScheduler(scheduler)) {
	            scheduler = async_1.async;
	        }
	        this.scheduler = scheduler;
	        this.dueTime = isDate_1.isDate(dueTime) ?
	            (+dueTime - this.scheduler.now()) :
	            dueTime;
	    }
	    /**
	     * Creates an Observable that starts emitting after an `initialDelay` and
	     * emits ever increasing numbers after each `period` of time thereafter.
	     *
	     * <span class="informal">Its like {@link interval}, but you can specify when
	     * should the emissions start.</span>
	     *
	     * <img src="./img/timer.png" width="100%">
	     *
	     * `timer` returns an Observable that emits an infinite sequence of ascending
	     * integers, with a constant interval of time, `period` of your choosing
	     * between those emissions. The first emission happens after the specified
	     * `initialDelay`. The initial delay may be a {@link Date}. By default, this
	     * operator uses the `async` Scheduler to provide a notion of time, but you
	     * may pass any Scheduler to it. If `period` is not specified, the output
	     * Observable emits only one value, `0`. Otherwise, it emits an infinite
	     * sequence.
	     *
	     * @example <caption>Emits ascending numbers, one every second (1000ms), starting after 3 seconds</caption>
	     * var numbers = Rx.Observable.timer(3000, 1000);
	     * numbers.subscribe(x => console.log(x));
	     *
	     * @example <caption>Emits one number after five seconds</caption>
	     * var numbers = Rx.Observable.timer(5000);
	     * numbers.subscribe(x => console.log(x));
	     *
	     * @see {@link interval}
	     * @see {@link delay}
	     *
	     * @param {number|Date} initialDelay The initial delay time to wait before
	     * emitting the first value of `0`.
	     * @param {number} [period] The period of time between emissions of the
	     * subsequent numbers.
	     * @param {Scheduler} [scheduler=async] The Scheduler to use for scheduling
	     * the emission of values, and providing a notion of "time".
	     * @return {Observable} An Observable that emits a `0` after the
	     * `initialDelay` and ever increasing numbers after each `period` of time
	     * thereafter.
	     * @static true
	     * @name timer
	     * @owner Observable
	     */
	    TimerObservable.create = function (initialDelay, period, scheduler) {
	        if (initialDelay === void 0) { initialDelay = 0; }
	        return new TimerObservable(initialDelay, period, scheduler);
	    };
	    TimerObservable.dispatch = function (state) {
	        var index = state.index, period = state.period, subscriber = state.subscriber;
	        var action = this;
	        subscriber.next(index);
	        if (subscriber.closed) {
	            return;
	        }
	        else if (period === -1) {
	            return subscriber.complete();
	        }
	        state.index = index + 1;
	        action.schedule(state, period);
	    };
	    TimerObservable.prototype._subscribe = function (subscriber) {
	        var index = 0;
	        var _a = this, period = _a.period, dueTime = _a.dueTime, scheduler = _a.scheduler;
	        return scheduler.schedule(TimerObservable.dispatch, dueTime, {
	            index: index, period: period, subscriber: subscriber
	        });
	    };
	    return TimerObservable;
	}(Observable_1.Observable));
	exports.TimerObservable = TimerObservable;


/***/ },
/* 121 */
/***/ function(module, exports) {

	"use strict";
	function isDate(value) {
	    return value instanceof Date && !isNaN(+value);
	}
	exports.isDate = isDate;


/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var zip_1 = __webpack_require__(123);
	Observable_1.Observable.zip = zip_1.zip;


/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var zip_1 = __webpack_require__(124);
	exports.zip = zip_1.zipStatic;


/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var ArrayObservable_1 = __webpack_require__(42);
	var isArray_1 = __webpack_require__(22);
	var Subscriber_1 = __webpack_require__(19);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	var iterator_1 = __webpack_require__(49);
	/**
	 * @param observables
	 * @return {Observable<R>}
	 * @method zip
	 * @owner Observable
	 */
	function zipProto() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    observables.unshift(this);
	    return zipStatic.apply(this, observables);
	}
	exports.zipProto = zipProto;
	/* tslint:enable:max-line-length */
	/**
	 * @param observables
	 * @return {Observable<R>}
	 * @static true
	 * @name zip
	 * @owner Observable
	 */
	function zipStatic() {
	    var observables = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        observables[_i - 0] = arguments[_i];
	    }
	    var project = observables[observables.length - 1];
	    if (typeof project === 'function') {
	        observables.pop();
	    }
	    return new ArrayObservable_1.ArrayObservable(observables).lift(new ZipOperator(project));
	}
	exports.zipStatic = zipStatic;
	var ZipOperator = (function () {
	    function ZipOperator(project) {
	        this.project = project;
	    }
	    ZipOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ZipSubscriber(subscriber, this.project));
	    };
	    return ZipOperator;
	}());
	exports.ZipOperator = ZipOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ZipSubscriber = (function (_super) {
	    __extends(ZipSubscriber, _super);
	    function ZipSubscriber(destination, project, values) {
	        if (values === void 0) { values = Object.create(null); }
	        _super.call(this, destination);
	        this.index = 0;
	        this.iterators = [];
	        this.active = 0;
	        this.project = (typeof project === 'function') ? project : null;
	        this.values = values;
	    }
	    ZipSubscriber.prototype._next = function (value) {
	        var iterators = this.iterators;
	        var index = this.index++;
	        if (isArray_1.isArray(value)) {
	            iterators.push(new StaticArrayIterator(value));
	        }
	        else if (typeof value[iterator_1.$$iterator] === 'function') {
	            iterators.push(new StaticIterator(value[iterator_1.$$iterator]()));
	        }
	        else {
	            iterators.push(new ZipBufferIterator(this.destination, this, value, index));
	        }
	    };
	    ZipSubscriber.prototype._complete = function () {
	        var iterators = this.iterators;
	        var len = iterators.length;
	        this.active = len;
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            if (iterator.stillUnsubscribed) {
	                this.add(iterator.subscribe(iterator, i));
	            }
	            else {
	                this.active--; // not an observable
	            }
	        }
	    };
	    ZipSubscriber.prototype.notifyInactive = function () {
	        this.active--;
	        if (this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    ZipSubscriber.prototype.checkIterators = function () {
	        var iterators = this.iterators;
	        var len = iterators.length;
	        var destination = this.destination;
	        // abort if not all of them have values
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
	                return;
	            }
	        }
	        var shouldComplete = false;
	        var args = [];
	        for (var i = 0; i < len; i++) {
	            var iterator = iterators[i];
	            var result = iterator.next();
	            // check to see if it's completed now that you've gotten
	            // the next value.
	            if (iterator.hasCompleted()) {
	                shouldComplete = true;
	            }
	            if (result.done) {
	                destination.complete();
	                return;
	            }
	            args.push(result.value);
	        }
	        if (this.project) {
	            this._tryProject(args);
	        }
	        else {
	            destination.next(args);
	        }
	        if (shouldComplete) {
	            destination.complete();
	        }
	    };
	    ZipSubscriber.prototype._tryProject = function (args) {
	        var result;
	        try {
	            result = this.project.apply(this, args);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return ZipSubscriber;
	}(Subscriber_1.Subscriber));
	exports.ZipSubscriber = ZipSubscriber;
	var StaticIterator = (function () {
	    function StaticIterator(iterator) {
	        this.iterator = iterator;
	        this.nextResult = iterator.next();
	    }
	    StaticIterator.prototype.hasValue = function () {
	        return true;
	    };
	    StaticIterator.prototype.next = function () {
	        var result = this.nextResult;
	        this.nextResult = this.iterator.next();
	        return result;
	    };
	    StaticIterator.prototype.hasCompleted = function () {
	        var nextResult = this.nextResult;
	        return nextResult && nextResult.done;
	    };
	    return StaticIterator;
	}());
	var StaticArrayIterator = (function () {
	    function StaticArrayIterator(array) {
	        this.array = array;
	        this.index = 0;
	        this.length = 0;
	        this.length = array.length;
	    }
	    StaticArrayIterator.prototype[iterator_1.$$iterator] = function () {
	        return this;
	    };
	    StaticArrayIterator.prototype.next = function (value) {
	        var i = this.index++;
	        var array = this.array;
	        return i < this.length ? { value: array[i], done: false } : { value: null, done: true };
	    };
	    StaticArrayIterator.prototype.hasValue = function () {
	        return this.array.length > this.index;
	    };
	    StaticArrayIterator.prototype.hasCompleted = function () {
	        return this.array.length === this.index;
	    };
	    return StaticArrayIterator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ZipBufferIterator = (function (_super) {
	    __extends(ZipBufferIterator, _super);
	    function ZipBufferIterator(destination, parent, observable, index) {
	        _super.call(this, destination);
	        this.parent = parent;
	        this.observable = observable;
	        this.index = index;
	        this.stillUnsubscribed = true;
	        this.buffer = [];
	        this.isComplete = false;
	    }
	    ZipBufferIterator.prototype[iterator_1.$$iterator] = function () {
	        return this;
	    };
	    // NOTE: there is actually a name collision here with Subscriber.next and Iterator.next
	    //    this is legit because `next()` will never be called by a subscription in this case.
	    ZipBufferIterator.prototype.next = function () {
	        var buffer = this.buffer;
	        if (buffer.length === 0 && this.isComplete) {
	            return { value: null, done: true };
	        }
	        else {
	            return { value: buffer.shift(), done: false };
	        }
	    };
	    ZipBufferIterator.prototype.hasValue = function () {
	        return this.buffer.length > 0;
	    };
	    ZipBufferIterator.prototype.hasCompleted = function () {
	        return this.buffer.length === 0 && this.isComplete;
	    };
	    ZipBufferIterator.prototype.notifyComplete = function () {
	        if (this.buffer.length > 0) {
	            this.isComplete = true;
	            this.parent.notifyInactive();
	        }
	        else {
	            this.destination.complete();
	        }
	    };
	    ZipBufferIterator.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.buffer.push(innerValue);
	        this.parent.checkIterators();
	    };
	    ZipBufferIterator.prototype.subscribe = function (value, index) {
	        return subscribeToResult_1.subscribeToResult(this, this.observable, this, index);
	    };
	    return ZipBufferIterator;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var ajax_1 = __webpack_require__(126);
	Observable_1.Observable.ajax = ajax_1.ajax;


/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var AjaxObservable_1 = __webpack_require__(127);
	exports.ajax = AjaxObservable_1.AjaxObservable.create;


/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var root_1 = __webpack_require__(17);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var Observable_1 = __webpack_require__(16);
	var Subscriber_1 = __webpack_require__(19);
	var map_1 = __webpack_require__(128);
	function getCORSRequest() {
	    if (root_1.root.XMLHttpRequest) {
	        var xhr = new root_1.root.XMLHttpRequest();
	        if ('withCredentials' in xhr) {
	            xhr.withCredentials = !!this.withCredentials;
	        }
	        return xhr;
	    }
	    else if (!!root_1.root.XDomainRequest) {
	        return new root_1.root.XDomainRequest();
	    }
	    else {
	        throw new Error('CORS is not supported by your browser');
	    }
	}
	function getXMLHttpRequest() {
	    if (root_1.root.XMLHttpRequest) {
	        return new root_1.root.XMLHttpRequest();
	    }
	    else {
	        var progId = void 0;
	        try {
	            var progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
	            for (var i = 0; i < 3; i++) {
	                try {
	                    progId = progIds[i];
	                    if (new root_1.root.ActiveXObject(progId)) {
	                        break;
	                    }
	                }
	                catch (e) {
	                }
	            }
	            return new root_1.root.ActiveXObject(progId);
	        }
	        catch (e) {
	            throw new Error('XMLHttpRequest is not supported by your browser');
	        }
	    }
	}
	function ajaxGet(url, headers) {
	    if (headers === void 0) { headers = null; }
	    return new AjaxObservable({ method: 'GET', url: url, headers: headers });
	}
	exports.ajaxGet = ajaxGet;
	;
	function ajaxPost(url, body, headers) {
	    return new AjaxObservable({ method: 'POST', url: url, body: body, headers: headers });
	}
	exports.ajaxPost = ajaxPost;
	;
	function ajaxDelete(url, headers) {
	    return new AjaxObservable({ method: 'DELETE', url: url, headers: headers });
	}
	exports.ajaxDelete = ajaxDelete;
	;
	function ajaxPut(url, body, headers) {
	    return new AjaxObservable({ method: 'PUT', url: url, body: body, headers: headers });
	}
	exports.ajaxPut = ajaxPut;
	;
	function ajaxGetJSON(url, headers) {
	    return new AjaxObservable({ method: 'GET', url: url, responseType: 'json', headers: headers })
	        .lift(new map_1.MapOperator(function (x, index) { return x.response; }, null));
	}
	exports.ajaxGetJSON = ajaxGetJSON;
	;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var AjaxObservable = (function (_super) {
	    __extends(AjaxObservable, _super);
	    function AjaxObservable(urlOrRequest) {
	        _super.call(this);
	        var request = {
	            async: true,
	            createXHR: function () {
	                return this.crossDomain ? getCORSRequest.call(this) : getXMLHttpRequest();
	            },
	            crossDomain: false,
	            withCredentials: false,
	            headers: {},
	            method: 'GET',
	            responseType: 'json',
	            timeout: 0
	        };
	        if (typeof urlOrRequest === 'string') {
	            request.url = urlOrRequest;
	        }
	        else {
	            for (var prop in urlOrRequest) {
	                if (urlOrRequest.hasOwnProperty(prop)) {
	                    request[prop] = urlOrRequest[prop];
	                }
	            }
	        }
	        this.request = request;
	    }
	    AjaxObservable.prototype._subscribe = function (subscriber) {
	        return new AjaxSubscriber(subscriber, this.request);
	    };
	    /**
	     * Creates an observable for an Ajax request with either a request object with
	     * url, headers, etc or a string for a URL.
	     *
	     * @example
	     * source = Rx.Observable.ajax('/products');
	     * source = Rx.Observable.ajax({ url: 'products', method: 'GET' });
	     *
	     * @param {string|Object} request Can be one of the following:
	     *   A string of the URL to make the Ajax call.
	     *   An object with the following properties
	     *   - url: URL of the request
	     *   - body: The body of the request
	     *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
	     *   - async: Whether the request is async
	     *   - headers: Optional headers
	     *   - crossDomain: true if a cross domain request, else false
	     *   - createXHR: a function to override if you need to use an alternate
	     *   XMLHttpRequest implementation.
	     *   - resultSelector: a function to use to alter the output value type of
	     *   the Observable. Gets {@link AjaxResponse} as an argument.
	     * @return {Observable} An observable sequence containing the XMLHttpRequest.
	     * @static true
	     * @name ajax
	     * @owner Observable
	    */
	    AjaxObservable.create = (function () {
	        var create = function (urlOrRequest) {
	            return new AjaxObservable(urlOrRequest);
	        };
	        create.get = ajaxGet;
	        create.post = ajaxPost;
	        create.delete = ajaxDelete;
	        create.put = ajaxPut;
	        create.getJSON = ajaxGetJSON;
	        return create;
	    })();
	    return AjaxObservable;
	}(Observable_1.Observable));
	exports.AjaxObservable = AjaxObservable;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var AjaxSubscriber = (function (_super) {
	    __extends(AjaxSubscriber, _super);
	    function AjaxSubscriber(destination, request) {
	        _super.call(this, destination);
	        this.request = request;
	        this.done = false;
	        var headers = request.headers = request.headers || {};
	        // force CORS if requested
	        if (!request.crossDomain && !headers['X-Requested-With']) {
	            headers['X-Requested-With'] = 'XMLHttpRequest';
	        }
	        // ensure content type is set
	        if (!('Content-Type' in headers) && !(root_1.root.FormData && request.body instanceof root_1.root.FormData) && typeof request.body !== 'undefined') {
	            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
	        }
	        // properly serialize body
	        request.body = this.serializeBody(request.body, request.headers['Content-Type']);
	        this.send();
	    }
	    AjaxSubscriber.prototype.next = function (e) {
	        this.done = true;
	        var _a = this, xhr = _a.xhr, request = _a.request, destination = _a.destination;
	        var response = new AjaxResponse(e, xhr, request);
	        destination.next(response);
	    };
	    AjaxSubscriber.prototype.send = function () {
	        var _a = this, request = _a.request, _b = _a.request, user = _b.user, method = _b.method, url = _b.url, async = _b.async, password = _b.password, headers = _b.headers, body = _b.body;
	        var createXHR = request.createXHR;
	        var xhr = tryCatch_1.tryCatch(createXHR).call(request);
	        if (xhr === errorObject_1.errorObject) {
	            this.error(errorObject_1.errorObject.e);
	        }
	        else {
	            this.xhr = xhr;
	            // open XHR first
	            var result = void 0;
	            if (user) {
	                result = tryCatch_1.tryCatch(xhr.open).call(xhr, method, url, async, user, password);
	            }
	            else {
	                result = tryCatch_1.tryCatch(xhr.open).call(xhr, method, url, async);
	            }
	            if (result === errorObject_1.errorObject) {
	                this.error(errorObject_1.errorObject.e);
	                return null;
	            }
	            // timeout and responseType can be set once the XHR is open
	            xhr.timeout = request.timeout;
	            xhr.responseType = request.responseType;
	            // set headers
	            this.setHeaders(xhr, headers);
	            // now set up the events
	            this.setupEvents(xhr, request);
	            // finally send the request
	            if (body) {
	                xhr.send(body);
	            }
	            else {
	                xhr.send();
	            }
	        }
	        return xhr;
	    };
	    AjaxSubscriber.prototype.serializeBody = function (body, contentType) {
	        if (!body || typeof body === 'string') {
	            return body;
	        }
	        else if (root_1.root.FormData && body instanceof root_1.root.FormData) {
	            return body;
	        }
	        if (contentType) {
	            var splitIndex = contentType.indexOf(';');
	            if (splitIndex !== -1) {
	                contentType = contentType.substring(0, splitIndex);
	            }
	        }
	        switch (contentType) {
	            case 'application/x-www-form-urlencoded':
	                return Object.keys(body).map(function (key) { return (encodeURI(key) + "=" + encodeURI(body[key])); }).join('&');
	            case 'application/json':
	                return JSON.stringify(body);
	            default:
	                return body;
	        }
	    };
	    AjaxSubscriber.prototype.setHeaders = function (xhr, headers) {
	        for (var key in headers) {
	            if (headers.hasOwnProperty(key)) {
	                xhr.setRequestHeader(key, headers[key]);
	            }
	        }
	    };
	    AjaxSubscriber.prototype.setupEvents = function (xhr, request) {
	        var progressSubscriber = request.progressSubscriber;
	        xhr.ontimeout = function xhrTimeout(e) {
	            var _a = xhrTimeout, subscriber = _a.subscriber, progressSubscriber = _a.progressSubscriber, request = _a.request;
	            if (progressSubscriber) {
	                progressSubscriber.error(e);
	            }
	            subscriber.error(new AjaxTimeoutError(this, request)); //TODO: Make betterer.
	        };
	        xhr.ontimeout.request = request;
	        xhr.ontimeout.subscriber = this;
	        xhr.ontimeout.progressSubscriber = progressSubscriber;
	        if (xhr.upload && 'withCredentials' in xhr && root_1.root.XDomainRequest) {
	            if (progressSubscriber) {
	                xhr.onprogress = function xhrProgress(e) {
	                    var progressSubscriber = xhrProgress.progressSubscriber;
	                    progressSubscriber.next(e);
	                };
	                xhr.onprogress.progressSubscriber = progressSubscriber;
	            }
	            xhr.onerror = function xhrError(e) {
	                var _a = xhrError, progressSubscriber = _a.progressSubscriber, subscriber = _a.subscriber, request = _a.request;
	                if (progressSubscriber) {
	                    progressSubscriber.error(e);
	                }
	                subscriber.error(new AjaxError('ajax error', this, request));
	            };
	            xhr.onerror.request = request;
	            xhr.onerror.subscriber = this;
	            xhr.onerror.progressSubscriber = progressSubscriber;
	        }
	        xhr.onreadystatechange = function xhrReadyStateChange(e) {
	            var _a = xhrReadyStateChange, subscriber = _a.subscriber, progressSubscriber = _a.progressSubscriber, request = _a.request;
	            if (this.readyState === 4) {
	                // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
	                var status_1 = this.status === 1223 ? 204 : this.status;
	                var response = (this.responseType === 'text' ? (this.response || this.responseText) : this.response);
	                // fix status code when it is 0 (0 status is undocumented).
	                // Occurs when accessing file resources or on Android 4.1 stock browser
	                // while retrieving files from application cache.
	                if (status_1 === 0) {
	                    status_1 = response ? 200 : 0;
	                }
	                if (200 <= status_1 && status_1 < 300) {
	                    if (progressSubscriber) {
	                        progressSubscriber.complete();
	                    }
	                    subscriber.next(e);
	                    subscriber.complete();
	                }
	                else {
	                    if (progressSubscriber) {
	                        progressSubscriber.error(e);
	                    }
	                    subscriber.error(new AjaxError('ajax error ' + status_1, this, request));
	                }
	            }
	        };
	        xhr.onreadystatechange.subscriber = this;
	        xhr.onreadystatechange.progressSubscriber = progressSubscriber;
	        xhr.onreadystatechange.request = request;
	    };
	    AjaxSubscriber.prototype.unsubscribe = function () {
	        var _a = this, done = _a.done, xhr = _a.xhr;
	        if (!done && xhr && xhr.readyState !== 4) {
	            xhr.abort();
	        }
	        _super.prototype.unsubscribe.call(this);
	    };
	    return AjaxSubscriber;
	}(Subscriber_1.Subscriber));
	exports.AjaxSubscriber = AjaxSubscriber;
	/**
	 * A normalized AJAX response.
	 *
	 * @see {@link ajax}
	 *
	 * @class AjaxResponse
	 */
	var AjaxResponse = (function () {
	    function AjaxResponse(originalEvent, xhr, request) {
	        this.originalEvent = originalEvent;
	        this.xhr = xhr;
	        this.request = request;
	        this.status = xhr.status;
	        this.responseType = xhr.responseType || request.responseType;
	        switch (this.responseType) {
	            case 'json':
	                if ('response' in xhr) {
	                    //IE does not support json as responseType, parse it internally
	                    this.response = xhr.responseType ? xhr.response : JSON.parse(xhr.response || xhr.responseText || 'null');
	                }
	                else {
	                    this.response = JSON.parse(xhr.responseText || 'null');
	                }
	                break;
	            case 'xml':
	                this.response = xhr.responseXML;
	                break;
	            case 'text':
	            default:
	                this.response = ('response' in xhr) ? xhr.response : xhr.responseText;
	                break;
	        }
	    }
	    return AjaxResponse;
	}());
	exports.AjaxResponse = AjaxResponse;
	/**
	 * A normalized AJAX error.
	 *
	 * @see {@link ajax}
	 *
	 * @class AjaxError
	 */
	var AjaxError = (function (_super) {
	    __extends(AjaxError, _super);
	    function AjaxError(message, xhr, request) {
	        _super.call(this, message);
	        this.message = message;
	        this.xhr = xhr;
	        this.request = request;
	        this.status = xhr.status;
	    }
	    return AjaxError;
	}(Error));
	exports.AjaxError = AjaxError;
	/**
	 * @see {@link ajax}
	 *
	 * @class AjaxTimeoutError
	 */
	var AjaxTimeoutError = (function (_super) {
	    __extends(AjaxTimeoutError, _super);
	    function AjaxTimeoutError(xhr, request) {
	        _super.call(this, 'ajax timeout', xhr, request);
	    }
	    return AjaxTimeoutError;
	}(AjaxError));
	exports.AjaxTimeoutError = AjaxTimeoutError;


/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Applies a given `project` function to each value emitted by the source
	 * Observable, and emits the resulting values as an Observable.
	 *
	 * <span class="informal">Like [Array.prototype.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map),
	 * it passes each source value through a transformation function to get
	 * corresponding output values.</span>
	 *
	 * <img src="./img/map.png" width="100%">
	 *
	 * Similar to the well known `Array.prototype.map` function, this operator
	 * applies a projection to each value and emits that projection in the output
	 * Observable.
	 *
	 * @example <caption>Map every every click to the clientX position of that click</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var positions = clicks.map(ev => ev.clientX);
	 * positions.subscribe(x => console.log(x));
	 *
	 * @see {@link mapTo}
	 * @see {@link pluck}
	 *
	 * @param {function(value: T, index: number): R} project The function to apply
	 * to each `value` emitted by the source Observable. The `index` parameter is
	 * the number `i` for the i-th emission that has happened since the
	 * subscription, starting from the number `0`.
	 * @param {any} [thisArg] An optional argument to define what `this` is in the
	 * `project` function.
	 * @return {Observable<R>} An Observable that emits the values from the source
	 * Observable transformed by the given `project` function.
	 * @method map
	 * @owner Observable
	 */
	function map(project, thisArg) {
	    if (typeof project !== 'function') {
	        throw new TypeError('argument is not a function. Are you looking for `mapTo()`?');
	    }
	    return this.lift(new MapOperator(project, thisArg));
	}
	exports.map = map;
	var MapOperator = (function () {
	    function MapOperator(project, thisArg) {
	        this.project = project;
	        this.thisArg = thisArg;
	    }
	    MapOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new MapSubscriber(subscriber, this.project, this.thisArg));
	    };
	    return MapOperator;
	}());
	exports.MapOperator = MapOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MapSubscriber = (function (_super) {
	    __extends(MapSubscriber, _super);
	    function MapSubscriber(destination, project, thisArg) {
	        _super.call(this, destination);
	        this.project = project;
	        this.count = 0;
	        this.thisArg = thisArg || this;
	    }
	    // NOTE: This looks unoptimized, but it's actually purposefully NOT
	    // using try/catch optimizations.
	    MapSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.project.call(this.thisArg, value, this.count++);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return MapSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var webSocket_1 = __webpack_require__(130);
	Observable_1.Observable.webSocket = webSocket_1.webSocket;


/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var WebSocketSubject_1 = __webpack_require__(131);
	exports.webSocket = WebSocketSubject_1.WebSocketSubject.create;


/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var Subscriber_1 = __webpack_require__(19);
	var Observable_1 = __webpack_require__(16);
	var Subscription_1 = __webpack_require__(21);
	var root_1 = __webpack_require__(17);
	var ReplaySubject_1 = __webpack_require__(132);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var assign_1 = __webpack_require__(136);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var WebSocketSubject = (function (_super) {
	    __extends(WebSocketSubject, _super);
	    function WebSocketSubject(urlConfigOrSource, destination) {
	        if (urlConfigOrSource instanceof Observable_1.Observable) {
	            _super.call(this, destination, urlConfigOrSource);
	        }
	        else {
	            _super.call(this);
	            this.WebSocketCtor = root_1.root.WebSocket;
	            this._output = new Subject_1.Subject();
	            if (typeof urlConfigOrSource === 'string') {
	                this.url = urlConfigOrSource;
	            }
	            else {
	                // WARNING: config object could override important members here.
	                assign_1.assign(this, urlConfigOrSource);
	            }
	            if (!this.WebSocketCtor) {
	                throw new Error('no WebSocket constructor can be found');
	            }
	            this.destination = new ReplaySubject_1.ReplaySubject();
	        }
	    }
	    WebSocketSubject.prototype.resultSelector = function (e) {
	        return JSON.parse(e.data);
	    };
	    /**
	     * @param urlConfigOrSource
	     * @return {WebSocketSubject}
	     * @static true
	     * @name webSocket
	     * @owner Observable
	     */
	    WebSocketSubject.create = function (urlConfigOrSource) {
	        return new WebSocketSubject(urlConfigOrSource);
	    };
	    WebSocketSubject.prototype.lift = function (operator) {
	        var sock = new WebSocketSubject(this, this.destination);
	        sock.operator = operator;
	        return sock;
	    };
	    // TODO: factor this out to be a proper Operator/Subscriber implementation and eliminate closures
	    WebSocketSubject.prototype.multiplex = function (subMsg, unsubMsg, messageFilter) {
	        var self = this;
	        return new Observable_1.Observable(function (observer) {
	            var result = tryCatch_1.tryCatch(subMsg)();
	            if (result === errorObject_1.errorObject) {
	                observer.error(errorObject_1.errorObject.e);
	            }
	            else {
	                self.next(result);
	            }
	            var subscription = self.subscribe(function (x) {
	                var result = tryCatch_1.tryCatch(messageFilter)(x);
	                if (result === errorObject_1.errorObject) {
	                    observer.error(errorObject_1.errorObject.e);
	                }
	                else if (result) {
	                    observer.next(x);
	                }
	            }, function (err) { return observer.error(err); }, function () { return observer.complete(); });
	            return function () {
	                var result = tryCatch_1.tryCatch(unsubMsg)();
	                if (result === errorObject_1.errorObject) {
	                    observer.error(errorObject_1.errorObject.e);
	                }
	                else {
	                    self.next(result);
	                }
	                subscription.unsubscribe();
	            };
	        });
	    };
	    WebSocketSubject.prototype._connectSocket = function () {
	        var _this = this;
	        var WebSocketCtor = this.WebSocketCtor;
	        var observer = this._output;
	        var socket = null;
	        try {
	            socket = this.protocol ?
	                new WebSocketCtor(this.url, this.protocol) :
	                new WebSocketCtor(this.url);
	            this.socket = socket;
	        }
	        catch (e) {
	            observer.error(e);
	            return;
	        }
	        var subscription = new Subscription_1.Subscription(function () {
	            _this.socket = null;
	            if (socket && socket.readyState === 1) {
	                socket.close();
	            }
	        });
	        socket.onopen = function (e) {
	            var openObserver = _this.openObserver;
	            if (openObserver) {
	                openObserver.next(e);
	            }
	            var queue = _this.destination;
	            _this.destination = Subscriber_1.Subscriber.create(function (x) { return socket.readyState === 1 && socket.send(x); }, function (e) {
	                var closingObserver = _this.closingObserver;
	                if (closingObserver) {
	                    closingObserver.next(undefined);
	                }
	                if (e && e.code) {
	                    socket.close(e.code, e.reason);
	                }
	                else {
	                    observer.error(new TypeError('WebSocketSubject.error must be called with an object with an error code, ' +
	                        'and an optional reason: { code: number, reason: string }'));
	                }
	                _this.destination = new ReplaySubject_1.ReplaySubject();
	                _this.socket = null;
	            }, function () {
	                var closingObserver = _this.closingObserver;
	                if (closingObserver) {
	                    closingObserver.next(undefined);
	                }
	                socket.close();
	                _this.destination = new ReplaySubject_1.ReplaySubject();
	                _this.socket = null;
	            });
	            if (queue && queue instanceof ReplaySubject_1.ReplaySubject) {
	                subscription.add(queue.subscribe(_this.destination));
	            }
	        };
	        socket.onerror = function (e) { return observer.error(e); };
	        socket.onclose = function (e) {
	            var closeObserver = _this.closeObserver;
	            if (closeObserver) {
	                closeObserver.next(e);
	            }
	            if (e.wasClean) {
	                observer.complete();
	            }
	            else {
	                observer.error(e);
	            }
	        };
	        socket.onmessage = function (e) {
	            var result = tryCatch_1.tryCatch(_this.resultSelector)(e);
	            if (result === errorObject_1.errorObject) {
	                observer.error(errorObject_1.errorObject.e);
	            }
	            else {
	                observer.next(result);
	            }
	        };
	    };
	    WebSocketSubject.prototype._subscribe = function (subscriber) {
	        var _this = this;
	        var source = this.source;
	        if (source) {
	            return source.subscribe(subscriber);
	        }
	        if (!this.socket) {
	            this._connectSocket();
	        }
	        var subscription = new Subscription_1.Subscription();
	        subscription.add(this._output.subscribe(subscriber));
	        subscription.add(function () {
	            var socket = _this.socket;
	            if (_this._output.observers.length === 0 && socket && socket.readyState === 1) {
	                socket.close();
	                _this.socket = null;
	            }
	        });
	        return subscription;
	    };
	    WebSocketSubject.prototype.unsubscribe = function () {
	        var _a = this, source = _a.source, socket = _a.socket;
	        if (socket && socket.readyState === 1) {
	            socket.close();
	            this.socket = null;
	        }
	        _super.prototype.unsubscribe.call(this);
	        if (!source) {
	            this.destination = new ReplaySubject_1.ReplaySubject();
	        }
	    };
	    return WebSocketSubject;
	}(Subject_1.AnonymousSubject));
	exports.WebSocketSubject = WebSocketSubject;


/***/ },
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var queue_1 = __webpack_require__(133);
	var observeOn_1 = __webpack_require__(69);
	/**
	 * @class ReplaySubject<T>
	 */
	var ReplaySubject = (function (_super) {
	    __extends(ReplaySubject, _super);
	    function ReplaySubject(bufferSize, windowTime, scheduler) {
	        if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
	        if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
	        _super.call(this);
	        this.scheduler = scheduler;
	        this._events = [];
	        this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
	        this._windowTime = windowTime < 1 ? 1 : windowTime;
	    }
	    ReplaySubject.prototype.next = function (value) {
	        var now = this._getNow();
	        this._events.push(new ReplayEvent(now, value));
	        this._trimBufferThenGetEvents();
	        _super.prototype.next.call(this, value);
	    };
	    ReplaySubject.prototype._subscribe = function (subscriber) {
	        var _events = this._trimBufferThenGetEvents();
	        var scheduler = this.scheduler;
	        if (scheduler) {
	            subscriber.add(subscriber = new observeOn_1.ObserveOnSubscriber(subscriber, scheduler));
	        }
	        var len = _events.length;
	        for (var i = 0; i < len && !subscriber.closed; i++) {
	            subscriber.next(_events[i].value);
	        }
	        return _super.prototype._subscribe.call(this, subscriber);
	    };
	    ReplaySubject.prototype._getNow = function () {
	        return (this.scheduler || queue_1.queue).now();
	    };
	    ReplaySubject.prototype._trimBufferThenGetEvents = function () {
	        var now = this._getNow();
	        var _bufferSize = this._bufferSize;
	        var _windowTime = this._windowTime;
	        var _events = this._events;
	        var eventsCount = _events.length;
	        var spliceCount = 0;
	        // Trim events that fall out of the time window.
	        // Start at the front of the list. Break early once
	        // we encounter an event that falls within the window.
	        while (spliceCount < eventsCount) {
	            if ((now - _events[spliceCount].time) < _windowTime) {
	                break;
	            }
	            spliceCount++;
	        }
	        if (eventsCount > _bufferSize) {
	            spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
	        }
	        if (spliceCount > 0) {
	            _events.splice(0, spliceCount);
	        }
	        return _events;
	    };
	    return ReplaySubject;
	}(Subject_1.Subject));
	exports.ReplaySubject = ReplaySubject;
	var ReplayEvent = (function () {
	    function ReplayEvent(time, value) {
	        this.time = time;
	        this.value = value;
	    }
	    return ReplayEvent;
	}());


/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var QueueAction_1 = __webpack_require__(134);
	var QueueScheduler_1 = __webpack_require__(135);
	exports.queue = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);


/***/ },
/* 134 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AsyncAction_1 = __webpack_require__(89);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var QueueAction = (function (_super) {
	    __extends(QueueAction, _super);
	    function QueueAction(scheduler, work) {
	        _super.call(this, scheduler, work);
	        this.scheduler = scheduler;
	        this.work = work;
	    }
	    QueueAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) { delay = 0; }
	        if (delay > 0) {
	            return _super.prototype.schedule.call(this, state, delay);
	        }
	        this.delay = delay;
	        this.state = state;
	        this.scheduler.flush(this);
	        return this;
	    };
	    QueueAction.prototype.execute = function (state, delay) {
	        return (delay > 0 || this.closed) ?
	            _super.prototype.execute.call(this, state, delay) :
	            this._execute(state, delay);
	    };
	    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        // If delay is greater than 0, enqueue as an async action.
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        // Otherwise flush the scheduler starting with this action.
	        return scheduler.flush(this);
	    };
	    return QueueAction;
	}(AsyncAction_1.AsyncAction));
	exports.QueueAction = QueueAction;


/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AsyncScheduler_1 = __webpack_require__(91);
	var QueueScheduler = (function (_super) {
	    __extends(QueueScheduler, _super);
	    function QueueScheduler() {
	        _super.apply(this, arguments);
	    }
	    return QueueScheduler;
	}(AsyncScheduler_1.AsyncScheduler));
	exports.QueueScheduler = QueueScheduler;


/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var Object = root_1.root.Object;
	if (typeof Object.assign != 'function') {
	    (function () {
	        Object.assign = function assignPolyfill(target) {
	            var sources = [];
	            for (var _i = 1; _i < arguments.length; _i++) {
	                sources[_i - 1] = arguments[_i];
	            }
	            if (target === undefined || target === null) {
	                throw new TypeError('cannot convert undefined or null to object');
	            }
	            var output = Object(target);
	            var len = sources.length;
	            for (var index = 0; index < len; index++) {
	                var source = sources[index];
	                if (source !== undefined && source !== null) {
	                    for (var key in source) {
	                        if (source.hasOwnProperty(key)) {
	                            output[key] = source[key];
	                        }
	                    }
	                }
	            }
	            return output;
	        };
	    })();
	}
	exports.assign = Object.assign;


/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var buffer_1 = __webpack_require__(138);
	Observable_1.Observable.prototype.buffer = buffer_1.buffer;


/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Buffers the source Observable values until `closingNotifier` emits.
	 *
	 * <span class="informal">Collects values from the past as an array, and emits
	 * that array only when another Observable emits.</span>
	 *
	 * <img src="./img/buffer.png" width="100%">
	 *
	 * Buffers the incoming Observable values until the given `closingNotifier`
	 * Observable emits a value, at which point it emits the buffer on the output
	 * Observable and starts a new buffer internally, awaiting the next time
	 * `closingNotifier` emits.
	 *
	 * @example <caption>On every click, emit array of most recent interval events</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var interval = Rx.Observable.interval(1000);
	 * var buffered = interval.buffer(clicks);
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @see {@link bufferCount}
	 * @see {@link bufferTime}
	 * @see {@link bufferToggle}
	 * @see {@link bufferWhen}
	 * @see {@link window}
	 *
	 * @param {Observable<any>} closingNotifier An Observable that signals the
	 * buffer to be emitted on the output Observable.
	 * @return {Observable<T[]>} An Observable of buffers, which are arrays of
	 * values.
	 * @method buffer
	 * @owner Observable
	 */
	function buffer(closingNotifier) {
	    return this.lift(new BufferOperator(closingNotifier));
	}
	exports.buffer = buffer;
	var BufferOperator = (function () {
	    function BufferOperator(closingNotifier) {
	        this.closingNotifier = closingNotifier;
	    }
	    BufferOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new BufferSubscriber(subscriber, this.closingNotifier));
	    };
	    return BufferOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var BufferSubscriber = (function (_super) {
	    __extends(BufferSubscriber, _super);
	    function BufferSubscriber(destination, closingNotifier) {
	        _super.call(this, destination);
	        this.buffer = [];
	        this.add(subscribeToResult_1.subscribeToResult(this, closingNotifier));
	    }
	    BufferSubscriber.prototype._next = function (value) {
	        this.buffer.push(value);
	    };
	    BufferSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var buffer = this.buffer;
	        this.buffer = [];
	        this.destination.next(buffer);
	    };
	    return BufferSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var bufferCount_1 = __webpack_require__(140);
	Observable_1.Observable.prototype.bufferCount = bufferCount_1.bufferCount;


/***/ },
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Buffers the source Observable values until the size hits the maximum
	 * `bufferSize` given.
	 *
	 * <span class="informal">Collects values from the past as an array, and emits
	 * that array only when its size reaches `bufferSize`.</span>
	 *
	 * <img src="./img/bufferCount.png" width="100%">
	 *
	 * Buffers a number of values from the source Observable by `bufferSize` then
	 * emits the buffer and clears it, and starts a new buffer each
	 * `startBufferEvery` values. If `startBufferEvery` is not provided or is
	 * `null`, then new buffers are started immediately at the start of the source
	 * and when each buffer closes and is emitted.
	 *
	 * @example <caption>Emit the last two click events as an array</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var buffered = clicks.bufferCount(2);
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @example <caption>On every click, emit the last two click events as an array</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var buffered = clicks.bufferCount(2, 1);
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @see {@link buffer}
	 * @see {@link bufferTime}
	 * @see {@link bufferToggle}
	 * @see {@link bufferWhen}
	 * @see {@link pairwise}
	 * @see {@link windowCount}
	 *
	 * @param {number} bufferSize The maximum size of the buffer emitted.
	 * @param {number} [startBufferEvery] Interval at which to start a new buffer.
	 * For example if `startBufferEvery` is `2`, then a new buffer will be started
	 * on every other value from the source. A new buffer is started at the
	 * beginning of the source by default.
	 * @return {Observable<T[]>} An Observable of arrays of buffered values.
	 * @method bufferCount
	 * @owner Observable
	 */
	function bufferCount(bufferSize, startBufferEvery) {
	    if (startBufferEvery === void 0) { startBufferEvery = null; }
	    return this.lift(new BufferCountOperator(bufferSize, startBufferEvery));
	}
	exports.bufferCount = bufferCount;
	var BufferCountOperator = (function () {
	    function BufferCountOperator(bufferSize, startBufferEvery) {
	        this.bufferSize = bufferSize;
	        this.startBufferEvery = startBufferEvery;
	    }
	    BufferCountOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new BufferCountSubscriber(subscriber, this.bufferSize, this.startBufferEvery));
	    };
	    return BufferCountOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var BufferCountSubscriber = (function (_super) {
	    __extends(BufferCountSubscriber, _super);
	    function BufferCountSubscriber(destination, bufferSize, startBufferEvery) {
	        _super.call(this, destination);
	        this.bufferSize = bufferSize;
	        this.startBufferEvery = startBufferEvery;
	        this.buffers = [[]];
	        this.count = 0;
	    }
	    BufferCountSubscriber.prototype._next = function (value) {
	        var count = (this.count += 1);
	        var destination = this.destination;
	        var bufferSize = this.bufferSize;
	        var startBufferEvery = (this.startBufferEvery == null) ? bufferSize : this.startBufferEvery;
	        var buffers = this.buffers;
	        var len = buffers.length;
	        var remove = -1;
	        if (count % startBufferEvery === 0) {
	            buffers.push([]);
	        }
	        for (var i = 0; i < len; i++) {
	            var buffer = buffers[i];
	            buffer.push(value);
	            if (buffer.length === bufferSize) {
	                remove = i;
	                destination.next(buffer);
	            }
	        }
	        if (remove !== -1) {
	            buffers.splice(remove, 1);
	        }
	    };
	    BufferCountSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        var buffers = this.buffers;
	        while (buffers.length > 0) {
	            var buffer = buffers.shift();
	            if (buffer.length > 0) {
	                destination.next(buffer);
	            }
	        }
	        _super.prototype._complete.call(this);
	    };
	    return BufferCountSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var bufferTime_1 = __webpack_require__(142);
	Observable_1.Observable.prototype.bufferTime = bufferTime_1.bufferTime;


/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var async_1 = __webpack_require__(88);
	var Subscriber_1 = __webpack_require__(19);
	var isScheduler_1 = __webpack_require__(41);
	/**
	 * Buffers the source Observable values for a specific time period.
	 *
	 * <span class="informal">Collects values from the past as an array, and emits
	 * those arrays periodically in time.</span>
	 *
	 * <img src="./img/bufferTime.png" width="100%">
	 *
	 * Buffers values from the source for a specific time duration `bufferTimeSpan`.
	 * Unless the optional argument `bufferCreationInterval` is given, it emits and
	 * resets the buffer every `bufferTimeSpan` milliseconds. If
	 * `bufferCreationInterval` is given, this operator opens the buffer every
	 * `bufferCreationInterval` milliseconds and closes (emits and resets) the
	 * buffer every `bufferTimeSpan` milliseconds. When the optional argument
	 * `maxBufferSize` is specified, the buffer will be closed either after
	 * `bufferTimeSpan` milliseconds or when it contains `maxBufferSize` elements.
	 *
	 * @example <caption>Every second, emit an array of the recent click events</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var buffered = clicks.bufferTime(1000);
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @example <caption>Every 5 seconds, emit the click events from the next 2 seconds</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var buffered = clicks.bufferTime(2000, 5000);
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @see {@link buffer}
	 * @see {@link bufferCount}
	 * @see {@link bufferToggle}
	 * @see {@link bufferWhen}
	 * @see {@link windowTime}
	 *
	 * @param {number} bufferTimeSpan The amount of time to fill each buffer array.
	 * @param {number} [bufferCreationInterval] The interval at which to start new
	 * buffers.
	 * @param {number} [maxBufferSize] The maximum buffer size.
	 * @param {Scheduler} [scheduler=async] The scheduler on which to schedule the
	 * intervals that determine buffer boundaries.
	 * @return {Observable<T[]>} An observable of arrays of buffered values.
	 * @method bufferTime
	 * @owner Observable
	 */
	function bufferTime(bufferTimeSpan) {
	    var length = arguments.length;
	    var scheduler = async_1.async;
	    if (isScheduler_1.isScheduler(arguments[arguments.length - 1])) {
	        scheduler = arguments[arguments.length - 1];
	        length--;
	    }
	    var bufferCreationInterval = null;
	    if (length >= 2) {
	        bufferCreationInterval = arguments[1];
	    }
	    var maxBufferSize = Number.POSITIVE_INFINITY;
	    if (length >= 3) {
	        maxBufferSize = arguments[2];
	    }
	    return this.lift(new BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler));
	}
	exports.bufferTime = bufferTime;
	var BufferTimeOperator = (function () {
	    function BufferTimeOperator(bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
	        this.bufferTimeSpan = bufferTimeSpan;
	        this.bufferCreationInterval = bufferCreationInterval;
	        this.maxBufferSize = maxBufferSize;
	        this.scheduler = scheduler;
	    }
	    BufferTimeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new BufferTimeSubscriber(subscriber, this.bufferTimeSpan, this.bufferCreationInterval, this.maxBufferSize, this.scheduler));
	    };
	    return BufferTimeOperator;
	}());
	var Context = (function () {
	    function Context() {
	        this.buffer = [];
	    }
	    return Context;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var BufferTimeSubscriber = (function (_super) {
	    __extends(BufferTimeSubscriber, _super);
	    function BufferTimeSubscriber(destination, bufferTimeSpan, bufferCreationInterval, maxBufferSize, scheduler) {
	        _super.call(this, destination);
	        this.bufferTimeSpan = bufferTimeSpan;
	        this.bufferCreationInterval = bufferCreationInterval;
	        this.maxBufferSize = maxBufferSize;
	        this.scheduler = scheduler;
	        this.contexts = [];
	        var context = this.openContext();
	        this.timespanOnly = bufferCreationInterval == null || bufferCreationInterval < 0;
	        if (this.timespanOnly) {
	            var timeSpanOnlyState = { subscriber: this, context: context, bufferTimeSpan: bufferTimeSpan };
	            this.add(context.closeAction = scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
	        }
	        else {
	            var closeState = { subscriber: this, context: context };
	            var creationState = { bufferTimeSpan: bufferTimeSpan, bufferCreationInterval: bufferCreationInterval, subscriber: this, scheduler: scheduler };
	            this.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, closeState));
	            this.add(scheduler.schedule(dispatchBufferCreation, bufferCreationInterval, creationState));
	        }
	    }
	    BufferTimeSubscriber.prototype._next = function (value) {
	        var contexts = this.contexts;
	        var len = contexts.length;
	        var filledBufferContext;
	        for (var i = 0; i < len; i++) {
	            var context = contexts[i];
	            var buffer = context.buffer;
	            buffer.push(value);
	            if (buffer.length == this.maxBufferSize) {
	                filledBufferContext = context;
	            }
	        }
	        if (filledBufferContext) {
	            this.onBufferFull(filledBufferContext);
	        }
	    };
	    BufferTimeSubscriber.prototype._error = function (err) {
	        this.contexts.length = 0;
	        _super.prototype._error.call(this, err);
	    };
	    BufferTimeSubscriber.prototype._complete = function () {
	        var _a = this, contexts = _a.contexts, destination = _a.destination;
	        while (contexts.length > 0) {
	            var context = contexts.shift();
	            destination.next(context.buffer);
	        }
	        _super.prototype._complete.call(this);
	    };
	    BufferTimeSubscriber.prototype._unsubscribe = function () {
	        this.contexts = null;
	    };
	    BufferTimeSubscriber.prototype.onBufferFull = function (context) {
	        this.closeContext(context);
	        var closeAction = context.closeAction;
	        closeAction.unsubscribe();
	        this.remove(closeAction);
	        if (this.timespanOnly) {
	            context = this.openContext();
	            var bufferTimeSpan = this.bufferTimeSpan;
	            var timeSpanOnlyState = { subscriber: this, context: context, bufferTimeSpan: bufferTimeSpan };
	            this.add(context.closeAction = this.scheduler.schedule(dispatchBufferTimeSpanOnly, bufferTimeSpan, timeSpanOnlyState));
	        }
	    };
	    BufferTimeSubscriber.prototype.openContext = function () {
	        var context = new Context();
	        this.contexts.push(context);
	        return context;
	    };
	    BufferTimeSubscriber.prototype.closeContext = function (context) {
	        this.destination.next(context.buffer);
	        var contexts = this.contexts;
	        var spliceIndex = contexts ? contexts.indexOf(context) : -1;
	        if (spliceIndex >= 0) {
	            contexts.splice(contexts.indexOf(context), 1);
	        }
	    };
	    return BufferTimeSubscriber;
	}(Subscriber_1.Subscriber));
	function dispatchBufferTimeSpanOnly(state) {
	    var subscriber = state.subscriber;
	    var prevContext = state.context;
	    if (prevContext) {
	        subscriber.closeContext(prevContext);
	    }
	    if (!subscriber.closed) {
	        state.context = subscriber.openContext();
	        state.context.closeAction = this.schedule(state, state.bufferTimeSpan);
	    }
	}
	function dispatchBufferCreation(state) {
	    var bufferCreationInterval = state.bufferCreationInterval, bufferTimeSpan = state.bufferTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler;
	    var context = subscriber.openContext();
	    var action = this;
	    if (!subscriber.closed) {
	        subscriber.add(context.closeAction = scheduler.schedule(dispatchBufferClose, bufferTimeSpan, { subscriber: subscriber, context: context }));
	        action.schedule(state, bufferCreationInterval);
	    }
	}
	function dispatchBufferClose(arg) {
	    var subscriber = arg.subscriber, context = arg.context;
	    subscriber.closeContext(context);
	}


/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var bufferToggle_1 = __webpack_require__(144);
	Observable_1.Observable.prototype.bufferToggle = bufferToggle_1.bufferToggle;


/***/ },
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscription_1 = __webpack_require__(21);
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * Buffers the source Observable values starting from an emission from
	 * `openings` and ending when the output of `closingSelector` emits.
	 *
	 * <span class="informal">Collects values from the past as an array. Starts
	 * collecting only when `opening` emits, and calls the `closingSelector`
	 * function to get an Observable that tells when to close the buffer.</span>
	 *
	 * <img src="./img/bufferToggle.png" width="100%">
	 *
	 * Buffers values from the source by opening the buffer via signals from an
	 * Observable provided to `openings`, and closing and sending the buffers when
	 * a Subscribable or Promise returned by the `closingSelector` function emits.
	 *
	 * @example <caption>Every other second, emit the click events from the next 500ms</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var openings = Rx.Observable.interval(1000);
	 * var buffered = clicks.bufferToggle(openings, i =>
	 *   i % 2 ? Rx.Observable.interval(500) : Rx.Observable.empty()
	 * );
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @see {@link buffer}
	 * @see {@link bufferCount}
	 * @see {@link bufferTime}
	 * @see {@link bufferWhen}
	 * @see {@link windowToggle}
	 *
	 * @param {SubscribableOrPromise<O>} openings A Subscribable or Promise of notifications to start new
	 * buffers.
	 * @param {function(value: O): SubscribableOrPromise} closingSelector A function that takes
	 * the value emitted by the `openings` observable and returns a Subscribable or Promise,
	 * which, when it emits, signals that the associated buffer should be emitted
	 * and cleared.
	 * @return {Observable<T[]>} An observable of arrays of buffered values.
	 * @method bufferToggle
	 * @owner Observable
	 */
	function bufferToggle(openings, closingSelector) {
	    return this.lift(new BufferToggleOperator(openings, closingSelector));
	}
	exports.bufferToggle = bufferToggle;
	var BufferToggleOperator = (function () {
	    function BufferToggleOperator(openings, closingSelector) {
	        this.openings = openings;
	        this.closingSelector = closingSelector;
	    }
	    BufferToggleOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new BufferToggleSubscriber(subscriber, this.openings, this.closingSelector));
	    };
	    return BufferToggleOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var BufferToggleSubscriber = (function (_super) {
	    __extends(BufferToggleSubscriber, _super);
	    function BufferToggleSubscriber(destination, openings, closingSelector) {
	        _super.call(this, destination);
	        this.openings = openings;
	        this.closingSelector = closingSelector;
	        this.contexts = [];
	        this.add(subscribeToResult_1.subscribeToResult(this, openings));
	    }
	    BufferToggleSubscriber.prototype._next = function (value) {
	        var contexts = this.contexts;
	        var len = contexts.length;
	        for (var i = 0; i < len; i++) {
	            contexts[i].buffer.push(value);
	        }
	    };
	    BufferToggleSubscriber.prototype._error = function (err) {
	        var contexts = this.contexts;
	        while (contexts.length > 0) {
	            var context = contexts.shift();
	            context.subscription.unsubscribe();
	            context.buffer = null;
	            context.subscription = null;
	        }
	        this.contexts = null;
	        _super.prototype._error.call(this, err);
	    };
	    BufferToggleSubscriber.prototype._complete = function () {
	        var contexts = this.contexts;
	        while (contexts.length > 0) {
	            var context = contexts.shift();
	            this.destination.next(context.buffer);
	            context.subscription.unsubscribe();
	            context.buffer = null;
	            context.subscription = null;
	        }
	        this.contexts = null;
	        _super.prototype._complete.call(this);
	    };
	    BufferToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        outerValue ? this.closeBuffer(outerValue) : this.openBuffer(innerValue);
	    };
	    BufferToggleSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.closeBuffer(innerSub.context);
	    };
	    BufferToggleSubscriber.prototype.openBuffer = function (value) {
	        try {
	            var closingSelector = this.closingSelector;
	            var closingNotifier = closingSelector.call(this, value);
	            if (closingNotifier) {
	                this.trySubscribe(closingNotifier);
	            }
	        }
	        catch (err) {
	            this._error(err);
	        }
	    };
	    BufferToggleSubscriber.prototype.closeBuffer = function (context) {
	        var contexts = this.contexts;
	        if (contexts && context) {
	            var buffer = context.buffer, subscription = context.subscription;
	            this.destination.next(buffer);
	            contexts.splice(contexts.indexOf(context), 1);
	            this.remove(subscription);
	            subscription.unsubscribe();
	        }
	    };
	    BufferToggleSubscriber.prototype.trySubscribe = function (closingNotifier) {
	        var contexts = this.contexts;
	        var buffer = [];
	        var subscription = new Subscription_1.Subscription();
	        var context = { buffer: buffer, subscription: subscription };
	        contexts.push(context);
	        var innerSubscription = subscribeToResult_1.subscribeToResult(this, closingNotifier, context);
	        if (!innerSubscription || innerSubscription.closed) {
	            this.closeBuffer(context);
	        }
	        else {
	            innerSubscription.context = context;
	            this.add(innerSubscription);
	            subscription.add(innerSubscription);
	        }
	    };
	    return BufferToggleSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var bufferWhen_1 = __webpack_require__(146);
	Observable_1.Observable.prototype.bufferWhen = bufferWhen_1.bufferWhen;


/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscription_1 = __webpack_require__(21);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Buffers the source Observable values, using a factory function of closing
	 * Observables to determine when to close, emit, and reset the buffer.
	 *
	 * <span class="informal">Collects values from the past as an array. When it
	 * starts collecting values, it calls a function that returns an Observable that
	 * tells when to close the buffer and restart collecting.</span>
	 *
	 * <img src="./img/bufferWhen.png" width="100%">
	 *
	 * Opens a buffer immediately, then closes the buffer when the observable
	 * returned by calling `closingSelector` function emits a value. When it closes
	 * the buffer, it immediately opens a new buffer and repeats the process.
	 *
	 * @example <caption>Emit an array of the last clicks every [1-5] random seconds</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var buffered = clicks.bufferWhen(() =>
	 *   Rx.Observable.interval(1000 + Math.random() * 4000)
	 * );
	 * buffered.subscribe(x => console.log(x));
	 *
	 * @see {@link buffer}
	 * @see {@link bufferCount}
	 * @see {@link bufferTime}
	 * @see {@link bufferToggle}
	 * @see {@link windowWhen}
	 *
	 * @param {function(): Observable} closingSelector A function that takes no
	 * arguments and returns an Observable that signals buffer closure.
	 * @return {Observable<T[]>} An observable of arrays of buffered values.
	 * @method bufferWhen
	 * @owner Observable
	 */
	function bufferWhen(closingSelector) {
	    return this.lift(new BufferWhenOperator(closingSelector));
	}
	exports.bufferWhen = bufferWhen;
	var BufferWhenOperator = (function () {
	    function BufferWhenOperator(closingSelector) {
	        this.closingSelector = closingSelector;
	    }
	    BufferWhenOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new BufferWhenSubscriber(subscriber, this.closingSelector));
	    };
	    return BufferWhenOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var BufferWhenSubscriber = (function (_super) {
	    __extends(BufferWhenSubscriber, _super);
	    function BufferWhenSubscriber(destination, closingSelector) {
	        _super.call(this, destination);
	        this.closingSelector = closingSelector;
	        this.subscribing = false;
	        this.openBuffer();
	    }
	    BufferWhenSubscriber.prototype._next = function (value) {
	        this.buffer.push(value);
	    };
	    BufferWhenSubscriber.prototype._complete = function () {
	        var buffer = this.buffer;
	        if (buffer) {
	            this.destination.next(buffer);
	        }
	        _super.prototype._complete.call(this);
	    };
	    BufferWhenSubscriber.prototype._unsubscribe = function () {
	        this.buffer = null;
	        this.subscribing = false;
	    };
	    BufferWhenSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.openBuffer();
	    };
	    BufferWhenSubscriber.prototype.notifyComplete = function () {
	        if (this.subscribing) {
	            this.complete();
	        }
	        else {
	            this.openBuffer();
	        }
	    };
	    BufferWhenSubscriber.prototype.openBuffer = function () {
	        var closingSubscription = this.closingSubscription;
	        if (closingSubscription) {
	            this.remove(closingSubscription);
	            closingSubscription.unsubscribe();
	        }
	        var buffer = this.buffer;
	        if (this.buffer) {
	            this.destination.next(buffer);
	        }
	        this.buffer = [];
	        var closingNotifier = tryCatch_1.tryCatch(this.closingSelector)();
	        if (closingNotifier === errorObject_1.errorObject) {
	            this.error(errorObject_1.errorObject.e);
	        }
	        else {
	            closingSubscription = new Subscription_1.Subscription();
	            this.closingSubscription = closingSubscription;
	            this.add(closingSubscription);
	            this.subscribing = true;
	            closingSubscription.add(subscribeToResult_1.subscribeToResult(this, closingNotifier));
	            this.subscribing = false;
	        }
	    };
	    return BufferWhenSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var cache_1 = __webpack_require__(148);
	Observable_1.Observable.prototype.cache = cache_1.cache;


/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var ReplaySubject_1 = __webpack_require__(132);
	/**
	 * @param bufferSize
	 * @param windowTime
	 * @param scheduler
	 * @return {Observable<any>}
	 * @method cache
	 * @owner Observable
	 */
	function cache(bufferSize, windowTime, scheduler) {
	    if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
	    if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
	    var subject;
	    var source = this;
	    var refs = 0;
	    var outerSub;
	    var getSubject = function () {
	        subject = new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler);
	        return subject;
	    };
	    return new Observable_1.Observable(function (observer) {
	        if (!subject) {
	            subject = getSubject();
	            outerSub = source.subscribe(function (value) { return subject.next(value); }, function (err) {
	                var s = subject;
	                subject = null;
	                s.error(err);
	            }, function () { return subject.complete(); });
	        }
	        refs++;
	        if (!subject) {
	            subject = getSubject();
	        }
	        var innerSub = subject.subscribe(observer);
	        return function () {
	            refs--;
	            if (innerSub) {
	                innerSub.unsubscribe();
	            }
	            if (refs === 0) {
	                outerSub.unsubscribe();
	            }
	        };
	    });
	}
	exports.cache = cache;


/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var catch_1 = __webpack_require__(150);
	Observable_1.Observable.prototype.catch = catch_1._catch;
	Observable_1.Observable.prototype._catch = catch_1._catch;


/***/ },
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Catches errors on the observable to be handled by returning a new observable or throwing an error.
	 * @param {function} selector a function that takes as arguments `err`, which is the error, and `caught`, which
	 *  is the source observable, in case you'd like to "retry" that observable by returning it again. Whatever observable
	 *  is returned by the `selector` will be used to continue the observable chain.
	 * @return {Observable} an observable that originates from either the source or the observable returned by the
	 *  catch `selector` function.
	 * @method catch
	 * @owner Observable
	 */
	function _catch(selector) {
	    var operator = new CatchOperator(selector);
	    var caught = this.lift(operator);
	    return (operator.caught = caught);
	}
	exports._catch = _catch;
	var CatchOperator = (function () {
	    function CatchOperator(selector) {
	        this.selector = selector;
	    }
	    CatchOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new CatchSubscriber(subscriber, this.selector, this.caught));
	    };
	    return CatchOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var CatchSubscriber = (function (_super) {
	    __extends(CatchSubscriber, _super);
	    function CatchSubscriber(destination, selector, caught) {
	        _super.call(this, destination);
	        this.selector = selector;
	        this.caught = caught;
	    }
	    // NOTE: overriding `error` instead of `_error` because we don't want
	    // to have this flag this subscriber as `isStopped`.
	    CatchSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var result = void 0;
	            try {
	                result = this.selector(err, this.caught);
	            }
	            catch (err) {
	                this.destination.error(err);
	                return;
	            }
	            this.unsubscribe();
	            this.destination.remove(this);
	            subscribeToResult_1.subscribeToResult(this, result);
	        }
	    };
	    return CatchSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var combineAll_1 = __webpack_require__(152);
	Observable_1.Observable.prototype.combineAll = combineAll_1.combineAll;


/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var combineLatest_1 = __webpack_require__(45);
	/**
	 * Converts a higher-order Observable into a first-order Observable by waiting
	 * for the outer Observable to complete, then applying {@link combineLatest}.
	 *
	 * <span class="informal">Flattens an Observable-of-Observables by applying
	 * {@link combineLatest} when the Observable-of-Observables completes.</span>
	 *
	 * <img src="./img/combineAll.png" width="100%">
	 *
	 * Takes an Observable of Observables, and collects all Observables from it.
	 * Once the outer Observable completes, it subscribes to all collected
	 * Observables and combines their values using the {@link combineLatest}
	 * strategy, such that:
	 * - Every time an inner Observable emits, the output Observable emits.
	 * - When the returned observable emits, it emits all of the latest values by:
	 *   - If a `project` function is provided, it is called with each recent value
	 *     from each inner Observable in whatever order they arrived, and the result
	 *     of the `project` function is what is emitted by the output Observable.
	 *   - If there is no `project` function, an array of all of the most recent
	 *     values is emitted by the output Observable.
	 *
	 * @example <caption>Map two click events to a finite interval Observable, then apply combineAll</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var higherOrder = clicks.map(ev =>
	 *   Rx.Observable.interval(Math.random()*2000).take(3)
	 * ).take(2);
	 * var result = higherOrder.combineAll();
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link combineLatest}
	 * @see {@link mergeAll}
	 *
	 * @param {function} [project] An optional function to map the most recent
	 * values from each inner Observable into a new result. Takes each of the most
	 * recent values from each collected inner Observable as arguments, in order.
	 * @return {Observable} An Observable of projected results or arrays of recent
	 * values.
	 * @method combineAll
	 * @owner Observable
	 */
	function combineAll(project) {
	    return this.lift(new combineLatest_1.CombineLatestOperator(project));
	}
	exports.combineAll = combineAll;


/***/ },
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var combineLatest_1 = __webpack_require__(45);
	Observable_1.Observable.prototype.combineLatest = combineLatest_1.combineLatest;


/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var concat_1 = __webpack_require__(53);
	Observable_1.Observable.prototype.concat = concat_1.concat;


/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var concatAll_1 = __webpack_require__(156);
	Observable_1.Observable.prototype.concatAll = concatAll_1.concatAll;


/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var mergeAll_1 = __webpack_require__(54);
	/**
	 * Converts a higher-order Observable into a first-order Observable by
	 * concatenating the inner Observables in order.
	 *
	 * <span class="informal">Flattens an Observable-of-Observables by putting one
	 * inner Observable after the other.</span>
	 *
	 * <img src="./img/concatAll.png" width="100%">
	 *
	 * Joins every Observable emitted by the source (a higher-order Observable), in
	 * a serial fashion. It subscribes to each inner Observable only after the
	 * previous inner Observable has completed, and merges all of their values into
	 * the returned observable.
	 *
	 * __Warning:__ If the source Observable emits Observables quickly and
	 * endlessly, and the inner Observables it emits generally complete slower than
	 * the source emits, you can run into memory issues as the incoming Observables
	 * collect in an unbounded buffer.
	 *
	 * Note: `concatAll` is equivalent to `mergeAll` with concurrency parameter set
	 * to `1`.
	 *
	 * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var higherOrder = clicks.map(ev => Rx.Observable.interval(1000).take(4));
	 * var firstOrder = higherOrder.concatAll();
	 * firstOrder.subscribe(x => console.log(x));
	 *
	 * @see {@link combineAll}
	 * @see {@link concat}
	 * @see {@link concatMap}
	 * @see {@link concatMapTo}
	 * @see {@link exhaust}
	 * @see {@link mergeAll}
	 * @see {@link switch}
	 * @see {@link zipAll}
	 *
	 * @return {Observable} An Observable emitting values from all the inner
	 * Observables concatenated.
	 * @method concatAll
	 * @owner Observable
	 */
	function concatAll() {
	    return this.lift(new mergeAll_1.MergeAllOperator(1));
	}
	exports.concatAll = concatAll;


/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var concatMap_1 = __webpack_require__(158);
	Observable_1.Observable.prototype.concatMap = concatMap_1.concatMap;


/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var mergeMap_1 = __webpack_require__(159);
	/**
	 * Projects each source value to an Observable which is merged in the output
	 * Observable, in a serialized fashion waiting for each one to complete before
	 * merging the next.
	 *
	 * <span class="informal">Maps each value to an Observable, then flattens all of
	 * these inner Observables using {@link concatAll}.</span>
	 *
	 * <img src="./img/concatMap.png" width="100%">
	 *
	 * Returns an Observable that emits items based on applying a function that you
	 * supply to each item emitted by the source Observable, where that function
	 * returns an (so-called "inner") Observable. Each new inner Observable is
	 * concatenated with the previous inner Observable.
	 *
	 * __Warning:__ if source values arrive endlessly and faster than their
	 * corresponding inner Observables can complete, it will result in memory issues
	 * as inner Observables amass in an unbounded buffer waiting for their turn to
	 * be subscribed to.
	 *
	 * Note: `concatMap` is equivalent to `mergeMap` with concurrency parameter set
	 * to `1`.
	 *
	 * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.concatMap(ev => Rx.Observable.interval(1000).take(4));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concat}
	 * @see {@link concatAll}
	 * @see {@link concatMapTo}
	 * @see {@link exhaustMap}
	 * @see {@link mergeMap}
	 * @see {@link switchMap}
	 *
	 * @param {function(value: T, ?index: number): Observable} project A function
	 * that, when applied to an item emitted by the source Observable, returns an
	 * Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @return {Observable} an observable of values merged from the projected
	 * Observables as they were subscribed to, one at a time. Optionally, these
	 * values may have been projected from a passed `projectResult` argument.
	 * @return {Observable} An Observable that emits the result of applying the
	 * projection function (and the optional `resultSelector`) to each item emitted
	 * by the source Observable and taking values from each projected inner
	 * Observable sequentially.
	 * @method concatMap
	 * @owner Observable
	 */
	function concatMap(project, resultSelector) {
	    return this.lift(new mergeMap_1.MergeMapOperator(project, resultSelector, 1));
	}
	exports.concatMap = concatMap;


/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * Projects each source value to an Observable which is merged in the output
	 * Observable.
	 *
	 * <span class="informal">Maps each value to an Observable, then flattens all of
	 * these inner Observables using {@link mergeAll}.</span>
	 *
	 * <img src="./img/mergeMap.png" width="100%">
	 *
	 * Returns an Observable that emits items based on applying a function that you
	 * supply to each item emitted by the source Observable, where that function
	 * returns an Observable, and then merging those resulting Observables and
	 * emitting the results of this merger.
	 *
	 * @example <caption>Map and flatten each letter to an Observable ticking every 1 second</caption>
	 * var letters = Rx.Observable.of('a', 'b', 'c');
	 * var result = letters.mergeMap(x =>
	 *   Rx.Observable.interval(1000).map(i => x+i)
	 * );
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatMap}
	 * @see {@link exhaustMap}
	 * @see {@link merge}
	 * @see {@link mergeAll}
	 * @see {@link mergeMapTo}
	 * @see {@link mergeScan}
	 * @see {@link switchMap}
	 *
	 * @param {function(value: T, ?index: number): Observable} project A function
	 * that, when applied to an item emitted by the source Observable, returns an
	 * Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
	 * Observables being subscribed to concurrently.
	 * @return {Observable} An Observable that emits the result of applying the
	 * projection function (and the optional `resultSelector`) to each item emitted
	 * by the source Observable and merging the results of the Observables obtained
	 * from this transformation.
	 * @method mergeMap
	 * @owner Observable
	 */
	function mergeMap(project, resultSelector, concurrent) {
	    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	    if (typeof resultSelector === 'number') {
	        concurrent = resultSelector;
	        resultSelector = null;
	    }
	    return this.lift(new MergeMapOperator(project, resultSelector, concurrent));
	}
	exports.mergeMap = mergeMap;
	var MergeMapOperator = (function () {
	    function MergeMapOperator(project, resultSelector, concurrent) {
	        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	        this.project = project;
	        this.resultSelector = resultSelector;
	        this.concurrent = concurrent;
	    }
	    MergeMapOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new MergeMapSubscriber(observer, this.project, this.resultSelector, this.concurrent));
	    };
	    return MergeMapOperator;
	}());
	exports.MergeMapOperator = MergeMapOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MergeMapSubscriber = (function (_super) {
	    __extends(MergeMapSubscriber, _super);
	    function MergeMapSubscriber(destination, project, resultSelector, concurrent) {
	        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	        _super.call(this, destination);
	        this.project = project;
	        this.resultSelector = resultSelector;
	        this.concurrent = concurrent;
	        this.hasCompleted = false;
	        this.buffer = [];
	        this.active = 0;
	        this.index = 0;
	    }
	    MergeMapSubscriber.prototype._next = function (value) {
	        if (this.active < this.concurrent) {
	            this._tryNext(value);
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    MergeMapSubscriber.prototype._tryNext = function (value) {
	        var result;
	        var index = this.index++;
	        try {
	            result = this.project(value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.active++;
	        this._innerSub(result, value, index);
	    };
	    MergeMapSubscriber.prototype._innerSub = function (ish, value, index) {
	        this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));
	    };
	    MergeMapSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            this.destination.complete();
	        }
	    };
	    MergeMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        if (this.resultSelector) {
	            this._notifyResultSelector(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        else {
	            this.destination.next(innerValue);
	        }
	    };
	    MergeMapSubscriber.prototype._notifyResultSelector = function (outerValue, innerValue, outerIndex, innerIndex) {
	        var result;
	        try {
	            result = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    MergeMapSubscriber.prototype.notifyComplete = function (innerSub) {
	        var buffer = this.buffer;
	        this.remove(innerSub);
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        else if (this.active === 0 && this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return MergeMapSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.MergeMapSubscriber = MergeMapSubscriber;


/***/ },
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var concatMapTo_1 = __webpack_require__(161);
	Observable_1.Observable.prototype.concatMapTo = concatMapTo_1.concatMapTo;


/***/ },
/* 161 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var mergeMapTo_1 = __webpack_require__(162);
	/**
	 * Projects each source value to the same Observable which is merged multiple
	 * times in a serialized fashion on the output Observable.
	 *
	 * <span class="informal">It's like {@link concatMap}, but maps each value
	 * always to the same inner Observable.</span>
	 *
	 * <img src="./img/concatMapTo.png" width="100%">
	 *
	 * Maps each source value to the given Observable `innerObservable` regardless
	 * of the source value, and then flattens those resulting Observables into one
	 * single Observable, which is the output Observable. Each new `innerObservable`
	 * instance emitted on the output Observable is concatenated with the previous
	 * `innerObservable` instance.
	 *
	 * __Warning:__ if source values arrive endlessly and faster than their
	 * corresponding inner Observables can complete, it will result in memory issues
	 * as inner Observables amass in an unbounded buffer waiting for their turn to
	 * be subscribed to.
	 *
	 * Note: `concatMapTo` is equivalent to `mergeMapTo` with concurrency parameter
	 * set to `1`.
	 *
	 * @example <caption>For each click event, tick every second from 0 to 3, with no concurrency</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.concatMapTo(Rx.Observable.interval(1000).take(4));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concat}
	 * @see {@link concatAll}
	 * @see {@link concatMap}
	 * @see {@link mergeMapTo}
	 * @see {@link switchMapTo}
	 *
	 * @param {Observable} innerObservable An Observable to replace each value from
	 * the source Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @return {Observable} An observable of values merged together by joining the
	 * passed observable with itself, one after the other, for each value emitted
	 * from the source.
	 * @method concatMapTo
	 * @owner Observable
	 */
	function concatMapTo(innerObservable, resultSelector) {
	    return this.lift(new mergeMapTo_1.MergeMapToOperator(innerObservable, resultSelector, 1));
	}
	exports.concatMapTo = concatMapTo;


/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Projects each source value to the same Observable which is merged multiple
	 * times in the output Observable.
	 *
	 * <span class="informal">It's like {@link mergeMap}, but maps each value always
	 * to the same inner Observable.</span>
	 *
	 * <img src="./img/mergeMapTo.png" width="100%">
	 *
	 * Maps each source value to the given Observable `innerObservable` regardless
	 * of the source value, and then merges those resulting Observables into one
	 * single Observable, which is the output Observable.
	 *
	 * @example <caption>For each click event, start an interval Observable ticking every 1 second</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.mergeMapTo(Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatMapTo}
	 * @see {@link merge}
	 * @see {@link mergeAll}
	 * @see {@link mergeMap}
	 * @see {@link mergeScan}
	 * @see {@link switchMapTo}
	 *
	 * @param {Observable} innerObservable An Observable to replace each value from
	 * the source Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
	 * Observables being subscribed to concurrently.
	 * @return {Observable} An Observable that emits items from the given
	 * `innerObservable` (and optionally transformed through `resultSelector`) every
	 * time a value is emitted on the source Observable.
	 * @method mergeMapTo
	 * @owner Observable
	 */
	function mergeMapTo(innerObservable, resultSelector, concurrent) {
	    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	    if (typeof resultSelector === 'number') {
	        concurrent = resultSelector;
	        resultSelector = null;
	    }
	    return this.lift(new MergeMapToOperator(innerObservable, resultSelector, concurrent));
	}
	exports.mergeMapTo = mergeMapTo;
	// TODO: Figure out correct signature here: an Operator<Observable<T>, R>
	//       needs to implement call(observer: Subscriber<R>): Subscriber<Observable<T>>
	var MergeMapToOperator = (function () {
	    function MergeMapToOperator(ish, resultSelector, concurrent) {
	        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	        this.ish = ish;
	        this.resultSelector = resultSelector;
	        this.concurrent = concurrent;
	    }
	    MergeMapToOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new MergeMapToSubscriber(observer, this.ish, this.resultSelector, this.concurrent));
	    };
	    return MergeMapToOperator;
	}());
	exports.MergeMapToOperator = MergeMapToOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MergeMapToSubscriber = (function (_super) {
	    __extends(MergeMapToSubscriber, _super);
	    function MergeMapToSubscriber(destination, ish, resultSelector, concurrent) {
	        if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	        _super.call(this, destination);
	        this.ish = ish;
	        this.resultSelector = resultSelector;
	        this.concurrent = concurrent;
	        this.hasCompleted = false;
	        this.buffer = [];
	        this.active = 0;
	        this.index = 0;
	    }
	    MergeMapToSubscriber.prototype._next = function (value) {
	        if (this.active < this.concurrent) {
	            var resultSelector = this.resultSelector;
	            var index = this.index++;
	            var ish = this.ish;
	            var destination = this.destination;
	            this.active++;
	            this._innerSub(ish, destination, resultSelector, value, index);
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    MergeMapToSubscriber.prototype._innerSub = function (ish, destination, resultSelector, value, index) {
	        this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));
	    };
	    MergeMapToSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            this.destination.complete();
	        }
	    };
	    MergeMapToSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
	        if (resultSelector) {
	            this.trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        else {
	            destination.next(innerValue);
	        }
	    };
	    MergeMapToSubscriber.prototype.trySelectResult = function (outerValue, innerValue, outerIndex, innerIndex) {
	        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
	        var result;
	        try {
	            result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        catch (err) {
	            destination.error(err);
	            return;
	        }
	        destination.next(result);
	    };
	    MergeMapToSubscriber.prototype.notifyError = function (err) {
	        this.destination.error(err);
	    };
	    MergeMapToSubscriber.prototype.notifyComplete = function (innerSub) {
	        var buffer = this.buffer;
	        this.remove(innerSub);
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        else if (this.active === 0 && this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return MergeMapToSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.MergeMapToSubscriber = MergeMapToSubscriber;


/***/ },
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var count_1 = __webpack_require__(164);
	Observable_1.Observable.prototype.count = count_1.count;


/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Counts the number of emissions on the source and emits that number when the
	 * source completes.
	 *
	 * <span class="informal">Tells how many values were emitted, when the source
	 * completes.</span>
	 *
	 * <img src="./img/count.png" width="100%">
	 *
	 * `count` transforms an Observable that emits values into an Observable that
	 * emits a single value that represents the number of values emitted by the
	 * source Observable. If the source Observable terminates with an error, `count`
	 * will pass this error notification along without emitting an value first. If
	 * the source Observable does not terminate at all, `count` will neither emit
	 * a value nor terminate. This operator takes an optional `predicate` function
	 * as argument, in which case the output emission will represent the number of
	 * source values that matched `true` with the `predicate`.
	 *
	 * @example <caption>Counts how many seconds have passed before the first click happened</caption>
	 * var seconds = Rx.Observable.interval(1000);
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var secondsBeforeClick = seconds.takeUntil(clicks);
	 * var result = secondsBeforeClick.count();
	 * result.subscribe(x => console.log(x));
	 *
	 * @example <caption>Counts how many odd numbers are there between 1 and 7</caption>
	 * var numbers = Rx.Observable.range(1, 7);
	 * var result = numbers.count(i => i % 2 === 1);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link max}
	 * @see {@link min}
	 * @see {@link reduce}
	 *
	 * @param {function(value: T, i: number, source: Observable<T>): boolean} [predicate] A
	 * boolean function to select what values are to be counted. It is provided with
	 * arguments of:
	 * - `value`: the value from the source Observable.
	 * - `index`: the (zero-based) "index" of the value from the source Observable.
	 * - `source`: the source Observable instance itself.
	 * @return {Observable} An Observable of one number that represents the count as
	 * described above.
	 * @method count
	 * @owner Observable
	 */
	function count(predicate) {
	    return this.lift(new CountOperator(predicate, this));
	}
	exports.count = count;
	var CountOperator = (function () {
	    function CountOperator(predicate, source) {
	        this.predicate = predicate;
	        this.source = source;
	    }
	    CountOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new CountSubscriber(subscriber, this.predicate, this.source));
	    };
	    return CountOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var CountSubscriber = (function (_super) {
	    __extends(CountSubscriber, _super);
	    function CountSubscriber(destination, predicate, source) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.source = source;
	        this.count = 0;
	        this.index = 0;
	    }
	    CountSubscriber.prototype._next = function (value) {
	        if (this.predicate) {
	            this._tryPredicate(value);
	        }
	        else {
	            this.count++;
	        }
	    };
	    CountSubscriber.prototype._tryPredicate = function (value) {
	        var result;
	        try {
	            result = this.predicate(value, this.index++, this.source);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            this.count++;
	        }
	    };
	    CountSubscriber.prototype._complete = function () {
	        this.destination.next(this.count);
	        this.destination.complete();
	    };
	    return CountSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var dematerialize_1 = __webpack_require__(166);
	Observable_1.Observable.prototype.dematerialize = dematerialize_1.dematerialize;


/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Converts an Observable of {@link Notification} objects into the emissions
	 * that they represent.
	 *
	 * <span class="informal">Unwraps {@link Notification} objects as actual `next`,
	 * `error` and `complete` emissions. The opposite of {@link materialize}.</span>
	 *
	 * <img src="./img/dematerialize.png" width="100%">
	 *
	 * `dematerialize` is assumed to operate an Observable that only emits
	 * {@link Notification} objects as `next` emissions, and does not emit any
	 * `error`. Such Observable is the output of a `materialize` operation. Those
	 * notifications are then unwrapped using the metadata they contain, and emitted
	 * as `next`, `error`, and `complete` on the output Observable.
	 *
	 * Use this operator in conjunction with {@link materialize}.
	 *
	 * @example <caption>Convert an Observable of Notifications to an actual Observable</caption>
	 * var notifA = new Rx.Notification('N', 'A');
	 * var notifB = new Rx.Notification('N', 'B');
	 * var notifE = new Rx.Notification('E', void 0,
	 *   new TypeError('x.toUpperCase is not a function')
	 * );
	 * var materialized = Rx.Observable.of(notifA, notifB, notifE);
	 * var upperCase = materialized.dematerialize();
	 * upperCase.subscribe(x => console.log(x), e => console.error(e));
	 *
	 * @see {@link Notification}
	 * @see {@link materialize}
	 *
	 * @return {Observable} An Observable that emits items and notifications
	 * embedded in Notification objects emitted by the source Observable.
	 * @method dematerialize
	 * @owner Observable
	 */
	function dematerialize() {
	    return this.lift(new DeMaterializeOperator());
	}
	exports.dematerialize = dematerialize;
	var DeMaterializeOperator = (function () {
	    function DeMaterializeOperator() {
	    }
	    DeMaterializeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DeMaterializeSubscriber(subscriber));
	    };
	    return DeMaterializeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DeMaterializeSubscriber = (function (_super) {
	    __extends(DeMaterializeSubscriber, _super);
	    function DeMaterializeSubscriber(destination) {
	        _super.call(this, destination);
	    }
	    DeMaterializeSubscriber.prototype._next = function (value) {
	        value.observe(this.destination);
	    };
	    return DeMaterializeSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var debounce_1 = __webpack_require__(168);
	Observable_1.Observable.prototype.debounce = debounce_1.debounce;


/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Emits a value from the source Observable only after a particular time span
	 * determined by another Observable has passed without another source emission.
	 *
	 * <span class="informal">It's like {@link debounceTime}, but the time span of
	 * emission silence is determined by a second Observable.</span>
	 *
	 * <img src="./img/debounce.png" width="100%">
	 *
	 * `debounce` delays values emitted by the source Observable, but drops previous
	 * pending delayed emissions if a new value arrives on the source Observable.
	 * This operator keeps track of the most recent value from the source
	 * Observable, and spawns a duration Observable by calling the
	 * `durationSelector` function. The value is emitted only when the duration
	 * Observable emits a value or completes, and if no other value was emitted on
	 * the source Observable since the duration Observable was spawned. If a new
	 * value appears before the duration Observable emits, the previous value will
	 * be dropped and will not be emitted on the output Observable.
	 *
	 * Like {@link debounceTime}, this is a rate-limiting operator, and also a
	 * delay-like operator since output emissions do not necessarily occur at the
	 * same time as they did on the source Observable.
	 *
	 * @example <caption>Emit the most recent click after a burst of clicks</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.debounce(() => Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link audit}
	 * @see {@link debounceTime}
	 * @see {@link delayWhen}
	 * @see {@link throttle}
	 *
	 * @param {function(value: T): Observable|Promise} durationSelector A function
	 * that receives a value from the source Observable, for computing the timeout
	 * duration for each source value, returned as an Observable or a Promise.
	 * @return {Observable} An Observable that delays the emissions of the source
	 * Observable by the specified duration Observable returned by
	 * `durationSelector`, and may drop some values if they occur too frequently.
	 * @method debounce
	 * @owner Observable
	 */
	function debounce(durationSelector) {
	    return this.lift(new DebounceOperator(durationSelector));
	}
	exports.debounce = debounce;
	var DebounceOperator = (function () {
	    function DebounceOperator(durationSelector) {
	        this.durationSelector = durationSelector;
	    }
	    DebounceOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DebounceSubscriber(subscriber, this.durationSelector));
	    };
	    return DebounceOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DebounceSubscriber = (function (_super) {
	    __extends(DebounceSubscriber, _super);
	    function DebounceSubscriber(destination, durationSelector) {
	        _super.call(this, destination);
	        this.durationSelector = durationSelector;
	        this.hasValue = false;
	        this.durationSubscription = null;
	    }
	    DebounceSubscriber.prototype._next = function (value) {
	        try {
	            var result = this.durationSelector.call(this, value);
	            if (result) {
	                this._tryNext(value, result);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    DebounceSubscriber.prototype._complete = function () {
	        this.emitValue();
	        this.destination.complete();
	    };
	    DebounceSubscriber.prototype._tryNext = function (value, duration) {
	        var subscription = this.durationSubscription;
	        this.value = value;
	        this.hasValue = true;
	        if (subscription) {
	            subscription.unsubscribe();
	            this.remove(subscription);
	        }
	        subscription = subscribeToResult_1.subscribeToResult(this, duration);
	        if (!subscription.closed) {
	            this.add(this.durationSubscription = subscription);
	        }
	    };
	    DebounceSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.emitValue();
	    };
	    DebounceSubscriber.prototype.notifyComplete = function () {
	        this.emitValue();
	    };
	    DebounceSubscriber.prototype.emitValue = function () {
	        if (this.hasValue) {
	            var value = this.value;
	            var subscription = this.durationSubscription;
	            if (subscription) {
	                this.durationSubscription = null;
	                subscription.unsubscribe();
	                this.remove(subscription);
	            }
	            this.value = null;
	            this.hasValue = false;
	            _super.prototype._next.call(this, value);
	        }
	    };
	    return DebounceSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var debounceTime_1 = __webpack_require__(170);
	Observable_1.Observable.prototype.debounceTime = debounceTime_1.debounceTime;


/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var async_1 = __webpack_require__(88);
	/**
	 * Emits a value from the source Observable only after a particular time span
	 * has passed without another source emission.
	 *
	 * <span class="informal">It's like {@link delay}, but passes only the most
	 * recent value from each burst of emissions.</span>
	 *
	 * <img src="./img/debounceTime.png" width="100%">
	 *
	 * `debounceTime` delays values emitted by the source Observable, but drops
	 * previous pending delayed emissions if a new value arrives on the source
	 * Observable. This operator keeps track of the most recent value from the
	 * source Observable, and emits that only when `dueTime` enough time has passed
	 * without any other value appearing on the source Observable. If a new value
	 * appears before `dueTime` silence occurs, the previous value will be dropped
	 * and will not be emitted on the output Observable.
	 *
	 * This is a rate-limiting operator, because it is impossible for more than one
	 * value to be emitted in any time window of duration `dueTime`, but it is also
	 * a delay-like operator since output emissions do not occur at the same time as
	 * they did on the source Observable. Optionally takes a {@link Scheduler} for
	 * managing timers.
	 *
	 * @example <caption>Emit the most recent click after a burst of clicks</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.debounceTime(1000);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link auditTime}
	 * @see {@link debounce}
	 * @see {@link delay}
	 * @see {@link sampleTime}
	 * @see {@link throttleTime}
	 *
	 * @param {number} dueTime The timeout duration in milliseconds (or the time
	 * unit determined internally by the optional `scheduler`) for the window of
	 * time required to wait for emission silence before emitting the most recent
	 * source value.
	 * @param {Scheduler} [scheduler=async] The {@link Scheduler} to use for
	 * managing the timers that handle the timeout for each value.
	 * @return {Observable} An Observable that delays the emissions of the source
	 * Observable by the specified `dueTime`, and may drop some values if they occur
	 * too frequently.
	 * @method debounceTime
	 * @owner Observable
	 */
	function debounceTime(dueTime, scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new DebounceTimeOperator(dueTime, scheduler));
	}
	exports.debounceTime = debounceTime;
	var DebounceTimeOperator = (function () {
	    function DebounceTimeOperator(dueTime, scheduler) {
	        this.dueTime = dueTime;
	        this.scheduler = scheduler;
	    }
	    DebounceTimeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DebounceTimeSubscriber(subscriber, this.dueTime, this.scheduler));
	    };
	    return DebounceTimeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DebounceTimeSubscriber = (function (_super) {
	    __extends(DebounceTimeSubscriber, _super);
	    function DebounceTimeSubscriber(destination, dueTime, scheduler) {
	        _super.call(this, destination);
	        this.dueTime = dueTime;
	        this.scheduler = scheduler;
	        this.debouncedSubscription = null;
	        this.lastValue = null;
	        this.hasValue = false;
	    }
	    DebounceTimeSubscriber.prototype._next = function (value) {
	        this.clearDebounce();
	        this.lastValue = value;
	        this.hasValue = true;
	        this.add(this.debouncedSubscription = this.scheduler.schedule(dispatchNext, this.dueTime, this));
	    };
	    DebounceTimeSubscriber.prototype._complete = function () {
	        this.debouncedNext();
	        this.destination.complete();
	    };
	    DebounceTimeSubscriber.prototype.debouncedNext = function () {
	        this.clearDebounce();
	        if (this.hasValue) {
	            this.destination.next(this.lastValue);
	            this.lastValue = null;
	            this.hasValue = false;
	        }
	    };
	    DebounceTimeSubscriber.prototype.clearDebounce = function () {
	        var debouncedSubscription = this.debouncedSubscription;
	        if (debouncedSubscription !== null) {
	            this.remove(debouncedSubscription);
	            debouncedSubscription.unsubscribe();
	            this.debouncedSubscription = null;
	        }
	    };
	    return DebounceTimeSubscriber;
	}(Subscriber_1.Subscriber));
	function dispatchNext(subscriber) {
	    subscriber.debouncedNext();
	}


/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var defaultIfEmpty_1 = __webpack_require__(172);
	Observable_1.Observable.prototype.defaultIfEmpty = defaultIfEmpty_1.defaultIfEmpty;


/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Emits a given value if the source Observable completes without emitting any
	 * `next` value, otherwise mirrors the source Observable.
	 *
	 * <span class="informal">If the source Observable turns out to be empty, then
	 * this operator will emit a default value.</span>
	 *
	 * <img src="./img/defaultIfEmpty.png" width="100%">
	 *
	 * `defaultIfEmpty` emits the values emitted by the source Observable or a
	 * specified default value if the source Observable is empty (completes without
	 * having emitted any `next` value).
	 *
	 * @example <caption>If no clicks happen in 5 seconds, then emit "no clicks"</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var clicksBeforeFive = clicks.takeUntil(Rx.Observable.interval(5000));
	 * var result = clicksBeforeFive.defaultIfEmpty('no clicks');
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link empty}
	 * @see {@link last}
	 *
	 * @param {any} [defaultValue=null] The default value used if the source
	 * Observable is empty.
	 * @return {Observable} An Observable that emits either the specified
	 * `defaultValue` if the source Observable emits no items, or the values emitted
	 * by the source Observable.
	 * @method defaultIfEmpty
	 * @owner Observable
	 */
	function defaultIfEmpty(defaultValue) {
	    if (defaultValue === void 0) { defaultValue = null; }
	    return this.lift(new DefaultIfEmptyOperator(defaultValue));
	}
	exports.defaultIfEmpty = defaultIfEmpty;
	var DefaultIfEmptyOperator = (function () {
	    function DefaultIfEmptyOperator(defaultValue) {
	        this.defaultValue = defaultValue;
	    }
	    DefaultIfEmptyOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DefaultIfEmptySubscriber(subscriber, this.defaultValue));
	    };
	    return DefaultIfEmptyOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DefaultIfEmptySubscriber = (function (_super) {
	    __extends(DefaultIfEmptySubscriber, _super);
	    function DefaultIfEmptySubscriber(destination, defaultValue) {
	        _super.call(this, destination);
	        this.defaultValue = defaultValue;
	        this.isEmpty = true;
	    }
	    DefaultIfEmptySubscriber.prototype._next = function (value) {
	        this.isEmpty = false;
	        this.destination.next(value);
	    };
	    DefaultIfEmptySubscriber.prototype._complete = function () {
	        if (this.isEmpty) {
	            this.destination.next(this.defaultValue);
	        }
	        this.destination.complete();
	    };
	    return DefaultIfEmptySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var delay_1 = __webpack_require__(174);
	Observable_1.Observable.prototype.delay = delay_1.delay;


/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var async_1 = __webpack_require__(88);
	var isDate_1 = __webpack_require__(121);
	var Subscriber_1 = __webpack_require__(19);
	var Notification_1 = __webpack_require__(70);
	/**
	 * Delays the emission of items from the source Observable by a given timeout or
	 * until a given Date.
	 *
	 * <span class="informal">Time shifts each item by some specified amount of
	 * milliseconds.</span>
	 *
	 * <img src="./img/delay.png" width="100%">
	 *
	 * If the delay argument is a Number, this operator time shifts the source
	 * Observable by that amount of time expressed in milliseconds. The relative
	 * time intervals between the values are preserved.
	 *
	 * If the delay argument is a Date, this operator time shifts the start of the
	 * Observable execution until the given date occurs.
	 *
	 * @example <caption>Delay each click by one second</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var delayedClicks = clicks.delay(1000); // each click emitted after 1 second
	 * delayedClicks.subscribe(x => console.log(x));
	 *
	 * @example <caption>Delay all clicks until a future date happens</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var date = new Date('March 15, 2050 12:00:00'); // in the future
	 * var delayedClicks = clicks.delay(date); // click emitted only after that date
	 * delayedClicks.subscribe(x => console.log(x));
	 *
	 * @see {@link debounceTime}
	 * @see {@link delayWhen}
	 *
	 * @param {number|Date} delay The delay duration in milliseconds (a `number`) or
	 * a `Date` until which the emission of the source items is delayed.
	 * @param {Scheduler} [scheduler=async] The Scheduler to use for
	 * managing the timers that handle the time-shift for each item.
	 * @return {Observable} An Observable that delays the emissions of the source
	 * Observable by the specified timeout or Date.
	 * @method delay
	 * @owner Observable
	 */
	function delay(delay, scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    var absoluteDelay = isDate_1.isDate(delay);
	    var delayFor = absoluteDelay ? (+delay - scheduler.now()) : Math.abs(delay);
	    return this.lift(new DelayOperator(delayFor, scheduler));
	}
	exports.delay = delay;
	var DelayOperator = (function () {
	    function DelayOperator(delay, scheduler) {
	        this.delay = delay;
	        this.scheduler = scheduler;
	    }
	    DelayOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DelaySubscriber(subscriber, this.delay, this.scheduler));
	    };
	    return DelayOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DelaySubscriber = (function (_super) {
	    __extends(DelaySubscriber, _super);
	    function DelaySubscriber(destination, delay, scheduler) {
	        _super.call(this, destination);
	        this.delay = delay;
	        this.scheduler = scheduler;
	        this.queue = [];
	        this.active = false;
	        this.errored = false;
	    }
	    DelaySubscriber.dispatch = function (state) {
	        var source = state.source;
	        var queue = source.queue;
	        var scheduler = state.scheduler;
	        var destination = state.destination;
	        while (queue.length > 0 && (queue[0].time - scheduler.now()) <= 0) {
	            queue.shift().notification.observe(destination);
	        }
	        if (queue.length > 0) {
	            var delay_1 = Math.max(0, queue[0].time - scheduler.now());
	            this.schedule(state, delay_1);
	        }
	        else {
	            source.active = false;
	        }
	    };
	    DelaySubscriber.prototype._schedule = function (scheduler) {
	        this.active = true;
	        this.add(scheduler.schedule(DelaySubscriber.dispatch, this.delay, {
	            source: this, destination: this.destination, scheduler: scheduler
	        }));
	    };
	    DelaySubscriber.prototype.scheduleNotification = function (notification) {
	        if (this.errored === true) {
	            return;
	        }
	        var scheduler = this.scheduler;
	        var message = new DelayMessage(scheduler.now() + this.delay, notification);
	        this.queue.push(message);
	        if (this.active === false) {
	            this._schedule(scheduler);
	        }
	    };
	    DelaySubscriber.prototype._next = function (value) {
	        this.scheduleNotification(Notification_1.Notification.createNext(value));
	    };
	    DelaySubscriber.prototype._error = function (err) {
	        this.errored = true;
	        this.queue = [];
	        this.destination.error(err);
	    };
	    DelaySubscriber.prototype._complete = function () {
	        this.scheduleNotification(Notification_1.Notification.createComplete());
	    };
	    return DelaySubscriber;
	}(Subscriber_1.Subscriber));
	var DelayMessage = (function () {
	    function DelayMessage(time, notification) {
	        this.time = time;
	        this.notification = notification;
	    }
	    return DelayMessage;
	}());


/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var delayWhen_1 = __webpack_require__(176);
	Observable_1.Observable.prototype.delayWhen = delayWhen_1.delayWhen;


/***/ },
/* 176 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var Observable_1 = __webpack_require__(16);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Delays the emission of items from the source Observable by a given time span
	 * determined by the emissions of another Observable.
	 *
	 * <span class="informal">It's like {@link delay}, but the time span of the
	 * delay duration is determined by a second Observable.</span>
	 *
	 * <img src="./img/delayWhen.png" width="100%">
	 *
	 * `delayWhen` time shifts each emitted value from the source Observable by a
	 * time span determined by another Observable. When the source emits a value,
	 * the `delayDurationSelector` function is called with the source value as
	 * argument, and should return an Observable, called the "duration" Observable.
	 * The source value is emitted on the output Observable only when the duration
	 * Observable emits a value or completes.
	 *
	 * Optionally, `delayWhen` takes a second argument, `subscriptionDelay`, which
	 * is an Observable. When `subscriptionDelay` emits its first value or
	 * completes, the source Observable is subscribed to and starts behaving like
	 * described in the previous paragraph. If `subscriptionDelay` is not provided,
	 * `delayWhen` will subscribe to the source Observable as soon as the output
	 * Observable is subscribed.
	 *
	 * @example <caption>Delay each click by a random amount of time, between 0 and 5 seconds</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var delayedClicks = clicks.delayWhen(event =>
	 *   Rx.Observable.interval(Math.random() * 5000)
	 * );
	 * delayedClicks.subscribe(x => console.log(x));
	 *
	 * @see {@link debounce}
	 * @see {@link delay}
	 *
	 * @param {function(value: T): Observable} delayDurationSelector A function that
	 * returns an Observable for each value emitted by the source Observable, which
	 * is then used to delay the emission of that item on the output Observable
	 * until the Observable returned from this function emits a value.
	 * @param {Observable} subscriptionDelay An Observable that triggers the
	 * subscription to the source Observable once it emits any value.
	 * @return {Observable} An Observable that delays the emissions of the source
	 * Observable by an amount of time specified by the Observable returned by
	 * `delayDurationSelector`.
	 * @method delayWhen
	 * @owner Observable
	 */
	function delayWhen(delayDurationSelector, subscriptionDelay) {
	    if (subscriptionDelay) {
	        return new SubscriptionDelayObservable(this, subscriptionDelay)
	            .lift(new DelayWhenOperator(delayDurationSelector));
	    }
	    return this.lift(new DelayWhenOperator(delayDurationSelector));
	}
	exports.delayWhen = delayWhen;
	var DelayWhenOperator = (function () {
	    function DelayWhenOperator(delayDurationSelector) {
	        this.delayDurationSelector = delayDurationSelector;
	    }
	    DelayWhenOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DelayWhenSubscriber(subscriber, this.delayDurationSelector));
	    };
	    return DelayWhenOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DelayWhenSubscriber = (function (_super) {
	    __extends(DelayWhenSubscriber, _super);
	    function DelayWhenSubscriber(destination, delayDurationSelector) {
	        _super.call(this, destination);
	        this.delayDurationSelector = delayDurationSelector;
	        this.completed = false;
	        this.delayNotifierSubscriptions = [];
	        this.values = [];
	    }
	    DelayWhenSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.destination.next(outerValue);
	        this.removeSubscription(innerSub);
	        this.tryComplete();
	    };
	    DelayWhenSubscriber.prototype.notifyError = function (error, innerSub) {
	        this._error(error);
	    };
	    DelayWhenSubscriber.prototype.notifyComplete = function (innerSub) {
	        var value = this.removeSubscription(innerSub);
	        if (value) {
	            this.destination.next(value);
	        }
	        this.tryComplete();
	    };
	    DelayWhenSubscriber.prototype._next = function (value) {
	        try {
	            var delayNotifier = this.delayDurationSelector(value);
	            if (delayNotifier) {
	                this.tryDelay(delayNotifier, value);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    DelayWhenSubscriber.prototype._complete = function () {
	        this.completed = true;
	        this.tryComplete();
	    };
	    DelayWhenSubscriber.prototype.removeSubscription = function (subscription) {
	        subscription.unsubscribe();
	        var subscriptionIdx = this.delayNotifierSubscriptions.indexOf(subscription);
	        var value = null;
	        if (subscriptionIdx !== -1) {
	            value = this.values[subscriptionIdx];
	            this.delayNotifierSubscriptions.splice(subscriptionIdx, 1);
	            this.values.splice(subscriptionIdx, 1);
	        }
	        return value;
	    };
	    DelayWhenSubscriber.prototype.tryDelay = function (delayNotifier, value) {
	        var notifierSubscription = subscribeToResult_1.subscribeToResult(this, delayNotifier, value);
	        this.add(notifierSubscription);
	        this.delayNotifierSubscriptions.push(notifierSubscription);
	        this.values.push(value);
	    };
	    DelayWhenSubscriber.prototype.tryComplete = function () {
	        if (this.completed && this.delayNotifierSubscriptions.length === 0) {
	            this.destination.complete();
	        }
	    };
	    return DelayWhenSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SubscriptionDelayObservable = (function (_super) {
	    __extends(SubscriptionDelayObservable, _super);
	    function SubscriptionDelayObservable(source, subscriptionDelay) {
	        _super.call(this);
	        this.source = source;
	        this.subscriptionDelay = subscriptionDelay;
	    }
	    SubscriptionDelayObservable.prototype._subscribe = function (subscriber) {
	        this.subscriptionDelay.subscribe(new SubscriptionDelaySubscriber(subscriber, this.source));
	    };
	    return SubscriptionDelayObservable;
	}(Observable_1.Observable));
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SubscriptionDelaySubscriber = (function (_super) {
	    __extends(SubscriptionDelaySubscriber, _super);
	    function SubscriptionDelaySubscriber(parent, source) {
	        _super.call(this);
	        this.parent = parent;
	        this.source = source;
	        this.sourceSubscribed = false;
	    }
	    SubscriptionDelaySubscriber.prototype._next = function (unused) {
	        this.subscribeToSource();
	    };
	    SubscriptionDelaySubscriber.prototype._error = function (err) {
	        this.unsubscribe();
	        this.parent.error(err);
	    };
	    SubscriptionDelaySubscriber.prototype._complete = function () {
	        this.subscribeToSource();
	    };
	    SubscriptionDelaySubscriber.prototype.subscribeToSource = function () {
	        if (!this.sourceSubscribed) {
	            this.sourceSubscribed = true;
	            this.unsubscribe();
	            this.source.subscribe(this.parent);
	        }
	    };
	    return SubscriptionDelaySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 177 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var distinct_1 = __webpack_require__(178);
	Observable_1.Observable.prototype.distinct = distinct_1.distinct;


/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items.
	 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
	 * If a comparator function is not provided, an equality check is used by default.
	 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
	 * An optional parameter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
	 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
	 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
	 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
	 * @method distinct
	 * @owner Observable
	 */
	function distinct(compare, flushes) {
	    return this.lift(new DistinctOperator(compare, flushes));
	}
	exports.distinct = distinct;
	var DistinctOperator = (function () {
	    function DistinctOperator(compare, flushes) {
	        this.compare = compare;
	        this.flushes = flushes;
	    }
	    DistinctOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DistinctSubscriber(subscriber, this.compare, this.flushes));
	    };
	    return DistinctOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DistinctSubscriber = (function (_super) {
	    __extends(DistinctSubscriber, _super);
	    function DistinctSubscriber(destination, compare, flushes) {
	        _super.call(this, destination);
	        this.values = [];
	        if (typeof compare === 'function') {
	            this.compare = compare;
	        }
	        if (flushes) {
	            this.add(subscribeToResult_1.subscribeToResult(this, flushes));
	        }
	    }
	    DistinctSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.values.length = 0;
	    };
	    DistinctSubscriber.prototype.notifyError = function (error, innerSub) {
	        this._error(error);
	    };
	    DistinctSubscriber.prototype._next = function (value) {
	        var found = false;
	        var values = this.values;
	        var len = values.length;
	        try {
	            for (var i = 0; i < len; i++) {
	                if (this.compare(values[i], value)) {
	                    found = true;
	                    return;
	                }
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.values.push(value);
	        this.destination.next(value);
	    };
	    DistinctSubscriber.prototype.compare = function (x, y) {
	        return x === y;
	    };
	    return DistinctSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.DistinctSubscriber = DistinctSubscriber;


/***/ },
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var distinctKey_1 = __webpack_require__(180);
	Observable_1.Observable.prototype.distinctKey = distinctKey_1.distinctKey;


/***/ },
/* 180 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var distinct_1 = __webpack_require__(178);
	/**
	 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from previous items,
	 * using a property accessed by using the key provided to check if the two items are distinct.
	 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
	 * If a comparator function is not provided, an equality check is used by default.
	 * As the internal HashSet of this operator grows larger and larger, care should be taken in the domain of inputs this operator may see.
	 * An optional parameter is also provided such that an Observable can be provided to queue the internal HashSet to flush the values it holds.
	 * @param {string} key string key for object property lookup on each item.
	 * @param {function} [compare] optional comparison function called to test if an item is distinct from previous items in the source.
	 * @param {Observable} [flushes] optional Observable for flushing the internal HashSet of the operator.
	 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
	 * @method distinctKey
	 * @owner Observable
	 */
	function distinctKey(key, compare, flushes) {
	    return distinct_1.distinct.call(this, function (x, y) {
	        if (compare) {
	            return compare(x[key], y[key]);
	        }
	        return x[key] === y[key];
	    }, flushes);
	}
	exports.distinctKey = distinctKey;


/***/ },
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var distinctUntilChanged_1 = __webpack_require__(182);
	Observable_1.Observable.prototype.distinctUntilChanged = distinctUntilChanged_1.distinctUntilChanged;


/***/ },
/* 182 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	/**
	 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item.
	 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
	 * If a comparator function is not provided, an equality check is used by default.
	 * @param {function} [compare] optional comparison function called to test if an item is distinct from the previous item in the source.
	 * @return {Observable} an Observable that emits items from the source Observable with distinct values.
	 * @method distinctUntilChanged
	 * @owner Observable
	 */
	function distinctUntilChanged(compare, keySelector) {
	    return this.lift(new DistinctUntilChangedOperator(compare, keySelector));
	}
	exports.distinctUntilChanged = distinctUntilChanged;
	var DistinctUntilChangedOperator = (function () {
	    function DistinctUntilChangedOperator(compare, keySelector) {
	        this.compare = compare;
	        this.keySelector = keySelector;
	    }
	    DistinctUntilChangedOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DistinctUntilChangedSubscriber(subscriber, this.compare, this.keySelector));
	    };
	    return DistinctUntilChangedOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DistinctUntilChangedSubscriber = (function (_super) {
	    __extends(DistinctUntilChangedSubscriber, _super);
	    function DistinctUntilChangedSubscriber(destination, compare, keySelector) {
	        _super.call(this, destination);
	        this.keySelector = keySelector;
	        this.hasKey = false;
	        if (typeof compare === 'function') {
	            this.compare = compare;
	        }
	    }
	    DistinctUntilChangedSubscriber.prototype.compare = function (x, y) {
	        return x === y;
	    };
	    DistinctUntilChangedSubscriber.prototype._next = function (value) {
	        var keySelector = this.keySelector;
	        var key = value;
	        if (keySelector) {
	            key = tryCatch_1.tryCatch(this.keySelector)(value);
	            if (key === errorObject_1.errorObject) {
	                return this.destination.error(errorObject_1.errorObject.e);
	            }
	        }
	        var result = false;
	        if (this.hasKey) {
	            result = tryCatch_1.tryCatch(this.compare)(this.key, key);
	            if (result === errorObject_1.errorObject) {
	                return this.destination.error(errorObject_1.errorObject.e);
	            }
	        }
	        else {
	            this.hasKey = true;
	        }
	        if (Boolean(result) === false) {
	            this.key = key;
	            this.destination.next(value);
	        }
	    };
	    return DistinctUntilChangedSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 183 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var distinctUntilKeyChanged_1 = __webpack_require__(184);
	Observable_1.Observable.prototype.distinctUntilKeyChanged = distinctUntilKeyChanged_1.distinctUntilKeyChanged;


/***/ },
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var distinctUntilChanged_1 = __webpack_require__(182);
	/**
	 * Returns an Observable that emits all items emitted by the source Observable that are distinct by comparison from the previous item,
	 * using a property accessed by using the key provided to check if the two items are distinct.
	 * If a comparator function is provided, then it will be called for each item to test for whether or not that value should be emitted.
	 * If a comparator function is not provided, an equality check is used by default.
	 * @param {string} key string key for object property lookup on each item.
	 * @param {function} [compare] optional comparison function called to test if an item is distinct from the previous item in the source.
	 * @return {Observable} an Observable that emits items from the source Observable with distinct values based on the key specified.
	 * @method distinctUntilKeyChanged
	 * @owner Observable
	 */
	function distinctUntilKeyChanged(key, compare) {
	    return distinctUntilChanged_1.distinctUntilChanged.call(this, function (x, y) {
	        if (compare) {
	            return compare(x[key], y[key]);
	        }
	        return x[key] === y[key];
	    });
	}
	exports.distinctUntilKeyChanged = distinctUntilKeyChanged;


/***/ },
/* 185 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var do_1 = __webpack_require__(186);
	Observable_1.Observable.prototype.do = do_1._do;
	Observable_1.Observable.prototype._do = do_1._do;


/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Perform a side effect for every emission on the source Observable, but return
	 * an Observable that is identical to the source.
	 *
	 * <span class="informal">Intercepts each emission on the source and runs a
	 * function, but returns an output which is identical to the source.</span>
	 *
	 * <img src="./img/do.png" width="100%">
	 *
	 * Returns a mirrored Observable of the source Observable, but modified so that
	 * the provided Observer is called to perform a side effect for every value,
	 * error, and completion emitted by the source. Any errors that are thrown in
	 * the aforementioned Observer or handlers are safely sent down the error path
	 * of the output Observable.
	 *
	 * This operator is useful for debugging your Observables for the correct values
	 * or performing other side effects.
	 *
	 * Note: this is different to a `subscribe` on the Observable. If the Observable
	 * returned by `do` is not subscribed, the side effects specified by the
	 * Observer will never happen. `do` therefore simply spies on existing
	 * execution, it does not trigger an execution to happen like `subscribe` does.
	 *
	 * @example <caption>Map every every click to the clientX position of that click, while also logging the click event</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var positions = clicks
	 *   .do(ev => console.log(ev))
	 *   .map(ev => ev.clientX);
	 * positions.subscribe(x => console.log(x));
	 *
	 * @see {@link map}
	 * @see {@link subscribe}
	 *
	 * @param {Observer|function} [nextOrObserver] A normal Observer object or a
	 * callback for `next`.
	 * @param {function} [error] Callback for errors in the source.
	 * @param {function} [complete] Callback for the completion of the source.
	 * @return {Observable} An Observable identical to the source, but runs the
	 * specified Observer or callback(s) for each item.
	 * @method do
	 * @name do
	 * @owner Observable
	 */
	function _do(nextOrObserver, error, complete) {
	    return this.lift(new DoOperator(nextOrObserver, error, complete));
	}
	exports._do = _do;
	var DoOperator = (function () {
	    function DoOperator(nextOrObserver, error, complete) {
	        this.nextOrObserver = nextOrObserver;
	        this.error = error;
	        this.complete = complete;
	    }
	    DoOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new DoSubscriber(subscriber, this.nextOrObserver, this.error, this.complete));
	    };
	    return DoOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var DoSubscriber = (function (_super) {
	    __extends(DoSubscriber, _super);
	    function DoSubscriber(destination, nextOrObserver, error, complete) {
	        _super.call(this, destination);
	        var safeSubscriber = new Subscriber_1.Subscriber(nextOrObserver, error, complete);
	        safeSubscriber.syncErrorThrowable = true;
	        this.add(safeSubscriber);
	        this.safeSubscriber = safeSubscriber;
	    }
	    DoSubscriber.prototype._next = function (value) {
	        var safeSubscriber = this.safeSubscriber;
	        safeSubscriber.next(value);
	        if (safeSubscriber.syncErrorThrown) {
	            this.destination.error(safeSubscriber.syncErrorValue);
	        }
	        else {
	            this.destination.next(value);
	        }
	    };
	    DoSubscriber.prototype._error = function (err) {
	        var safeSubscriber = this.safeSubscriber;
	        safeSubscriber.error(err);
	        if (safeSubscriber.syncErrorThrown) {
	            this.destination.error(safeSubscriber.syncErrorValue);
	        }
	        else {
	            this.destination.error(err);
	        }
	    };
	    DoSubscriber.prototype._complete = function () {
	        var safeSubscriber = this.safeSubscriber;
	        safeSubscriber.complete();
	        if (safeSubscriber.syncErrorThrown) {
	            this.destination.error(safeSubscriber.syncErrorValue);
	        }
	        else {
	            this.destination.complete();
	        }
	    };
	    return DoSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 187 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var exhaust_1 = __webpack_require__(188);
	Observable_1.Observable.prototype.exhaust = exhaust_1.exhaust;


/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Converts a higher-order Observable into a first-order Observable by dropping
	 * inner Observables while the previous inner Observable has not yet completed.
	 *
	 * <span class="informal">Flattens an Observable-of-Observables by dropping the
	 * next inner Observables while the current inner is still executing.</span>
	 *
	 * <img src="./img/exhaust.png" width="100%">
	 *
	 * `exhaust` subscribes to an Observable that emits Observables, also known as a
	 * higher-order Observable. Each time it observes one of these emitted inner
	 * Observables, the output Observable begins emitting the items emitted by that
	 * inner Observable. So far, it behaves like {@link mergeAll}. However,
	 * `exhaust` ignores every new inner Observable if the previous Observable has
	 * not yet completed. Once that one completes, it will accept and flatten the
	 * next inner Observable and repeat this process.
	 *
	 * @example <caption>Run a finite timer for each click, only if there is no currently active timer</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
	 * var result = higherOrder.exhaust();
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link combineAll}
	 * @see {@link concatAll}
	 * @see {@link switch}
	 * @see {@link mergeAll}
	 * @see {@link exhaustMap}
	 * @see {@link zipAll}
	 *
	 * @return {Observable} Returns an Observable that takes a source of Observables
	 * and propagates the first observable exclusively until it completes before
	 * subscribing to the next.
	 * @method exhaust
	 * @owner Observable
	 */
	function exhaust() {
	    return this.lift(new SwitchFirstOperator());
	}
	exports.exhaust = exhaust;
	var SwitchFirstOperator = (function () {
	    function SwitchFirstOperator() {
	    }
	    SwitchFirstOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SwitchFirstSubscriber(subscriber));
	    };
	    return SwitchFirstOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SwitchFirstSubscriber = (function (_super) {
	    __extends(SwitchFirstSubscriber, _super);
	    function SwitchFirstSubscriber(destination) {
	        _super.call(this, destination);
	        this.hasCompleted = false;
	        this.hasSubscription = false;
	    }
	    SwitchFirstSubscriber.prototype._next = function (value) {
	        if (!this.hasSubscription) {
	            this.hasSubscription = true;
	            this.add(subscribeToResult_1.subscribeToResult(this, value));
	        }
	    };
	    SwitchFirstSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (!this.hasSubscription) {
	            this.destination.complete();
	        }
	    };
	    SwitchFirstSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.remove(innerSub);
	        this.hasSubscription = false;
	        if (this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return SwitchFirstSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 189 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var exhaustMap_1 = __webpack_require__(190);
	Observable_1.Observable.prototype.exhaustMap = exhaustMap_1.exhaustMap;


/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Projects each source value to an Observable which is merged in the output
	 * Observable only if the previous projected Observable has completed.
	 *
	 * <span class="informal">Maps each value to an Observable, then flattens all of
	 * these inner Observables using {@link exhaust}.</span>
	 *
	 * <img src="./img/exhaustMap.png" width="100%">
	 *
	 * Returns an Observable that emits items based on applying a function that you
	 * supply to each item emitted by the source Observable, where that function
	 * returns an (so-called "inner") Observable. When it projects a source value to
	 * an Observable, the output Observable begins emitting the items emitted by
	 * that projected Observable. However, `exhaustMap` ignores every new projected
	 * Observable if the previous projected Observable has not yet completed. Once
	 * that one completes, it will accept and flatten the next projected Observable
	 * and repeat this process.
	 *
	 * @example <caption>Run a finite timer for each click, only if there is no currently active timer</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.exhaustMap((ev) => Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatMap}
	 * @see {@link exhaust}
	 * @see {@link mergeMap}
	 * @see {@link switchMap}
	 *
	 * @param {function(value: T, ?index: number): Observable} project A function
	 * that, when applied to an item emitted by the source Observable, returns an
	 * Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @return {Observable} An Observable containing projected Observables
	 * of each item of the source, ignoring projected Observables that start before
	 * their preceding Observable has completed.
	 * @method exhaustMap
	 * @owner Observable
	 */
	function exhaustMap(project, resultSelector) {
	    return this.lift(new SwitchFirstMapOperator(project, resultSelector));
	}
	exports.exhaustMap = exhaustMap;
	var SwitchFirstMapOperator = (function () {
	    function SwitchFirstMapOperator(project, resultSelector) {
	        this.project = project;
	        this.resultSelector = resultSelector;
	    }
	    SwitchFirstMapOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SwitchFirstMapSubscriber(subscriber, this.project, this.resultSelector));
	    };
	    return SwitchFirstMapOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SwitchFirstMapSubscriber = (function (_super) {
	    __extends(SwitchFirstMapSubscriber, _super);
	    function SwitchFirstMapSubscriber(destination, project, resultSelector) {
	        _super.call(this, destination);
	        this.project = project;
	        this.resultSelector = resultSelector;
	        this.hasSubscription = false;
	        this.hasCompleted = false;
	        this.index = 0;
	    }
	    SwitchFirstMapSubscriber.prototype._next = function (value) {
	        if (!this.hasSubscription) {
	            this.tryNext(value);
	        }
	    };
	    SwitchFirstMapSubscriber.prototype.tryNext = function (value) {
	        var index = this.index++;
	        var destination = this.destination;
	        try {
	            var result = this.project(value, index);
	            this.hasSubscription = true;
	            this.add(subscribeToResult_1.subscribeToResult(this, result, value, index));
	        }
	        catch (err) {
	            destination.error(err);
	        }
	    };
	    SwitchFirstMapSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (!this.hasSubscription) {
	            this.destination.complete();
	        }
	    };
	    SwitchFirstMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
	        if (resultSelector) {
	            this.trySelectResult(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        else {
	            destination.next(innerValue);
	        }
	    };
	    SwitchFirstMapSubscriber.prototype.trySelectResult = function (outerValue, innerValue, outerIndex, innerIndex) {
	        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
	        try {
	            var result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
	            destination.next(result);
	        }
	        catch (err) {
	            destination.error(err);
	        }
	    };
	    SwitchFirstMapSubscriber.prototype.notifyError = function (err) {
	        this.destination.error(err);
	    };
	    SwitchFirstMapSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.remove(innerSub);
	        this.hasSubscription = false;
	        if (this.hasCompleted) {
	            this.destination.complete();
	        }
	    };
	    return SwitchFirstMapSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var expand_1 = __webpack_require__(192);
	Observable_1.Observable.prototype.expand = expand_1.expand;


/***/ },
/* 192 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Recursively projects each source value to an Observable which is merged in
	 * the output Observable.
	 *
	 * <span class="informal">It's similar to {@link mergeMap}, but applies the
	 * projection function to every source value as well as every output value.
	 * It's recursive.</span>
	 *
	 * <img src="./img/expand.png" width="100%">
	 *
	 * Returns an Observable that emits items based on applying a function that you
	 * supply to each item emitted by the source Observable, where that function
	 * returns an Observable, and then merging those resulting Observables and
	 * emitting the results of this merger. *Expand* will re-emit on the output
	 * Observable every source value. Then, each output value is given to the
	 * `project` function which returns an inner Observable to be merged on the
	 * output Observable. Those output values resulting from the projection are also
	 * given to the `project` function to produce new output values. This is how
	 * *expand* behaves recursively.
	 *
	 * @example <caption>Start emitting the powers of two on every click, at most 10 of them</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var powersOfTwo = clicks
	 *   .mapTo(1)
	 *   .expand(x => Rx.Observable.of(2 * x).delay(1000))
	 *   .take(10);
	 * powersOfTwo.subscribe(x => console.log(x));
	 *
	 * @see {@link mergeMap}
	 * @see {@link mergeScan}
	 *
	 * @param {function(value: T, index: number) => Observable} project A function
	 * that, when applied to an item emitted by the source or the output Observable,
	 * returns an Observable.
	 * @param {number} [concurrent=Number.POSITIVE_INFINITY] Maximum number of input
	 * Observables being subscribed to concurrently.
	 * @param {Scheduler} [scheduler=null] The Scheduler to use for subscribing to
	 * each projected inner Observable.
	 * @return {Observable} An Observable that emits the source values and also
	 * result of applying the projection function to each value emitted on the
	 * output Observable and and merging the results of the Observables obtained
	 * from this transformation.
	 * @method expand
	 * @owner Observable
	 */
	function expand(project, concurrent, scheduler) {
	    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	    if (scheduler === void 0) { scheduler = undefined; }
	    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
	    return this.lift(new ExpandOperator(project, concurrent, scheduler));
	}
	exports.expand = expand;
	var ExpandOperator = (function () {
	    function ExpandOperator(project, concurrent, scheduler) {
	        this.project = project;
	        this.concurrent = concurrent;
	        this.scheduler = scheduler;
	    }
	    ExpandOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler));
	    };
	    return ExpandOperator;
	}());
	exports.ExpandOperator = ExpandOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ExpandSubscriber = (function (_super) {
	    __extends(ExpandSubscriber, _super);
	    function ExpandSubscriber(destination, project, concurrent, scheduler) {
	        _super.call(this, destination);
	        this.project = project;
	        this.concurrent = concurrent;
	        this.scheduler = scheduler;
	        this.index = 0;
	        this.active = 0;
	        this.hasCompleted = false;
	        if (concurrent < Number.POSITIVE_INFINITY) {
	            this.buffer = [];
	        }
	    }
	    ExpandSubscriber.dispatch = function (arg) {
	        var subscriber = arg.subscriber, result = arg.result, value = arg.value, index = arg.index;
	        subscriber.subscribeToProjection(result, value, index);
	    };
	    ExpandSubscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        if (destination.closed) {
	            this._complete();
	            return;
	        }
	        var index = this.index++;
	        if (this.active < this.concurrent) {
	            destination.next(value);
	            var result = tryCatch_1.tryCatch(this.project)(value, index);
	            if (result === errorObject_1.errorObject) {
	                destination.error(errorObject_1.errorObject.e);
	            }
	            else if (!this.scheduler) {
	                this.subscribeToProjection(result, value, index);
	            }
	            else {
	                var state = { subscriber: this, result: result, value: value, index: index };
	                this.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
	            }
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    ExpandSubscriber.prototype.subscribeToProjection = function (result, value, index) {
	        this.active++;
	        this.add(subscribeToResult_1.subscribeToResult(this, result, value, index));
	    };
	    ExpandSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.hasCompleted && this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    ExpandSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this._next(innerValue);
	    };
	    ExpandSubscriber.prototype.notifyComplete = function (innerSub) {
	        var buffer = this.buffer;
	        this.remove(innerSub);
	        this.active--;
	        if (buffer && buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        if (this.hasCompleted && this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    return ExpandSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.ExpandSubscriber = ExpandSubscriber;


/***/ },
/* 193 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var elementAt_1 = __webpack_require__(194);
	Observable_1.Observable.prototype.elementAt = elementAt_1.elementAt;


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var ArgumentOutOfRangeError_1 = __webpack_require__(195);
	/**
	 * Emits the single value at the specified `index` in a sequence of emissions
	 * from the source Observable.
	 *
	 * <span class="informal">Emits only the i-th value, then completes.</span>
	 *
	 * <img src="./img/elementAt.png" width="100%">
	 *
	 * `elementAt` returns an Observable that emits the item at the specified
	 * `index` in the source Observable, or a default value if that `index` is out
	 * of range and the `default` argument is provided. If the `default` argument is
	 * not given and the `index` is out of range, the output Observable will emit an
	 * `ArgumentOutOfRangeError` error.
	 *
	 * @example <caption>Emit only the third click event</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.elementAt(2);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link first}
	 * @see {@link last}
	 * @see {@link skip}
	 * @see {@link single}
	 * @see {@link take}
	 *
	 * @throws {ArgumentOutOfRangeError} When using `elementAt(i)`, it delivers an
	 * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0` or the
	 * Observable has completed before emitting the i-th `next` notification.
	 *
	 * @param {number} index Is the number `i` for the i-th source emission that has
	 * happened since the subscription, starting from the number `0`.
	 * @param {T} [defaultValue] The default value returned for missing indices.
	 * @return {Observable} An Observable that emits a single item, if it is found.
	 * Otherwise, will emit the default value if given. If not, then emits an error.
	 * @method elementAt
	 * @owner Observable
	 */
	function elementAt(index, defaultValue) {
	    return this.lift(new ElementAtOperator(index, defaultValue));
	}
	exports.elementAt = elementAt;
	var ElementAtOperator = (function () {
	    function ElementAtOperator(index, defaultValue) {
	        this.index = index;
	        this.defaultValue = defaultValue;
	        if (index < 0) {
	            throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;
	        }
	    }
	    ElementAtOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ElementAtSubscriber(subscriber, this.index, this.defaultValue));
	    };
	    return ElementAtOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ElementAtSubscriber = (function (_super) {
	    __extends(ElementAtSubscriber, _super);
	    function ElementAtSubscriber(destination, index, defaultValue) {
	        _super.call(this, destination);
	        this.index = index;
	        this.defaultValue = defaultValue;
	    }
	    ElementAtSubscriber.prototype._next = function (x) {
	        if (this.index-- === 0) {
	            this.destination.next(x);
	            this.destination.complete();
	        }
	    };
	    ElementAtSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        if (this.index >= 0) {
	            if (typeof this.defaultValue !== 'undefined') {
	                destination.next(this.defaultValue);
	            }
	            else {
	                destination.error(new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError);
	            }
	        }
	        destination.complete();
	    };
	    return ElementAtSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 195 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/**
	 * An error thrown when an element was queried at a certain index of an
	 * Observable, but no such index or position exists in that sequence.
	 *
	 * @see {@link elementAt}
	 * @see {@link take}
	 * @see {@link takeLast}
	 *
	 * @class ArgumentOutOfRangeError
	 */
	var ArgumentOutOfRangeError = (function (_super) {
	    __extends(ArgumentOutOfRangeError, _super);
	    function ArgumentOutOfRangeError() {
	        var err = _super.call(this, 'argument out of range');
	        this.name = err.name = 'ArgumentOutOfRangeError';
	        this.stack = err.stack;
	        this.message = err.message;
	    }
	    return ArgumentOutOfRangeError;
	}(Error));
	exports.ArgumentOutOfRangeError = ArgumentOutOfRangeError;


/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var filter_1 = __webpack_require__(197);
	Observable_1.Observable.prototype.filter = filter_1.filter;


/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Filter items emitted by the source Observable by only emitting those that
	 * satisfy a specified predicate.
	 *
	 * <span class="informal">Like
	 * [Array.prototype.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
	 * it only emits a value from the source if it passes a criterion function.</span>
	 *
	 * <img src="./img/filter.png" width="100%">
	 *
	 * Similar to the well-known `Array.prototype.filter` method, this operator
	 * takes values from the source Observable, passes them through a `predicate`
	 * function and only emits those values that yielded `true`.
	 *
	 * @example <caption>Emit only click events whose target was a DIV element</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var clicksOnDivs = clicks.filter(ev => ev.target.tagName === 'DIV');
	 * clicksOnDivs.subscribe(x => console.log(x));
	 *
	 * @see {@link distinct}
	 * @see {@link distinctKey}
	 * @see {@link distinctUntilChanged}
	 * @see {@link distinctUntilKeyChanged}
	 * @see {@link ignoreElements}
	 * @see {@link partition}
	 * @see {@link skip}
	 *
	 * @param {function(value: T, index: number): boolean} predicate A function that
	 * evaluates each value emitted by the source Observable. If it returns `true`,
	 * the value is emitted, if `false` the value is not passed to the output
	 * Observable. The `index` parameter is the number `i` for the i-th source
	 * emission that has happened since the subscription, starting from the number
	 * `0`.
	 * @param {any} [thisArg] An optional argument to determine the value of `this`
	 * in the `predicate` function.
	 * @return {Observable} An Observable of values from the source that were
	 * allowed by the `predicate` function.
	 * @method filter
	 * @owner Observable
	 */
	function filter(predicate, thisArg) {
	    return this.lift(new FilterOperator(predicate, thisArg));
	}
	exports.filter = filter;
	var FilterOperator = (function () {
	    function FilterOperator(predicate, thisArg) {
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	    }
	    FilterOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new FilterSubscriber(subscriber, this.predicate, this.thisArg));
	    };
	    return FilterOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var FilterSubscriber = (function (_super) {
	    __extends(FilterSubscriber, _super);
	    function FilterSubscriber(destination, predicate, thisArg) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	        this.count = 0;
	        this.predicate = predicate;
	    }
	    // the try catch block below is left specifically for
	    // optimization and perf reasons. a tryCatcher is not necessary here.
	    FilterSubscriber.prototype._next = function (value) {
	        var result;
	        try {
	            result = this.predicate.call(this.thisArg, value, this.count++);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            this.destination.next(value);
	        }
	    };
	    return FilterSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var finally_1 = __webpack_require__(199);
	Observable_1.Observable.prototype.finally = finally_1._finally;
	Observable_1.Observable.prototype._finally = finally_1._finally;


/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var Subscription_1 = __webpack_require__(21);
	/**
	 * Returns an Observable that mirrors the source Observable, but will call a specified function when
	 * the source terminates on complete or error.
	 * @param {function} callback function to be called when source terminates.
	 * @return {Observable} an Observable that mirrors the source, but will call the specified function on termination.
	 * @method finally
	 * @owner Observable
	 */
	function _finally(callback) {
	    return this.lift(new FinallyOperator(callback));
	}
	exports._finally = _finally;
	var FinallyOperator = (function () {
	    function FinallyOperator(callback) {
	        this.callback = callback;
	    }
	    FinallyOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new FinallySubscriber(subscriber, this.callback));
	    };
	    return FinallyOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var FinallySubscriber = (function (_super) {
	    __extends(FinallySubscriber, _super);
	    function FinallySubscriber(destination, callback) {
	        _super.call(this, destination);
	        this.add(new Subscription_1.Subscription(callback));
	    }
	    return FinallySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 200 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var find_1 = __webpack_require__(201);
	Observable_1.Observable.prototype.find = find_1.find;


/***/ },
/* 201 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Emits only the first value emitted by the source Observable that meets some
	 * condition.
	 *
	 * <span class="informal">Finds the first value that passes some test and emits
	 * that.</span>
	 *
	 * <img src="./img/find.png" width="100%">
	 *
	 * `find` searches for the first item in the source Observable that matches the
	 * specified condition embodied by the `predicate`, and returns the first
	 * occurrence in the source. Unlike {@link first}, the `predicate` is required
	 * in `find`, and does not emit an error if a valid value is not found.
	 *
	 * @example <caption>Find and emit the first click that happens on a DIV element</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.find(ev => ev.target.tagName === 'DIV');
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link filter}
	 * @see {@link first}
	 * @see {@link findIndex}
	 * @see {@link take}
	 *
	 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
	 * A function called with each item to test for condition matching.
	 * @param {any} [thisArg] An optional argument to determine the value of `this`
	 * in the `predicate` function.
	 * @return {Observable<T>} An Observable of the first item that matches the
	 * condition.
	 * @method find
	 * @owner Observable
	 */
	function find(predicate, thisArg) {
	    if (typeof predicate !== 'function') {
	        throw new TypeError('predicate is not a function');
	    }
	    return this.lift(new FindValueOperator(predicate, this, false, thisArg));
	}
	exports.find = find;
	var FindValueOperator = (function () {
	    function FindValueOperator(predicate, source, yieldIndex, thisArg) {
	        this.predicate = predicate;
	        this.source = source;
	        this.yieldIndex = yieldIndex;
	        this.thisArg = thisArg;
	    }
	    FindValueOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new FindValueSubscriber(observer, this.predicate, this.source, this.yieldIndex, this.thisArg));
	    };
	    return FindValueOperator;
	}());
	exports.FindValueOperator = FindValueOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var FindValueSubscriber = (function (_super) {
	    __extends(FindValueSubscriber, _super);
	    function FindValueSubscriber(destination, predicate, source, yieldIndex, thisArg) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.source = source;
	        this.yieldIndex = yieldIndex;
	        this.thisArg = thisArg;
	        this.index = 0;
	    }
	    FindValueSubscriber.prototype.notifyComplete = function (value) {
	        var destination = this.destination;
	        destination.next(value);
	        destination.complete();
	    };
	    FindValueSubscriber.prototype._next = function (value) {
	        var _a = this, predicate = _a.predicate, thisArg = _a.thisArg;
	        var index = this.index++;
	        try {
	            var result = predicate.call(thisArg || this, value, index, this.source);
	            if (result) {
	                this.notifyComplete(this.yieldIndex ? index : value);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    FindValueSubscriber.prototype._complete = function () {
	        this.notifyComplete(this.yieldIndex ? -1 : undefined);
	    };
	    return FindValueSubscriber;
	}(Subscriber_1.Subscriber));
	exports.FindValueSubscriber = FindValueSubscriber;


/***/ },
/* 202 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var findIndex_1 = __webpack_require__(203);
	Observable_1.Observable.prototype.findIndex = findIndex_1.findIndex;


/***/ },
/* 203 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var find_1 = __webpack_require__(201);
	/**
	 * Emits only the index of the first value emitted by the source Observable that
	 * meets some condition.
	 *
	 * <span class="informal">It's like {@link find}, but emits the index of the
	 * found value, not the value itself.</span>
	 *
	 * <img src="./img/findIndex.png" width="100%">
	 *
	 * `findIndex` searches for the first item in the source Observable that matches
	 * the specified condition embodied by the `predicate`, and returns the
	 * (zero-based) index of the first occurrence in the source. Unlike
	 * {@link first}, the `predicate` is required in `findIndex`, and does not emit
	 * an error if a valid value is not found.
	 *
	 * @example <caption>Emit the index of first click that happens on a DIV element</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.findIndex(ev => ev.target.tagName === 'DIV');
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link filter}
	 * @see {@link find}
	 * @see {@link first}
	 * @see {@link take}
	 *
	 * @param {function(value: T, index: number, source: Observable<T>): boolean} predicate
	 * A function called with each item to test for condition matching.
	 * @param {any} [thisArg] An optional argument to determine the value of `this`
	 * in the `predicate` function.
	 * @return {Observable} An Observable of the index of the first item that
	 * matches the condition.
	 * @method find
	 * @owner Observable
	 */
	function findIndex(predicate, thisArg) {
	    return this.lift(new find_1.FindValueOperator(predicate, this, true, thisArg));
	}
	exports.findIndex = findIndex;


/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var first_1 = __webpack_require__(205);
	Observable_1.Observable.prototype.first = first_1.first;


/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var EmptyError_1 = __webpack_require__(206);
	/**
	 * Emits only the first value (or the first value that meets some condition)
	 * emitted by the source Observable.
	 *
	 * <span class="informal">Emits only the first value. Or emits only the first
	 * value that passes some test.</span>
	 *
	 * <img src="./img/first.png" width="100%">
	 *
	 * If called with no arguments, `first` emits the first value of the source
	 * Observable, then completes. If called with a `predicate` function, `first`
	 * emits the first value of the source that matches the specified condition. It
	 * may also take a `resultSelector` function to produce the output value from
	 * the input value, and a `defaultValue` to emit in case the source completes
	 * before it is able to emit a valid value. Throws an error if `defaultValue`
	 * was not provided and a matching element is not found.
	 *
	 * @example <caption>Emit only the first click that happens on the DOM</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.first();
	 * result.subscribe(x => console.log(x));
	 *
	 * @example <caption>Emits the first click that happens on a DIV</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.first(ev => ev.target.tagName === 'DIV');
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link filter}
	 * @see {@link find}
	 * @see {@link take}
	 *
	 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
	 * callback if the Observable completes before any `next` notification was sent.
	 *
	 * @param {function(value: T, index: number, source: Observable<T>): boolean} [predicate]
	 * An optional function called with each item to test for condition matching.
	 * @param {function(value: T, index: number): R} [resultSelector] A function to
	 * produce the value on the output Observable based on the values
	 * and the indices of the source Observable. The arguments passed to this
	 * function are:
	 * - `value`: the value that was emitted on the source.
	 * - `index`: the "index" of the value from the source.
	 * @param {R} [defaultValue] The default value emitted in case no valid value
	 * was found on the source.
	 * @return {Observable<T|R>} an Observable of the first item that matches the
	 * condition.
	 * @method first
	 * @owner Observable
	 */
	function first(predicate, resultSelector, defaultValue) {
	    return this.lift(new FirstOperator(predicate, resultSelector, defaultValue, this));
	}
	exports.first = first;
	var FirstOperator = (function () {
	    function FirstOperator(predicate, resultSelector, defaultValue, source) {
	        this.predicate = predicate;
	        this.resultSelector = resultSelector;
	        this.defaultValue = defaultValue;
	        this.source = source;
	    }
	    FirstOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new FirstSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source));
	    };
	    return FirstOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var FirstSubscriber = (function (_super) {
	    __extends(FirstSubscriber, _super);
	    function FirstSubscriber(destination, predicate, resultSelector, defaultValue, source) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.resultSelector = resultSelector;
	        this.defaultValue = defaultValue;
	        this.source = source;
	        this.index = 0;
	        this.hasCompleted = false;
	    }
	    FirstSubscriber.prototype._next = function (value) {
	        var index = this.index++;
	        if (this.predicate) {
	            this._tryPredicate(value, index);
	        }
	        else {
	            this._emit(value, index);
	        }
	    };
	    FirstSubscriber.prototype._tryPredicate = function (value, index) {
	        var result;
	        try {
	            result = this.predicate(value, index, this.source);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            this._emit(value, index);
	        }
	    };
	    FirstSubscriber.prototype._emit = function (value, index) {
	        if (this.resultSelector) {
	            this._tryResultSelector(value, index);
	            return;
	        }
	        this._emitFinal(value);
	    };
	    FirstSubscriber.prototype._tryResultSelector = function (value, index) {
	        var result;
	        try {
	            result = this.resultSelector(value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this._emitFinal(result);
	    };
	    FirstSubscriber.prototype._emitFinal = function (value) {
	        var destination = this.destination;
	        destination.next(value);
	        destination.complete();
	        this.hasCompleted = true;
	    };
	    FirstSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        if (!this.hasCompleted && typeof this.defaultValue !== 'undefined') {
	            destination.next(this.defaultValue);
	            destination.complete();
	        }
	        else if (!this.hasCompleted) {
	            destination.error(new EmptyError_1.EmptyError);
	        }
	    };
	    return FirstSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 206 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	/**
	 * An error thrown when an Observable or a sequence was queried but has no
	 * elements.
	 *
	 * @see {@link first}
	 * @see {@link last}
	 * @see {@link single}
	 *
	 * @class EmptyError
	 */
	var EmptyError = (function (_super) {
	    __extends(EmptyError, _super);
	    function EmptyError() {
	        var err = _super.call(this, 'no elements in sequence');
	        this.name = err.name = 'EmptyError';
	        this.stack = err.stack;
	        this.message = err.message;
	    }
	    return EmptyError;
	}(Error));
	exports.EmptyError = EmptyError;


/***/ },
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var groupBy_1 = __webpack_require__(208);
	Observable_1.Observable.prototype.groupBy = groupBy_1.groupBy;


/***/ },
/* 208 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var Subscription_1 = __webpack_require__(21);
	var Observable_1 = __webpack_require__(16);
	var Subject_1 = __webpack_require__(15);
	var Map_1 = __webpack_require__(209);
	var FastMap_1 = __webpack_require__(211);
	/**
	 * Groups the items emitted by an Observable according to a specified criterion,
	 * and emits these grouped items as `GroupedObservables`, one
	 * {@link GroupedObservable} per group.
	 *
	 * <img src="./img/groupBy.png" width="100%">
	 *
	 * @param {function(value: T): K} keySelector a function that extracts the key
	 * for each item.
	 * @param {function(value: T): R} [elementSelector] a function that extracts the
	 * return element for each item.
	 * @param {function(grouped: GroupedObservable<K,R>): Observable<any>} [durationSelector]
	 * a function that returns an Observable to determine how long each group should
	 * exist.
	 * @return {Observable<GroupedObservable<K,R>>} an Observable that emits
	 * GroupedObservables, each of which corresponds to a unique key value and each
	 * of which emits those items from the source Observable that share that key
	 * value.
	 * @method groupBy
	 * @owner Observable
	 */
	function groupBy(keySelector, elementSelector, durationSelector) {
	    return this.lift(new GroupByOperator(this, keySelector, elementSelector, durationSelector));
	}
	exports.groupBy = groupBy;
	var GroupByOperator = (function () {
	    function GroupByOperator(source, keySelector, elementSelector, durationSelector) {
	        this.source = source;
	        this.keySelector = keySelector;
	        this.elementSelector = elementSelector;
	        this.durationSelector = durationSelector;
	    }
	    GroupByOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new GroupBySubscriber(subscriber, this.keySelector, this.elementSelector, this.durationSelector));
	    };
	    return GroupByOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var GroupBySubscriber = (function (_super) {
	    __extends(GroupBySubscriber, _super);
	    function GroupBySubscriber(destination, keySelector, elementSelector, durationSelector) {
	        _super.call(this, destination);
	        this.keySelector = keySelector;
	        this.elementSelector = elementSelector;
	        this.durationSelector = durationSelector;
	        this.groups = null;
	        this.attemptedToUnsubscribe = false;
	        this.count = 0;
	    }
	    GroupBySubscriber.prototype._next = function (value) {
	        var key;
	        try {
	            key = this.keySelector(value);
	        }
	        catch (err) {
	            this.error(err);
	            return;
	        }
	        this._group(value, key);
	    };
	    GroupBySubscriber.prototype._group = function (value, key) {
	        var groups = this.groups;
	        if (!groups) {
	            groups = this.groups = typeof key === 'string' ? new FastMap_1.FastMap() : new Map_1.Map();
	        }
	        var group = groups.get(key);
	        var element;
	        if (this.elementSelector) {
	            try {
	                element = this.elementSelector(value);
	            }
	            catch (err) {
	                this.error(err);
	            }
	        }
	        else {
	            element = value;
	        }
	        if (!group) {
	            groups.set(key, group = new Subject_1.Subject());
	            var groupedObservable = new GroupedObservable(key, group, this);
	            this.destination.next(groupedObservable);
	            if (this.durationSelector) {
	                var duration = void 0;
	                try {
	                    duration = this.durationSelector(new GroupedObservable(key, group));
	                }
	                catch (err) {
	                    this.error(err);
	                    return;
	                }
	                this.add(duration.subscribe(new GroupDurationSubscriber(key, group, this)));
	            }
	        }
	        if (!group.closed) {
	            group.next(element);
	        }
	    };
	    GroupBySubscriber.prototype._error = function (err) {
	        var groups = this.groups;
	        if (groups) {
	            groups.forEach(function (group, key) {
	                group.error(err);
	            });
	            groups.clear();
	        }
	        this.destination.error(err);
	    };
	    GroupBySubscriber.prototype._complete = function () {
	        var groups = this.groups;
	        if (groups) {
	            groups.forEach(function (group, key) {
	                group.complete();
	            });
	            groups.clear();
	        }
	        this.destination.complete();
	    };
	    GroupBySubscriber.prototype.removeGroup = function (key) {
	        this.groups.delete(key);
	    };
	    GroupBySubscriber.prototype.unsubscribe = function () {
	        if (!this.closed && !this.attemptedToUnsubscribe) {
	            this.attemptedToUnsubscribe = true;
	            if (this.count === 0) {
	                _super.prototype.unsubscribe.call(this);
	            }
	        }
	    };
	    return GroupBySubscriber;
	}(Subscriber_1.Subscriber));
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var GroupDurationSubscriber = (function (_super) {
	    __extends(GroupDurationSubscriber, _super);
	    function GroupDurationSubscriber(key, group, parent) {
	        _super.call(this);
	        this.key = key;
	        this.group = group;
	        this.parent = parent;
	    }
	    GroupDurationSubscriber.prototype._next = function (value) {
	        this._complete();
	    };
	    GroupDurationSubscriber.prototype._error = function (err) {
	        var group = this.group;
	        if (!group.closed) {
	            group.error(err);
	        }
	        this.parent.removeGroup(this.key);
	    };
	    GroupDurationSubscriber.prototype._complete = function () {
	        var group = this.group;
	        if (!group.closed) {
	            group.complete();
	        }
	        this.parent.removeGroup(this.key);
	    };
	    return GroupDurationSubscriber;
	}(Subscriber_1.Subscriber));
	/**
	 * An Observable representing values belonging to the same group represented by
	 * a common key. The values emitted by a GroupedObservable come from the source
	 * Observable. The common key is available as the field `key` on a
	 * GroupedObservable instance.
	 *
	 * @class GroupedObservable<K, T>
	 */
	var GroupedObservable = (function (_super) {
	    __extends(GroupedObservable, _super);
	    function GroupedObservable(key, groupSubject, refCountSubscription) {
	        _super.call(this);
	        this.key = key;
	        this.groupSubject = groupSubject;
	        this.refCountSubscription = refCountSubscription;
	    }
	    GroupedObservable.prototype._subscribe = function (subscriber) {
	        var subscription = new Subscription_1.Subscription();
	        var _a = this, refCountSubscription = _a.refCountSubscription, groupSubject = _a.groupSubject;
	        if (refCountSubscription && !refCountSubscription.closed) {
	            subscription.add(new InnerRefCountSubscription(refCountSubscription));
	        }
	        subscription.add(groupSubject.subscribe(subscriber));
	        return subscription;
	    };
	    return GroupedObservable;
	}(Observable_1.Observable));
	exports.GroupedObservable = GroupedObservable;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var InnerRefCountSubscription = (function (_super) {
	    __extends(InnerRefCountSubscription, _super);
	    function InnerRefCountSubscription(parent) {
	        _super.call(this);
	        this.parent = parent;
	        parent.count++;
	    }
	    InnerRefCountSubscription.prototype.unsubscribe = function () {
	        var parent = this.parent;
	        if (!parent.closed && !this.closed) {
	            _super.prototype.unsubscribe.call(this);
	            parent.count -= 1;
	            if (parent.count === 0 && parent.attemptedToUnsubscribe) {
	                parent.unsubscribe();
	            }
	        }
	    };
	    return InnerRefCountSubscription;
	}(Subscription_1.Subscription));


/***/ },
/* 209 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var MapPolyfill_1 = __webpack_require__(210);
	exports.Map = root_1.root.Map || (function () { return MapPolyfill_1.MapPolyfill; })();


/***/ },
/* 210 */
/***/ function(module, exports) {

	"use strict";
	var MapPolyfill = (function () {
	    function MapPolyfill() {
	        this.size = 0;
	        this._values = [];
	        this._keys = [];
	    }
	    MapPolyfill.prototype.get = function (key) {
	        var i = this._keys.indexOf(key);
	        return i === -1 ? undefined : this._values[i];
	    };
	    MapPolyfill.prototype.set = function (key, value) {
	        var i = this._keys.indexOf(key);
	        if (i === -1) {
	            this._keys.push(key);
	            this._values.push(value);
	            this.size++;
	        }
	        else {
	            this._values[i] = value;
	        }
	        return this;
	    };
	    MapPolyfill.prototype.delete = function (key) {
	        var i = this._keys.indexOf(key);
	        if (i === -1) {
	            return false;
	        }
	        this._values.splice(i, 1);
	        this._keys.splice(i, 1);
	        this.size--;
	        return true;
	    };
	    MapPolyfill.prototype.clear = function () {
	        this._keys.length = 0;
	        this._values.length = 0;
	        this.size = 0;
	    };
	    MapPolyfill.prototype.forEach = function (cb, thisArg) {
	        for (var i = 0; i < this.size; i++) {
	            cb.call(thisArg, this._values[i], this._keys[i]);
	        }
	    };
	    return MapPolyfill;
	}());
	exports.MapPolyfill = MapPolyfill;


/***/ },
/* 211 */
/***/ function(module, exports) {

	"use strict";
	var FastMap = (function () {
	    function FastMap() {
	        this.values = {};
	    }
	    FastMap.prototype.delete = function (key) {
	        this.values[key] = null;
	        return true;
	    };
	    FastMap.prototype.set = function (key, value) {
	        this.values[key] = value;
	        return this;
	    };
	    FastMap.prototype.get = function (key) {
	        return this.values[key];
	    };
	    FastMap.prototype.forEach = function (cb, thisArg) {
	        var values = this.values;
	        for (var key in values) {
	            if (values.hasOwnProperty(key) && values[key] !== null) {
	                cb.call(thisArg, values[key], key);
	            }
	        }
	    };
	    FastMap.prototype.clear = function () {
	        this.values = {};
	    };
	    return FastMap;
	}());
	exports.FastMap = FastMap;


/***/ },
/* 212 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var ignoreElements_1 = __webpack_require__(213);
	Observable_1.Observable.prototype.ignoreElements = ignoreElements_1.ignoreElements;


/***/ },
/* 213 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var noop_1 = __webpack_require__(101);
	/**
	 * Ignores all items emitted by the source Observable and only passes calls of `complete` or `error`.
	 *
	 * <img src="./img/ignoreElements.png" width="100%">
	 *
	 * @return {Observable} an empty Observable that only calls `complete`
	 * or `error`, based on which one is called by the source Observable.
	 * @method ignoreElements
	 * @owner Observable
	 */
	function ignoreElements() {
	    return this.lift(new IgnoreElementsOperator());
	}
	exports.ignoreElements = ignoreElements;
	;
	var IgnoreElementsOperator = (function () {
	    function IgnoreElementsOperator() {
	    }
	    IgnoreElementsOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new IgnoreElementsSubscriber(subscriber));
	    };
	    return IgnoreElementsOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var IgnoreElementsSubscriber = (function (_super) {
	    __extends(IgnoreElementsSubscriber, _super);
	    function IgnoreElementsSubscriber() {
	        _super.apply(this, arguments);
	    }
	    IgnoreElementsSubscriber.prototype._next = function (unused) {
	        noop_1.noop();
	    };
	    return IgnoreElementsSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 214 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var isEmpty_1 = __webpack_require__(215);
	Observable_1.Observable.prototype.isEmpty = isEmpty_1.isEmpty;


/***/ },
/* 215 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * If the source Observable is empty it returns an Observable that emits true, otherwise it emits false.
	 *
	 * <img src="./img/isEmpty.png" width="100%">
	 *
	 * @return {Observable} an Observable that emits a Boolean.
	 * @method isEmpty
	 * @owner Observable
	 */
	function isEmpty() {
	    return this.lift(new IsEmptyOperator());
	}
	exports.isEmpty = isEmpty;
	var IsEmptyOperator = (function () {
	    function IsEmptyOperator() {
	    }
	    IsEmptyOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new IsEmptySubscriber(observer));
	    };
	    return IsEmptyOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var IsEmptySubscriber = (function (_super) {
	    __extends(IsEmptySubscriber, _super);
	    function IsEmptySubscriber(destination) {
	        _super.call(this, destination);
	    }
	    IsEmptySubscriber.prototype.notifyComplete = function (isEmpty) {
	        var destination = this.destination;
	        destination.next(isEmpty);
	        destination.complete();
	    };
	    IsEmptySubscriber.prototype._next = function (value) {
	        this.notifyComplete(false);
	    };
	    IsEmptySubscriber.prototype._complete = function () {
	        this.notifyComplete(true);
	    };
	    return IsEmptySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 216 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var audit_1 = __webpack_require__(217);
	Observable_1.Observable.prototype.audit = audit_1.audit;


/***/ },
/* 217 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Ignores source values for a duration determined by another Observable, then
	 * emits the most recent value from the source Observable, then repeats this
	 * process.
	 *
	 * <span class="informal">It's like {@link auditTime}, but the silencing
	 * duration is determined by a second Observable.</span>
	 *
	 * <img src="./img/audit.png" width="100%">
	 *
	 * `audit` is similar to `throttle`, but emits the last value from the silenced
	 * time window, instead of the first value. `audit` emits the most recent value
	 * from the source Observable on the output Observable as soon as its internal
	 * timer becomes disabled, and ignores source values while the timer is enabled.
	 * Initially, the timer is disabled. As soon as the first source value arrives,
	 * the timer is enabled by calling the `durationSelector` function with the
	 * source value, which returns the "duration" Observable. When the duration
	 * Observable emits a value or completes, the timer is disabled, then the most
	 * recent source value is emitted on the output Observable, and this process
	 * repeats for the next source value.
	 *
	 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.audit(ev => Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link auditTime}
	 * @see {@link debounce}
	 * @see {@link delayWhen}
	 * @see {@link sample}
	 * @see {@link throttle}
	 *
	 * @param {function(value: T): Observable|Promise} durationSelector A function
	 * that receives a value from the source Observable, for computing the silencing
	 * duration, returned as an Observable or a Promise.
	 * @return {Observable<T>} An Observable that performs rate-limiting of
	 * emissions from the source Observable.
	 * @method audit
	 * @owner Observable
	 */
	function audit(durationSelector) {
	    return this.lift(new AuditOperator(durationSelector));
	}
	exports.audit = audit;
	var AuditOperator = (function () {
	    function AuditOperator(durationSelector) {
	        this.durationSelector = durationSelector;
	    }
	    AuditOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new AuditSubscriber(subscriber, this.durationSelector));
	    };
	    return AuditOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var AuditSubscriber = (function (_super) {
	    __extends(AuditSubscriber, _super);
	    function AuditSubscriber(destination, durationSelector) {
	        _super.call(this, destination);
	        this.durationSelector = durationSelector;
	        this.hasValue = false;
	    }
	    AuditSubscriber.prototype._next = function (value) {
	        this.value = value;
	        this.hasValue = true;
	        if (!this.throttled) {
	            var duration = tryCatch_1.tryCatch(this.durationSelector)(value);
	            if (duration === errorObject_1.errorObject) {
	                this.destination.error(errorObject_1.errorObject.e);
	            }
	            else {
	                this.add(this.throttled = subscribeToResult_1.subscribeToResult(this, duration));
	            }
	        }
	    };
	    AuditSubscriber.prototype.clearThrottle = function () {
	        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
	        if (throttled) {
	            this.remove(throttled);
	            this.throttled = null;
	            throttled.unsubscribe();
	        }
	        if (hasValue) {
	            this.value = null;
	            this.hasValue = false;
	            this.destination.next(value);
	        }
	    };
	    AuditSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex) {
	        this.clearThrottle();
	    };
	    AuditSubscriber.prototype.notifyComplete = function () {
	        this.clearThrottle();
	    };
	    return AuditSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 218 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var auditTime_1 = __webpack_require__(219);
	Observable_1.Observable.prototype.auditTime = auditTime_1.auditTime;


/***/ },
/* 219 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var async_1 = __webpack_require__(88);
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Ignores source values for `duration` milliseconds, then emits the most recent
	 * value from the source Observable, then repeats this process.
	 *
	 * <span class="informal">When it sees a source values, it ignores that plus
	 * the next ones for `duration` milliseconds, and then it emits the most recent
	 * value from the source.</span>
	 *
	 * <img src="./img/auditTime.png" width="100%">
	 *
	 * `auditTime` is similar to `throttleTime`, but emits the last value from the
	 * silenced time window, instead of the first value. `auditTime` emits the most
	 * recent value from the source Observable on the output Observable as soon as
	 * its internal timer becomes disabled, and ignores source values while the
	 * timer is enabled. Initially, the timer is disabled. As soon as the first
	 * source value arrives, the timer is enabled. After `duration` milliseconds (or
	 * the time unit determined internally by the optional `scheduler`) has passed,
	 * the timer is disabled, then the most recent source value is emitted on the
	 * output Observable, and this process repeats for the next source value.
	 * Optionally takes a {@link Scheduler} for managing timers.
	 *
	 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.auditTime(1000);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link audit}
	 * @see {@link debounceTime}
	 * @see {@link delay}
	 * @see {@link sampleTime}
	 * @see {@link throttleTime}
	 *
	 * @param {number} duration Time to wait before emitting the most recent source
	 * value, measured in milliseconds or the time unit determined internally
	 * by the optional `scheduler`.
	 * @param {Scheduler} [scheduler=async] The {@link Scheduler} to use for
	 * managing the timers that handle the rate-limiting behavior.
	 * @return {Observable<T>} An Observable that performs rate-limiting of
	 * emissions from the source Observable.
	 * @method auditTime
	 * @owner Observable
	 */
	function auditTime(duration, scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new AuditTimeOperator(duration, scheduler));
	}
	exports.auditTime = auditTime;
	var AuditTimeOperator = (function () {
	    function AuditTimeOperator(duration, scheduler) {
	        this.duration = duration;
	        this.scheduler = scheduler;
	    }
	    AuditTimeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new AuditTimeSubscriber(subscriber, this.duration, this.scheduler));
	    };
	    return AuditTimeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var AuditTimeSubscriber = (function (_super) {
	    __extends(AuditTimeSubscriber, _super);
	    function AuditTimeSubscriber(destination, duration, scheduler) {
	        _super.call(this, destination);
	        this.duration = duration;
	        this.scheduler = scheduler;
	        this.hasValue = false;
	    }
	    AuditTimeSubscriber.prototype._next = function (value) {
	        this.value = value;
	        this.hasValue = true;
	        if (!this.throttled) {
	            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, this));
	        }
	    };
	    AuditTimeSubscriber.prototype.clearThrottle = function () {
	        var _a = this, value = _a.value, hasValue = _a.hasValue, throttled = _a.throttled;
	        if (throttled) {
	            this.remove(throttled);
	            this.throttled = null;
	            throttled.unsubscribe();
	        }
	        if (hasValue) {
	            this.value = null;
	            this.hasValue = false;
	            this.destination.next(value);
	        }
	    };
	    return AuditTimeSubscriber;
	}(Subscriber_1.Subscriber));
	function dispatchNext(subscriber) {
	    subscriber.clearThrottle();
	}


/***/ },
/* 220 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var last_1 = __webpack_require__(221);
	Observable_1.Observable.prototype.last = last_1.last;


/***/ },
/* 221 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var EmptyError_1 = __webpack_require__(206);
	/**
	 * Returns an Observable that emits only the last item emitted by the source Observable.
	 * It optionally takes a predicate function as a parameter, in which case, rather than emitting
	 * the last item from the source Observable, the resulting Observable will emit the last item
	 * from the source Observable that satisfies the predicate.
	 *
	 * <img src="./img/last.png" width="100%">
	 *
	 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
	 * callback if the Observable completes before any `next` notification was sent.
	 * @param {function} predicate - the condition any source emitted item has to satisfy.
	 * @return {Observable} an Observable that emits only the last item satisfying the given condition
	 * from the source, or an NoSuchElementException if no such items are emitted.
	 * @throws - Throws if no items that match the predicate are emitted by the source Observable.
	 * @method last
	 * @owner Observable
	 */
	function last(predicate, resultSelector, defaultValue) {
	    return this.lift(new LastOperator(predicate, resultSelector, defaultValue, this));
	}
	exports.last = last;
	var LastOperator = (function () {
	    function LastOperator(predicate, resultSelector, defaultValue, source) {
	        this.predicate = predicate;
	        this.resultSelector = resultSelector;
	        this.defaultValue = defaultValue;
	        this.source = source;
	    }
	    LastOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new LastSubscriber(observer, this.predicate, this.resultSelector, this.defaultValue, this.source));
	    };
	    return LastOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var LastSubscriber = (function (_super) {
	    __extends(LastSubscriber, _super);
	    function LastSubscriber(destination, predicate, resultSelector, defaultValue, source) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.resultSelector = resultSelector;
	        this.defaultValue = defaultValue;
	        this.source = source;
	        this.hasValue = false;
	        this.index = 0;
	        if (typeof defaultValue !== 'undefined') {
	            this.lastValue = defaultValue;
	            this.hasValue = true;
	        }
	    }
	    LastSubscriber.prototype._next = function (value) {
	        var index = this.index++;
	        if (this.predicate) {
	            this._tryPredicate(value, index);
	        }
	        else {
	            if (this.resultSelector) {
	                this._tryResultSelector(value, index);
	                return;
	            }
	            this.lastValue = value;
	            this.hasValue = true;
	        }
	    };
	    LastSubscriber.prototype._tryPredicate = function (value, index) {
	        var result;
	        try {
	            result = this.predicate(value, index, this.source);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (result) {
	            if (this.resultSelector) {
	                this._tryResultSelector(value, index);
	                return;
	            }
	            this.lastValue = value;
	            this.hasValue = true;
	        }
	    };
	    LastSubscriber.prototype._tryResultSelector = function (value, index) {
	        var result;
	        try {
	            result = this.resultSelector(value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.lastValue = result;
	        this.hasValue = true;
	    };
	    LastSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        if (this.hasValue) {
	            destination.next(this.lastValue);
	            destination.complete();
	        }
	        else {
	            destination.error(new EmptyError_1.EmptyError);
	        }
	    };
	    return LastSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 222 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var let_1 = __webpack_require__(223);
	Observable_1.Observable.prototype.let = let_1.letProto;
	Observable_1.Observable.prototype.letBind = let_1.letProto;


/***/ },
/* 223 */
/***/ function(module, exports) {

	"use strict";
	/**
	 * @param func
	 * @return {Observable<R>}
	 * @method let
	 * @owner Observable
	 */
	function letProto(func) {
	    return func(this);
	}
	exports.letProto = letProto;


/***/ },
/* 224 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var every_1 = __webpack_require__(225);
	Observable_1.Observable.prototype.every = every_1.every;


/***/ },
/* 225 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Returns an Observable that emits whether or not every item of the source satisfies the condition specified.
	 * @param {function} predicate a function for determining if an item meets a specified condition.
	 * @param {any} [thisArg] optional object to use for `this` in the callback
	 * @return {Observable} an Observable of booleans that determines if all items of the source Observable meet the condition specified.
	 * @method every
	 * @owner Observable
	 */
	function every(predicate, thisArg) {
	    return this.lift(new EveryOperator(predicate, thisArg, this));
	}
	exports.every = every;
	var EveryOperator = (function () {
	    function EveryOperator(predicate, thisArg, source) {
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	        this.source = source;
	    }
	    EveryOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new EverySubscriber(observer, this.predicate, this.thisArg, this.source));
	    };
	    return EveryOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var EverySubscriber = (function (_super) {
	    __extends(EverySubscriber, _super);
	    function EverySubscriber(destination, predicate, thisArg, source) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.thisArg = thisArg;
	        this.source = source;
	        this.index = 0;
	        this.thisArg = thisArg || this;
	    }
	    EverySubscriber.prototype.notifyComplete = function (everyValueMatch) {
	        this.destination.next(everyValueMatch);
	        this.destination.complete();
	    };
	    EverySubscriber.prototype._next = function (value) {
	        var result = false;
	        try {
	            result = this.predicate.call(this.thisArg, value, this.index++, this.source);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        if (!result) {
	            this.notifyComplete(false);
	        }
	    };
	    EverySubscriber.prototype._complete = function () {
	        this.notifyComplete(true);
	    };
	    return EverySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 226 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var map_1 = __webpack_require__(128);
	Observable_1.Observable.prototype.map = map_1.map;


/***/ },
/* 227 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var mapTo_1 = __webpack_require__(228);
	Observable_1.Observable.prototype.mapTo = mapTo_1.mapTo;


/***/ },
/* 228 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Emits the given constant value on the output Observable every time the source
	 * Observable emits a value.
	 *
	 * <span class="informal">Like {@link map}, but it maps every source value to
	 * the same output value every time.</span>
	 *
	 * <img src="./img/mapTo.png" width="100%">
	 *
	 * Takes a constant `value` as argument, and emits that whenever the source
	 * Observable emits a value. In other words, ignores the actual source value,
	 * and simply uses the emission moment to know when to emit the given `value`.
	 *
	 * @example <caption>Map every every click to the string 'Hi'</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var greetings = clicks.mapTo('Hi');
	 * greetings.subscribe(x => console.log(x));
	 *
	 * @see {@link map}
	 *
	 * @param {any} value The value to map each source value to.
	 * @return {Observable} An Observable that emits the given `value` every time
	 * the source Observable emits something.
	 * @method mapTo
	 * @owner Observable
	 */
	function mapTo(value) {
	    return this.lift(new MapToOperator(value));
	}
	exports.mapTo = mapTo;
	var MapToOperator = (function () {
	    function MapToOperator(value) {
	        this.value = value;
	    }
	    MapToOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new MapToSubscriber(subscriber, this.value));
	    };
	    return MapToOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MapToSubscriber = (function (_super) {
	    __extends(MapToSubscriber, _super);
	    function MapToSubscriber(destination, value) {
	        _super.call(this, destination);
	        this.value = value;
	    }
	    MapToSubscriber.prototype._next = function (x) {
	        this.destination.next(this.value);
	    };
	    return MapToSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 229 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var materialize_1 = __webpack_require__(230);
	Observable_1.Observable.prototype.materialize = materialize_1.materialize;


/***/ },
/* 230 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var Notification_1 = __webpack_require__(70);
	/**
	 * Represents all of the notifications from the source Observable as `next`
	 * emissions marked with their original types within {@link Notification}
	 * objects.
	 *
	 * <span class="informal">Wraps `next`, `error` and `complete` emissions in
	 * {@link Notification} objects, emitted as `next` on the output Observable.
	 * </span>
	 *
	 * <img src="./img/materialize.png" width="100%">
	 *
	 * `materialize` returns an Observable that emits a `next` notification for each
	 * `next`, `error`, or `complete` emission of the source Observable. When the
	 * source Observable emits `complete`, the output Observable will emit `next` as
	 * a Notification of type "complete", and then it will emit `complete` as well.
	 * When the source Observable emits `error`, the output will emit `next` as a
	 * Notification of type "error", and then `complete`.
	 *
	 * This operator is useful for producing metadata of the source Observable, to
	 * be consumed as `next` emissions. Use it in conjunction with
	 * {@link dematerialize}.
	 *
	 * @example <caption>Convert a faulty Observable to an Observable of Notifications</caption>
	 * var letters = Rx.Observable.of('a', 'b', 13, 'd');
	 * var upperCase = letters.map(x => x.toUpperCase());
	 * var materialized = upperCase.materialize();
	 * materialized.subscribe(x => console.log(x));
	 *
	 * @see {@link Notification}
	 * @see {@link dematerialize}
	 *
	 * @return {Observable<Notification<T>>} An Observable that emits
	 * {@link Notification} objects that wrap the original emissions from the source
	 * Observable with metadata.
	 * @method materialize
	 * @owner Observable
	 */
	function materialize() {
	    return this.lift(new MaterializeOperator());
	}
	exports.materialize = materialize;
	var MaterializeOperator = (function () {
	    function MaterializeOperator() {
	    }
	    MaterializeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new MaterializeSubscriber(subscriber));
	    };
	    return MaterializeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MaterializeSubscriber = (function (_super) {
	    __extends(MaterializeSubscriber, _super);
	    function MaterializeSubscriber(destination) {
	        _super.call(this, destination);
	    }
	    MaterializeSubscriber.prototype._next = function (value) {
	        this.destination.next(Notification_1.Notification.createNext(value));
	    };
	    MaterializeSubscriber.prototype._error = function (err) {
	        var destination = this.destination;
	        destination.next(Notification_1.Notification.createError(err));
	        destination.complete();
	    };
	    MaterializeSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        destination.next(Notification_1.Notification.createComplete());
	        destination.complete();
	    };
	    return MaterializeSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 231 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var max_1 = __webpack_require__(232);
	Observable_1.Observable.prototype.max = max_1.max;


/***/ },
/* 232 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var reduce_1 = __webpack_require__(233);
	/**
	 * The Max operator operates on an Observable that emits numbers (or items that can be evaluated as numbers),
	 * and when source Observable completes it emits a single item: the item with the largest number.
	 *
	 * <img src="./img/max.png" width="100%">
	 *
	 * @param {Function} optional comparer function that it will use instead of its default to compare the value of two
	 * items.
	 * @return {Observable} an Observable that emits item with the largest number.
	 * @method max
	 * @owner Observable
	 */
	function max(comparer) {
	    var max = (typeof comparer === 'function')
	        ? function (x, y) { return comparer(x, y) > 0 ? x : y; }
	        : function (x, y) { return x > y ? x : y; };
	    return this.lift(new reduce_1.ReduceOperator(max));
	}
	exports.max = max;


/***/ },
/* 233 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Applies an accumulator function over the source Observable, and returns the
	 * accumulated result when the source completes, given an optional seed value.
	 *
	 * <span class="informal">Combines together all values emitted on the source,
	 * using an accumulator function that knows how to join a new source value into
	 * the accumulation from the past.</span>
	 *
	 * <img src="./img/reduce.png" width="100%">
	 *
	 * Like
	 * [Array.prototype.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce),
	 * `reduce` applies an `accumulator` function against an accumulation and each
	 * value of the source Observable (from the past) to reduce it to a single
	 * value, emitted on the output Observable. Note that `reduce` will only emit
	 * one value, only when the source Observable completes. It is equivalent to
	 * applying operator {@link scan} followed by operator {@link last}.
	 *
	 * Returns an Observable that applies a specified `accumulator` function to each
	 * item emitted by the source Observable. If a `seed` value is specified, then
	 * that value will be used as the initial value for the accumulator. If no seed
	 * value is specified, the first item of the source is used as the seed.
	 *
	 * @example <caption>Count the number of click events that happened in 5 seconds</caption>
	 * var clicksInFiveSeconds = Rx.Observable.fromEvent(document, 'click')
	 *   .takeUntil(Rx.Observable.interval(5000));
	 * var ones = clicksInFiveSeconds.mapTo(1);
	 * var seed = 0;
	 * var count = ones.reduce((acc, one) => acc + one, seed);
	 * count.subscribe(x => console.log(x));
	 *
	 * @see {@link count}
	 * @see {@link expand}
	 * @see {@link mergeScan}
	 * @see {@link scan}
	 *
	 * @param {function(acc: R, value: T): R} accumulator The accumulator function
	 * called on each source value.
	 * @param {R} [seed] The initial accumulation value.
	 * @return {Observable<R>} An observable of the accumulated values.
	 * @return {Observable<R>} An Observable that emits a single value that is the
	 * result of accumulating the values emitted by the source Observable.
	 * @method reduce
	 * @owner Observable
	 */
	function reduce(accumulator, seed) {
	    return this.lift(new ReduceOperator(accumulator, seed));
	}
	exports.reduce = reduce;
	var ReduceOperator = (function () {
	    function ReduceOperator(accumulator, seed) {
	        this.accumulator = accumulator;
	        this.seed = seed;
	    }
	    ReduceOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ReduceSubscriber(subscriber, this.accumulator, this.seed));
	    };
	    return ReduceOperator;
	}());
	exports.ReduceOperator = ReduceOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ReduceSubscriber = (function (_super) {
	    __extends(ReduceSubscriber, _super);
	    function ReduceSubscriber(destination, accumulator, seed) {
	        _super.call(this, destination);
	        this.accumulator = accumulator;
	        this.hasValue = false;
	        this.acc = seed;
	        this.accumulator = accumulator;
	        this.hasSeed = typeof seed !== 'undefined';
	    }
	    ReduceSubscriber.prototype._next = function (value) {
	        if (this.hasValue || (this.hasValue = this.hasSeed)) {
	            this._tryReduce(value);
	        }
	        else {
	            this.acc = value;
	            this.hasValue = true;
	        }
	    };
	    ReduceSubscriber.prototype._tryReduce = function (value) {
	        var result;
	        try {
	            result = this.accumulator(this.acc, value);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.acc = result;
	    };
	    ReduceSubscriber.prototype._complete = function () {
	        if (this.hasValue || this.hasSeed) {
	            this.destination.next(this.acc);
	        }
	        this.destination.complete();
	    };
	    return ReduceSubscriber;
	}(Subscriber_1.Subscriber));
	exports.ReduceSubscriber = ReduceSubscriber;


/***/ },
/* 234 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var merge_1 = __webpack_require__(95);
	Observable_1.Observable.prototype.merge = merge_1.merge;


/***/ },
/* 235 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var mergeAll_1 = __webpack_require__(54);
	Observable_1.Observable.prototype.mergeAll = mergeAll_1.mergeAll;


/***/ },
/* 236 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var mergeMap_1 = __webpack_require__(159);
	Observable_1.Observable.prototype.mergeMap = mergeMap_1.mergeMap;
	Observable_1.Observable.prototype.flatMap = mergeMap_1.mergeMap;


/***/ },
/* 237 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var mergeMapTo_1 = __webpack_require__(162);
	Observable_1.Observable.prototype.flatMapTo = mergeMapTo_1.mergeMapTo;
	Observable_1.Observable.prototype.mergeMapTo = mergeMapTo_1.mergeMapTo;


/***/ },
/* 238 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var mergeScan_1 = __webpack_require__(239);
	Observable_1.Observable.prototype.mergeScan = mergeScan_1.mergeScan;


/***/ },
/* 239 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var subscribeToResult_1 = __webpack_require__(47);
	var OuterSubscriber_1 = __webpack_require__(46);
	/**
	 * @param project
	 * @param seed
	 * @param concurrent
	 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
	 * @method mergeScan
	 * @owner Observable
	 */
	function mergeScan(project, seed, concurrent) {
	    if (concurrent === void 0) { concurrent = Number.POSITIVE_INFINITY; }
	    return this.lift(new MergeScanOperator(project, seed, concurrent));
	}
	exports.mergeScan = mergeScan;
	var MergeScanOperator = (function () {
	    function MergeScanOperator(project, seed, concurrent) {
	        this.project = project;
	        this.seed = seed;
	        this.concurrent = concurrent;
	    }
	    MergeScanOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new MergeScanSubscriber(subscriber, this.project, this.seed, this.concurrent));
	    };
	    return MergeScanOperator;
	}());
	exports.MergeScanOperator = MergeScanOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var MergeScanSubscriber = (function (_super) {
	    __extends(MergeScanSubscriber, _super);
	    function MergeScanSubscriber(destination, project, acc, concurrent) {
	        _super.call(this, destination);
	        this.project = project;
	        this.acc = acc;
	        this.concurrent = concurrent;
	        this.hasValue = false;
	        this.hasCompleted = false;
	        this.buffer = [];
	        this.active = 0;
	        this.index = 0;
	    }
	    MergeScanSubscriber.prototype._next = function (value) {
	        if (this.active < this.concurrent) {
	            var index = this.index++;
	            var ish = tryCatch_1.tryCatch(this.project)(this.acc, value);
	            var destination = this.destination;
	            if (ish === errorObject_1.errorObject) {
	                destination.error(errorObject_1.errorObject.e);
	            }
	            else {
	                this.active++;
	                this._innerSub(ish, value, index);
	            }
	        }
	        else {
	            this.buffer.push(value);
	        }
	    };
	    MergeScanSubscriber.prototype._innerSub = function (ish, value, index) {
	        this.add(subscribeToResult_1.subscribeToResult(this, ish, value, index));
	    };
	    MergeScanSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0 && this.buffer.length === 0) {
	            if (this.hasValue === false) {
	                this.destination.next(this.acc);
	            }
	            this.destination.complete();
	        }
	    };
	    MergeScanSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var destination = this.destination;
	        this.acc = innerValue;
	        this.hasValue = true;
	        destination.next(innerValue);
	    };
	    MergeScanSubscriber.prototype.notifyComplete = function (innerSub) {
	        var buffer = this.buffer;
	        this.remove(innerSub);
	        this.active--;
	        if (buffer.length > 0) {
	            this._next(buffer.shift());
	        }
	        else if (this.active === 0 && this.hasCompleted) {
	            if (this.hasValue === false) {
	                this.destination.next(this.acc);
	            }
	            this.destination.complete();
	        }
	    };
	    return MergeScanSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));
	exports.MergeScanSubscriber = MergeScanSubscriber;


/***/ },
/* 240 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var min_1 = __webpack_require__(241);
	Observable_1.Observable.prototype.min = min_1.min;


/***/ },
/* 241 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var reduce_1 = __webpack_require__(233);
	/**
	 * The Min operator operates on an Observable that emits numbers (or items that can be evaluated as numbers),
	 * and when source Observable completes it emits a single item: the item with the smallest number.
	 *
	 * <img src="./img/min.png" width="100%">
	 *
	 * @param {Function} optional comparer function that it will use instead of its default to compare the value of two items.
	 * @return {Observable<R>} an Observable that emits item with the smallest number.
	 * @method min
	 * @owner Observable
	 */
	function min(comparer) {
	    var min = (typeof comparer === 'function')
	        ? function (x, y) { return comparer(x, y) < 0 ? x : y; }
	        : function (x, y) { return x < y ? x : y; };
	    return this.lift(new reduce_1.ReduceOperator(min));
	}
	exports.min = min;


/***/ },
/* 242 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var multicast_1 = __webpack_require__(243);
	Observable_1.Observable.prototype.multicast = multicast_1.multicast;


/***/ },
/* 243 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var MulticastObservable_1 = __webpack_require__(244);
	var ConnectableObservable_1 = __webpack_require__(245);
	/**
	 * Returns an Observable that emits the results of invoking a specified selector on items
	 * emitted by a ConnectableObservable that shares a single subscription to the underlying stream.
	 *
	 * <img src="./img/multicast.png" width="100%">
	 *
	 * @param {Function|Subject} Factory function to create an intermediate subject through
	 * which the source sequence's elements will be multicast to the selector function
	 * or Subject to push source elements into.
	 * @param {Function} Optional selector function that can use the multicasted source stream
	 * as many times as needed, without causing multiple subscriptions to the source stream.
	 * Subscribers to the given source will receive all notifications of the source from the
	 * time of the subscription forward.
	 * @return {Observable} an Observable that emits the results of invoking the selector
	 * on the items emitted by a `ConnectableObservable` that shares a single subscription to
	 * the underlying stream.
	 * @method multicast
	 * @owner Observable
	 */
	function multicast(subjectOrSubjectFactory, selector) {
	    var subjectFactory;
	    if (typeof subjectOrSubjectFactory === 'function') {
	        subjectFactory = subjectOrSubjectFactory;
	    }
	    else {
	        subjectFactory = function subjectFactory() {
	            return subjectOrSubjectFactory;
	        };
	    }
	    return !selector ?
	        new ConnectableObservable_1.ConnectableObservable(this, subjectFactory) :
	        new MulticastObservable_1.MulticastObservable(this, subjectFactory, selector);
	}
	exports.multicast = multicast;


/***/ },
/* 244 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var ConnectableObservable_1 = __webpack_require__(245);
	var MulticastObservable = (function (_super) {
	    __extends(MulticastObservable, _super);
	    function MulticastObservable(source, subjectFactory, selector) {
	        _super.call(this);
	        this.source = source;
	        this.subjectFactory = subjectFactory;
	        this.selector = selector;
	    }
	    MulticastObservable.prototype._subscribe = function (subscriber) {
	        var _a = this, selector = _a.selector, source = _a.source;
	        var connectable = new ConnectableObservable_1.ConnectableObservable(source, this.subjectFactory);
	        var subscription = selector(connectable).subscribe(subscriber);
	        subscription.add(connectable.connect());
	        return subscription;
	    };
	    return MulticastObservable;
	}(Observable_1.Observable));
	exports.MulticastObservable = MulticastObservable;


/***/ },
/* 245 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var Observable_1 = __webpack_require__(16);
	var Subscriber_1 = __webpack_require__(19);
	var Subscription_1 = __webpack_require__(21);
	/**
	 * @class ConnectableObservable<T>
	 */
	var ConnectableObservable = (function (_super) {
	    __extends(ConnectableObservable, _super);
	    function ConnectableObservable(source, subjectFactory) {
	        _super.call(this);
	        this.source = source;
	        this.subjectFactory = subjectFactory;
	        this._refCount = 0;
	    }
	    ConnectableObservable.prototype._subscribe = function (subscriber) {
	        return this.getSubject().subscribe(subscriber);
	    };
	    ConnectableObservable.prototype.getSubject = function () {
	        var subject = this._subject;
	        if (!subject || subject.isStopped) {
	            this._subject = this.subjectFactory();
	        }
	        return this._subject;
	    };
	    ConnectableObservable.prototype.connect = function () {
	        var connection = this._connection;
	        if (!connection) {
	            connection = this._connection = new Subscription_1.Subscription();
	            connection.add(this.source
	                .subscribe(new ConnectableSubscriber(this.getSubject(), this)));
	            if (connection.closed) {
	                this._connection = null;
	                connection = Subscription_1.Subscription.EMPTY;
	            }
	            else {
	                this._connection = connection;
	            }
	        }
	        return connection;
	    };
	    ConnectableObservable.prototype.refCount = function () {
	        return this.lift(new RefCountOperator(this));
	    };
	    return ConnectableObservable;
	}(Observable_1.Observable));
	exports.ConnectableObservable = ConnectableObservable;
	var ConnectableSubscriber = (function (_super) {
	    __extends(ConnectableSubscriber, _super);
	    function ConnectableSubscriber(destination, connectable) {
	        _super.call(this, destination);
	        this.connectable = connectable;
	    }
	    ConnectableSubscriber.prototype._error = function (err) {
	        this._unsubscribe();
	        _super.prototype._error.call(this, err);
	    };
	    ConnectableSubscriber.prototype._complete = function () {
	        this._unsubscribe();
	        _super.prototype._complete.call(this);
	    };
	    ConnectableSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (connectable) {
	            this.connectable = null;
	            var connection = connectable._connection;
	            connectable._refCount = 0;
	            connectable._subject = null;
	            connectable._connection = null;
	            if (connection) {
	                connection.unsubscribe();
	            }
	        }
	    };
	    return ConnectableSubscriber;
	}(Subject_1.SubjectSubscriber));
	var RefCountOperator = (function () {
	    function RefCountOperator(connectable) {
	        this.connectable = connectable;
	    }
	    RefCountOperator.prototype.call = function (subscriber, source) {
	        var connectable = this.connectable;
	        connectable._refCount++;
	        var refCounter = new RefCountSubscriber(subscriber, connectable);
	        var subscription = source._subscribe(refCounter);
	        if (!refCounter.closed) {
	            refCounter.connection = connectable.connect();
	        }
	        return subscription;
	    };
	    return RefCountOperator;
	}());
	var RefCountSubscriber = (function (_super) {
	    __extends(RefCountSubscriber, _super);
	    function RefCountSubscriber(destination, connectable) {
	        _super.call(this, destination);
	        this.connectable = connectable;
	    }
	    RefCountSubscriber.prototype._unsubscribe = function () {
	        var connectable = this.connectable;
	        if (!connectable) {
	            this.connection = null;
	            return;
	        }
	        this.connectable = null;
	        var refCount = connectable._refCount;
	        if (refCount <= 0) {
	            this.connection = null;
	            return;
	        }
	        connectable._refCount = refCount - 1;
	        if (refCount > 1) {
	            this.connection = null;
	            return;
	        }
	        ///
	        // Compare the local RefCountSubscriber's connection Subscription to the
	        // connection Subscription on the shared ConnectableObservable. In cases
	        // where the ConnectableObservable source synchronously emits values, and
	        // the RefCountSubscriber's dowstream Observers synchronously unsubscribe,
	        // execution continues to here before the RefCountOperator has a chance to
	        // supply the RefCountSubscriber with the shared connection Subscription.
	        // For example:
	        // ```
	        // Observable.range(0, 10)
	        //   .publish()
	        //   .refCount()
	        //   .take(5)
	        //   .subscribe();
	        // ```
	        // In order to account for this case, RefCountSubscriber should only dispose
	        // the ConnectableObservable's shared connection Subscription if the
	        // connection Subscription exists, *and* either:
	        //   a. RefCountSubscriber doesn't have a reference to the shared connection
	        //      Subscription yet, or,
	        //   b. RefCountSubscriber's connection Subscription reference is identical
	        //      to the shared connection Subscription
	        ///
	        var connection = this.connection;
	        var sharedConnection = connectable._connection;
	        this.connection = null;
	        if (sharedConnection && (!connection || sharedConnection === connection)) {
	            sharedConnection.unsubscribe();
	        }
	    };
	    return RefCountSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 246 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var observeOn_1 = __webpack_require__(69);
	Observable_1.Observable.prototype.observeOn = observeOn_1.observeOn;


/***/ },
/* 247 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var onErrorResumeNext_1 = __webpack_require__(105);
	Observable_1.Observable.prototype.onErrorResumeNext = onErrorResumeNext_1.onErrorResumeNext;


/***/ },
/* 248 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var pairwise_1 = __webpack_require__(249);
	Observable_1.Observable.prototype.pairwise = pairwise_1.pairwise;


/***/ },
/* 249 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Groups pairs of consecutive emissions together and emits them as an array of
	 * two values.
	 *
	 * <span class="informal">Puts the current value and previous value together as
	 * an array, and emits that.</span>
	 *
	 * <img src="./img/pairwise.png" width="100%">
	 *
	 * The Nth emission from the source Observable will cause the output Observable
	 * to emit an array [(N-1)th, Nth] of the previous and the current value, as a
	 * pair. For this reason, `pairwise` emits on the second and subsequent
	 * emissions from the source Observable, but not on the first emission, because
	 * there is no previous value in that case.
	 *
	 * @example <caption>On every click (starting from the second), emit the relative distance to the previous click</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var pairs = clicks.pairwise();
	 * var distance = pairs.map(pair => {
	 *   var x0 = pair[0].clientX;
	 *   var y0 = pair[0].clientY;
	 *   var x1 = pair[1].clientX;
	 *   var y1 = pair[1].clientY;
	 *   return Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));
	 * });
	 * distance.subscribe(x => console.log(x));
	 *
	 * @see {@link buffer}
	 * @see {@link bufferCount}
	 *
	 * @return {Observable<Array<T>>} An Observable of pairs (as arrays) of
	 * consecutive values from the source Observable.
	 * @method pairwise
	 * @owner Observable
	 */
	function pairwise() {
	    return this.lift(new PairwiseOperator());
	}
	exports.pairwise = pairwise;
	var PairwiseOperator = (function () {
	    function PairwiseOperator() {
	    }
	    PairwiseOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new PairwiseSubscriber(subscriber));
	    };
	    return PairwiseOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var PairwiseSubscriber = (function (_super) {
	    __extends(PairwiseSubscriber, _super);
	    function PairwiseSubscriber(destination) {
	        _super.call(this, destination);
	        this.hasPrev = false;
	    }
	    PairwiseSubscriber.prototype._next = function (value) {
	        if (this.hasPrev) {
	            this.destination.next([this.prev, value]);
	        }
	        else {
	            this.hasPrev = true;
	        }
	        this.prev = value;
	    };
	    return PairwiseSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 250 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var partition_1 = __webpack_require__(251);
	Observable_1.Observable.prototype.partition = partition_1.partition;


/***/ },
/* 251 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var not_1 = __webpack_require__(252);
	var filter_1 = __webpack_require__(197);
	/**
	 * Splits the source Observable into two, one with values that satisfy a
	 * predicate, and another with values that don't satisfy the predicate.
	 *
	 * <span class="informal">It's like {@link filter}, but returns two Observables:
	 * one like the output of {@link filter}, and the other with values that did not
	 * pass the condition.</span>
	 *
	 * <img src="./img/partition.png" width="100%">
	 *
	 * `partition` outputs an array with two Observables that partition the values
	 * from the source Observable through the given `predicate` function. The first
	 * Observable in that array emits source values for which the predicate argument
	 * returns true. The second Observable emits source values for which the
	 * predicate returns false. The first behaves like {@link filter} and the second
	 * behaves like {@link filter} with the predicate negated.
	 *
	 * @example <caption>Partition click events into those on DIV elements and those elsewhere</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var parts = clicks.partition(ev => ev.target.tagName === 'DIV');
	 * var clicksOnDivs = parts[0];
	 * var clicksElsewhere = parts[1];
	 * clicksOnDivs.subscribe(x => console.log('DIV clicked: ', x));
	 * clicksElsewhere.subscribe(x => console.log('Other clicked: ', x));
	 *
	 * @see {@link filter}
	 *
	 * @param {function(value: T, index: number): boolean} predicate A function that
	 * evaluates each value emitted by the source Observable. If it returns `true`,
	 * the value is emitted on the first Observable in the returned array, if
	 * `false` the value is emitted on the second Observable in the array. The
	 * `index` parameter is the number `i` for the i-th source emission that has
	 * happened since the subscription, starting from the number `0`.
	 * @param {any} [thisArg] An optional argument to determine the value of `this`
	 * in the `predicate` function.
	 * @return {[Observable<T>, Observable<T>]} An array with two Observables: one
	 * with values that passed the predicate, and another with values that did not
	 * pass the predicate.
	 * @method partition
	 * @owner Observable
	 */
	function partition(predicate, thisArg) {
	    return [
	        filter_1.filter.call(this, predicate),
	        filter_1.filter.call(this, not_1.not(predicate, thisArg))
	    ];
	}
	exports.partition = partition;


/***/ },
/* 252 */
/***/ function(module, exports) {

	"use strict";
	function not(pred, thisArg) {
	    function notPred() {
	        return !(notPred.pred.apply(notPred.thisArg, arguments));
	    }
	    notPred.pred = pred;
	    notPred.thisArg = thisArg;
	    return notPred;
	}
	exports.not = not;


/***/ },
/* 253 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var pluck_1 = __webpack_require__(254);
	Observable_1.Observable.prototype.pluck = pluck_1.pluck;


/***/ },
/* 254 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var map_1 = __webpack_require__(128);
	/**
	 * Maps each source value (an object) to its specified nested property.
	 *
	 * <span class="informal">Like {@link map}, but meant only for picking one of
	 * the nested properties of every emitted object.</span>
	 *
	 * <img src="./img/pluck.png" width="100%">
	 *
	 * Given a list of strings describing a path to an object property, retrieves
	 * the value of a specified nested property from all values in the source
	 * Observable. If a property can't be resolved, it will return `undefined` for
	 * that value.
	 *
	 * @example <caption>Map every every click to the tagName of the clicked target element</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var tagNames = clicks.pluck('target', 'tagName');
	 * tagNames.subscribe(x => console.log(x));
	 *
	 * @see {@link map}
	 *
	 * @param {...string} properties The nested properties to pluck from each source
	 * value (an object).
	 * @return {Observable} Returns a new Observable of property values from the
	 * source values.
	 * @method pluck
	 * @owner Observable
	 */
	function pluck() {
	    var properties = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        properties[_i - 0] = arguments[_i];
	    }
	    var length = properties.length;
	    if (length === 0) {
	        throw new Error('list of properties cannot be empty.');
	    }
	    return map_1.map.call(this, plucker(properties, length));
	}
	exports.pluck = pluck;
	function plucker(props, length) {
	    var mapper = function (x) {
	        var currentProp = x;
	        for (var i = 0; i < length; i++) {
	            var p = currentProp[props[i]];
	            if (typeof p !== 'undefined') {
	                currentProp = p;
	            }
	            else {
	                return undefined;
	            }
	        }
	        return currentProp;
	    };
	    return mapper;
	}


/***/ },
/* 255 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var publish_1 = __webpack_require__(256);
	Observable_1.Observable.prototype.publish = publish_1.publish;


/***/ },
/* 256 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Subject_1 = __webpack_require__(15);
	var multicast_1 = __webpack_require__(243);
	/**
	 * Returns a ConnectableObservable, which is a variety of Observable that waits until its connect method is called
	 * before it begins emitting items to those Observers that have subscribed to it.
	 *
	 * <img src="./img/publish.png" width="100%">
	 *
	 * @param {Function} Optional selector function which can use the multicasted source sequence as many times as needed,
	 * without causing multiple subscriptions to the source sequence.
	 * Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
	 * @return a ConnectableObservable that upon connection causes the source Observable to emit items to its Observers.
	 * @method publish
	 * @owner Observable
	 */
	function publish(selector) {
	    return selector ? multicast_1.multicast.call(this, function () { return new Subject_1.Subject(); }, selector) :
	        multicast_1.multicast.call(this, new Subject_1.Subject());
	}
	exports.publish = publish;


/***/ },
/* 257 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var publishBehavior_1 = __webpack_require__(258);
	Observable_1.Observable.prototype.publishBehavior = publishBehavior_1.publishBehavior;


/***/ },
/* 258 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var BehaviorSubject_1 = __webpack_require__(259);
	var multicast_1 = __webpack_require__(243);
	/**
	 * @param value
	 * @return {ConnectableObservable<T>}
	 * @method publishBehavior
	 * @owner Observable
	 */
	function publishBehavior(value) {
	    return multicast_1.multicast.call(this, new BehaviorSubject_1.BehaviorSubject(value));
	}
	exports.publishBehavior = publishBehavior;


/***/ },
/* 259 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var ObjectUnsubscribedError_1 = __webpack_require__(30);
	/**
	 * @class BehaviorSubject<T>
	 */
	var BehaviorSubject = (function (_super) {
	    __extends(BehaviorSubject, _super);
	    function BehaviorSubject(_value) {
	        _super.call(this);
	        this._value = _value;
	    }
	    Object.defineProperty(BehaviorSubject.prototype, "value", {
	        get: function () {
	            return this.getValue();
	        },
	        enumerable: true,
	        configurable: true
	    });
	    BehaviorSubject.prototype._subscribe = function (subscriber) {
	        var subscription = _super.prototype._subscribe.call(this, subscriber);
	        if (subscription && !subscription.closed) {
	            subscriber.next(this._value);
	        }
	        return subscription;
	    };
	    BehaviorSubject.prototype.getValue = function () {
	        if (this.hasError) {
	            throw this.thrownError;
	        }
	        else if (this.closed) {
	            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
	        }
	        else {
	            return this._value;
	        }
	    };
	    BehaviorSubject.prototype.next = function (value) {
	        _super.prototype.next.call(this, this._value = value);
	    };
	    return BehaviorSubject;
	}(Subject_1.Subject));
	exports.BehaviorSubject = BehaviorSubject;


/***/ },
/* 260 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var publishReplay_1 = __webpack_require__(261);
	Observable_1.Observable.prototype.publishReplay = publishReplay_1.publishReplay;


/***/ },
/* 261 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ReplaySubject_1 = __webpack_require__(132);
	var multicast_1 = __webpack_require__(243);
	/**
	 * @param bufferSize
	 * @param windowTime
	 * @param scheduler
	 * @return {ConnectableObservable<T>}
	 * @method publishReplay
	 * @owner Observable
	 */
	function publishReplay(bufferSize, windowTime, scheduler) {
	    if (bufferSize === void 0) { bufferSize = Number.POSITIVE_INFINITY; }
	    if (windowTime === void 0) { windowTime = Number.POSITIVE_INFINITY; }
	    return multicast_1.multicast.call(this, new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler));
	}
	exports.publishReplay = publishReplay;


/***/ },
/* 262 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var publishLast_1 = __webpack_require__(263);
	Observable_1.Observable.prototype.publishLast = publishLast_1.publishLast;


/***/ },
/* 263 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var AsyncSubject_1 = __webpack_require__(35);
	var multicast_1 = __webpack_require__(243);
	/**
	 * @return {ConnectableObservable<T>}
	 * @method publishLast
	 * @owner Observable
	 */
	function publishLast() {
	    return multicast_1.multicast.call(this, new AsyncSubject_1.AsyncSubject());
	}
	exports.publishLast = publishLast;


/***/ },
/* 264 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var race_1 = __webpack_require__(97);
	Observable_1.Observable.prototype.race = race_1.race;


/***/ },
/* 265 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var reduce_1 = __webpack_require__(233);
	Observable_1.Observable.prototype.reduce = reduce_1.reduce;


/***/ },
/* 266 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var repeat_1 = __webpack_require__(267);
	Observable_1.Observable.prototype.repeat = repeat_1.repeat;


/***/ },
/* 267 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var EmptyObservable_1 = __webpack_require__(44);
	/**
	 * Returns an Observable that repeats the stream of items emitted by the source Observable at most count times,
	 * on a particular Scheduler.
	 *
	 * <img src="./img/repeat.png" width="100%">
	 *
	 * @param {Scheduler} [scheduler] the Scheduler to emit the items on.
	 * @param {number} [count] the number of times the source Observable items are repeated, a count of 0 will yield
	 * an empty Observable.
	 * @return {Observable} an Observable that repeats the stream of items emitted by the source Observable at most
	 * count times.
	 * @method repeat
	 * @owner Observable
	 */
	function repeat(count) {
	    if (count === void 0) { count = -1; }
	    if (count === 0) {
	        return new EmptyObservable_1.EmptyObservable();
	    }
	    else if (count < 0) {
	        return this.lift(new RepeatOperator(-1, this));
	    }
	    else {
	        return this.lift(new RepeatOperator(count - 1, this));
	    }
	}
	exports.repeat = repeat;
	var RepeatOperator = (function () {
	    function RepeatOperator(count, source) {
	        this.count = count;
	        this.source = source;
	    }
	    RepeatOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new RepeatSubscriber(subscriber, this.count, this.source));
	    };
	    return RepeatOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var RepeatSubscriber = (function (_super) {
	    __extends(RepeatSubscriber, _super);
	    function RepeatSubscriber(destination, count, source) {
	        _super.call(this, destination);
	        this.count = count;
	        this.source = source;
	    }
	    RepeatSubscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            var _a = this, source = _a.source, count = _a.count;
	            if (count === 0) {
	                return _super.prototype.complete.call(this);
	            }
	            else if (count > -1) {
	                this.count = count - 1;
	            }
	            this.unsubscribe();
	            this.isStopped = false;
	            this.closed = false;
	            source.subscribe(this);
	        }
	    };
	    return RepeatSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 268 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var repeatWhen_1 = __webpack_require__(269);
	Observable_1.Observable.prototype.repeatWhen = repeatWhen_1.repeatWhen;


/***/ },
/* 269 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Returns an Observable that emits the same values as the source observable with the exception of a `complete`.
	 * A `complete` will cause the emission of the Throwable that cause the complete to the Observable returned from
	 * notificationHandler. If that Observable calls onComplete or `complete` then retry will call `complete` or `error`
	 * on the child subscription. Otherwise, this Observable will resubscribe to the source observable, on a particular
	 * Scheduler.
	 *
	 * <img src="./img/repeatWhen.png" width="100%">
	 *
	 * @param {notificationHandler} receives an Observable of notifications with which a user can `complete` or `error`,
	 * aborting the retry.
	 * @param {scheduler} the Scheduler on which to subscribe to the source Observable.
	 * @return {Observable} the source Observable modified with retry logic.
	 * @method repeatWhen
	 * @owner Observable
	 */
	function repeatWhen(notifier) {
	    return this.lift(new RepeatWhenOperator(notifier, this));
	}
	exports.repeatWhen = repeatWhen;
	var RepeatWhenOperator = (function () {
	    function RepeatWhenOperator(notifier, source) {
	        this.notifier = notifier;
	        this.source = source;
	    }
	    RepeatWhenOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new RepeatWhenSubscriber(subscriber, this.notifier, this.source));
	    };
	    return RepeatWhenOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var RepeatWhenSubscriber = (function (_super) {
	    __extends(RepeatWhenSubscriber, _super);
	    function RepeatWhenSubscriber(destination, notifier, source) {
	        _super.call(this, destination);
	        this.notifier = notifier;
	        this.source = source;
	    }
	    RepeatWhenSubscriber.prototype.complete = function () {
	        if (!this.isStopped) {
	            var notifications = this.notifications;
	            var retries = this.retries;
	            var retriesSubscription = this.retriesSubscription;
	            if (!retries) {
	                notifications = new Subject_1.Subject();
	                retries = tryCatch_1.tryCatch(this.notifier)(notifications);
	                if (retries === errorObject_1.errorObject) {
	                    return _super.prototype.complete.call(this);
	                }
	                retriesSubscription = subscribeToResult_1.subscribeToResult(this, retries);
	            }
	            else {
	                this.notifications = null;
	                this.retriesSubscription = null;
	            }
	            this.unsubscribe();
	            this.closed = false;
	            this.notifications = notifications;
	            this.retries = retries;
	            this.retriesSubscription = retriesSubscription;
	            notifications.next();
	        }
	    };
	    RepeatWhenSubscriber.prototype._unsubscribe = function () {
	        var _a = this, notifications = _a.notifications, retriesSubscription = _a.retriesSubscription;
	        if (notifications) {
	            notifications.unsubscribe();
	            this.notifications = null;
	        }
	        if (retriesSubscription) {
	            retriesSubscription.unsubscribe();
	            this.retriesSubscription = null;
	        }
	        this.retries = null;
	    };
	    RepeatWhenSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var _a = this, notifications = _a.notifications, retries = _a.retries, retriesSubscription = _a.retriesSubscription;
	        this.notifications = null;
	        this.retries = null;
	        this.retriesSubscription = null;
	        this.unsubscribe();
	        this.isStopped = false;
	        this.closed = false;
	        this.notifications = notifications;
	        this.retries = retries;
	        this.retriesSubscription = retriesSubscription;
	        this.source.subscribe(this);
	    };
	    return RepeatWhenSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 270 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var retry_1 = __webpack_require__(271);
	Observable_1.Observable.prototype.retry = retry_1.retry;


/***/ },
/* 271 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Returns an Observable that mirrors the source Observable, resubscribing to it if it calls `error` and the
	 * predicate returns true for that specific exception and retry count.
	 * If the source Observable calls `error`, this method will resubscribe to the source Observable for a maximum of
	 * count resubscriptions (given as a number parameter) rather than propagating the `error` call.
	 *
	 * <img src="./img/retry.png" width="100%">
	 *
	 * Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those emitted
	 * during failed subscriptions. For example, if an Observable fails at first but emits [1, 2] then succeeds the second
	 * time and emits: [1, 2, 3, 4, 5] then the complete stream of emissions and notifications
	 * would be: [1, 2, 1, 2, 3, 4, 5, `complete`].
	 * @param {number} number of retry attempts before failing.
	 * @return {Observable} the source Observable modified with the retry logic.
	 * @method retry
	 * @owner Observable
	 */
	function retry(count) {
	    if (count === void 0) { count = -1; }
	    return this.lift(new RetryOperator(count, this));
	}
	exports.retry = retry;
	var RetryOperator = (function () {
	    function RetryOperator(count, source) {
	        this.count = count;
	        this.source = source;
	    }
	    RetryOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new RetrySubscriber(subscriber, this.count, this.source));
	    };
	    return RetryOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var RetrySubscriber = (function (_super) {
	    __extends(RetrySubscriber, _super);
	    function RetrySubscriber(destination, count, source) {
	        _super.call(this, destination);
	        this.count = count;
	        this.source = source;
	    }
	    RetrySubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var _a = this, source = _a.source, count = _a.count;
	            if (count === 0) {
	                return _super.prototype.error.call(this, err);
	            }
	            else if (count > -1) {
	                this.count = count - 1;
	            }
	            this.unsubscribe();
	            this.isStopped = false;
	            this.closed = false;
	            source.subscribe(this);
	        }
	    };
	    return RetrySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 272 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var retryWhen_1 = __webpack_require__(273);
	Observable_1.Observable.prototype.retryWhen = retryWhen_1.retryWhen;


/***/ },
/* 273 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Returns an Observable that emits the same values as the source observable with the exception of an `error`.
	 * An `error` will cause the emission of the Throwable that cause the error to the Observable returned from
	 * notificationHandler. If that Observable calls onComplete or `error` then retry will call `complete` or `error`
	 * on the child subscription. Otherwise, this Observable will resubscribe to the source observable, on a particular
	 * Scheduler.
	 *
	 * <img src="./img/retryWhen.png" width="100%">
	 *
	 * @param {notificationHandler} receives an Observable of notifications with which a user can `complete` or `error`,
	 * aborting the retry.
	 * @param {scheduler} the Scheduler on which to subscribe to the source Observable.
	 * @return {Observable} the source Observable modified with retry logic.
	 * @method retryWhen
	 * @owner Observable
	 */
	function retryWhen(notifier) {
	    return this.lift(new RetryWhenOperator(notifier, this));
	}
	exports.retryWhen = retryWhen;
	var RetryWhenOperator = (function () {
	    function RetryWhenOperator(notifier, source) {
	        this.notifier = notifier;
	        this.source = source;
	    }
	    RetryWhenOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new RetryWhenSubscriber(subscriber, this.notifier, this.source));
	    };
	    return RetryWhenOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var RetryWhenSubscriber = (function (_super) {
	    __extends(RetryWhenSubscriber, _super);
	    function RetryWhenSubscriber(destination, notifier, source) {
	        _super.call(this, destination);
	        this.notifier = notifier;
	        this.source = source;
	    }
	    RetryWhenSubscriber.prototype.error = function (err) {
	        if (!this.isStopped) {
	            var errors = this.errors;
	            var retries = this.retries;
	            var retriesSubscription = this.retriesSubscription;
	            if (!retries) {
	                errors = new Subject_1.Subject();
	                retries = tryCatch_1.tryCatch(this.notifier)(errors);
	                if (retries === errorObject_1.errorObject) {
	                    return _super.prototype.error.call(this, errorObject_1.errorObject.e);
	                }
	                retriesSubscription = subscribeToResult_1.subscribeToResult(this, retries);
	            }
	            else {
	                this.errors = null;
	                this.retriesSubscription = null;
	            }
	            this.unsubscribe();
	            this.closed = false;
	            this.errors = errors;
	            this.retries = retries;
	            this.retriesSubscription = retriesSubscription;
	            errors.next(err);
	        }
	    };
	    RetryWhenSubscriber.prototype._unsubscribe = function () {
	        var _a = this, errors = _a.errors, retriesSubscription = _a.retriesSubscription;
	        if (errors) {
	            errors.unsubscribe();
	            this.errors = null;
	        }
	        if (retriesSubscription) {
	            retriesSubscription.unsubscribe();
	            this.retriesSubscription = null;
	        }
	        this.retries = null;
	    };
	    RetryWhenSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var _a = this, errors = _a.errors, retries = _a.retries, retriesSubscription = _a.retriesSubscription;
	        this.errors = null;
	        this.retries = null;
	        this.retriesSubscription = null;
	        this.unsubscribe();
	        this.isStopped = false;
	        this.closed = false;
	        this.errors = errors;
	        this.retries = retries;
	        this.retriesSubscription = retriesSubscription;
	        this.source.subscribe(this);
	    };
	    return RetryWhenSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 274 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var sample_1 = __webpack_require__(275);
	Observable_1.Observable.prototype.sample = sample_1.sample;


/***/ },
/* 275 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Emits the most recently emitted value from the source Observable whenever
	 * another Observable, the `notifier`, emits.
	 *
	 * <span class="informal">It's like {@link sampleTime}, but samples whenever
	 * the `notifier` Observable emits something.</span>
	 *
	 * <img src="./img/sample.png" width="100%">
	 *
	 * Whenever the `notifier` Observable emits a value or completes, `sample`
	 * looks at the source Observable and emits whichever value it has most recently
	 * emitted since the previous sampling, unless the source has not emitted
	 * anything since the previous sampling. The `notifier` is subscribed to as soon
	 * as the output Observable is subscribed.
	 *
	 * @example <caption>On every click, sample the most recent "seconds" timer</caption>
	 * var seconds = Rx.Observable.interval(1000);
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = seconds.sample(clicks);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link audit}
	 * @see {@link debounce}
	 * @see {@link sampleTime}
	 * @see {@link throttle}
	 *
	 * @param {Observable<any>} notifier The Observable to use for sampling the
	 * source Observable.
	 * @return {Observable<T>} An Observable that emits the results of sampling the
	 * values emitted by the source Observable whenever the notifier Observable
	 * emits value or completes.
	 * @method sample
	 * @owner Observable
	 */
	function sample(notifier) {
	    return this.lift(new SampleOperator(notifier));
	}
	exports.sample = sample;
	var SampleOperator = (function () {
	    function SampleOperator(notifier) {
	        this.notifier = notifier;
	    }
	    SampleOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SampleSubscriber(subscriber, this.notifier));
	    };
	    return SampleOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SampleSubscriber = (function (_super) {
	    __extends(SampleSubscriber, _super);
	    function SampleSubscriber(destination, notifier) {
	        _super.call(this, destination);
	        this.hasValue = false;
	        this.add(subscribeToResult_1.subscribeToResult(this, notifier));
	    }
	    SampleSubscriber.prototype._next = function (value) {
	        this.value = value;
	        this.hasValue = true;
	    };
	    SampleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.emitValue();
	    };
	    SampleSubscriber.prototype.notifyComplete = function () {
	        this.emitValue();
	    };
	    SampleSubscriber.prototype.emitValue = function () {
	        if (this.hasValue) {
	            this.hasValue = false;
	            this.destination.next(this.value);
	        }
	    };
	    return SampleSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 276 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var sampleTime_1 = __webpack_require__(277);
	Observable_1.Observable.prototype.sampleTime = sampleTime_1.sampleTime;


/***/ },
/* 277 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var async_1 = __webpack_require__(88);
	/**
	 * Emits the most recently emitted value from the source Observable within
	 * periodic time intervals.
	 *
	 * <span class="informal">Samples the source Observable at periodic time
	 * intervals, emitting what it samples.</span>
	 *
	 * <img src="./img/sampleTime.png" width="100%">
	 *
	 * `sampleTime` periodically looks at the source Observable and emits whichever
	 * value it has most recently emitted since the previous sampling, unless the
	 * source has not emitted anything since the previous sampling. The sampling
	 * happens periodically in time every `period` milliseconds (or the time unit
	 * defined by the optional `scheduler` argument). The sampling starts as soon as
	 * the output Observable is subscribed.
	 *
	 * @example <caption>Every second, emit the most recent click at most once</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.sampleTime(1000);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link auditTime}
	 * @see {@link debounceTime}
	 * @see {@link delay}
	 * @see {@link sample}
	 * @see {@link throttleTime}
	 *
	 * @param {number} period The sampling period expressed in milliseconds or the
	 * time unit determined internally by the optional `scheduler`.
	 * @param {Scheduler} [scheduler=async] The {@link Scheduler} to use for
	 * managing the timers that handle the sampling.
	 * @return {Observable<T>} An Observable that emits the results of sampling the
	 * values emitted by the source Observable at the specified time interval.
	 * @method sampleTime
	 * @owner Observable
	 */
	function sampleTime(period, scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new SampleTimeOperator(period, scheduler));
	}
	exports.sampleTime = sampleTime;
	var SampleTimeOperator = (function () {
	    function SampleTimeOperator(period, scheduler) {
	        this.period = period;
	        this.scheduler = scheduler;
	    }
	    SampleTimeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SampleTimeSubscriber(subscriber, this.period, this.scheduler));
	    };
	    return SampleTimeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SampleTimeSubscriber = (function (_super) {
	    __extends(SampleTimeSubscriber, _super);
	    function SampleTimeSubscriber(destination, period, scheduler) {
	        _super.call(this, destination);
	        this.period = period;
	        this.scheduler = scheduler;
	        this.hasValue = false;
	        this.add(scheduler.schedule(dispatchNotification, period, { subscriber: this, period: period }));
	    }
	    SampleTimeSubscriber.prototype._next = function (value) {
	        this.lastValue = value;
	        this.hasValue = true;
	    };
	    SampleTimeSubscriber.prototype.notifyNext = function () {
	        if (this.hasValue) {
	            this.hasValue = false;
	            this.destination.next(this.lastValue);
	        }
	    };
	    return SampleTimeSubscriber;
	}(Subscriber_1.Subscriber));
	function dispatchNotification(state) {
	    var subscriber = state.subscriber, period = state.period;
	    subscriber.notifyNext();
	    this.schedule(state, period);
	}


/***/ },
/* 278 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var scan_1 = __webpack_require__(279);
	Observable_1.Observable.prototype.scan = scan_1.scan;


/***/ },
/* 279 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Applies an accumulator function over the source Observable, and returns each
	 * intermediate result, with an optional seed value.
	 *
	 * <span class="informal">It's like {@link reduce}, but emits the current
	 * accumulation whenever the source emits a value.</span>
	 *
	 * <img src="./img/scan.png" width="100%">
	 *
	 * Combines together all values emitted on the source, using an accumulator
	 * function that knows how to join a new source value into the accumulation from
	 * the past. Is similar to {@link reduce}, but emits the intermediate
	 * accumulations.
	 *
	 * Returns an Observable that applies a specified `accumulator` function to each
	 * item emitted by the source Observable. If a `seed` value is specified, then
	 * that value will be used as the initial value for the accumulator. If no seed
	 * value is specified, the first item of the source is used as the seed.
	 *
	 * @example <caption>Count the number of click events</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var ones = clicks.mapTo(1);
	 * var seed = 0;
	 * var count = ones.scan((acc, one) => acc + one, seed);
	 * count.subscribe(x => console.log(x));
	 *
	 * @see {@link expand}
	 * @see {@link mergeScan}
	 * @see {@link reduce}
	 *
	 * @param {function(acc: R, value: T, index: number): R} accumulator
	 * The accumulator function called on each source value.
	 * @param {T|R} [seed] The initial accumulation value.
	 * @return {Observable<R>} An observable of the accumulated values.
	 * @method scan
	 * @owner Observable
	 */
	function scan(accumulator, seed) {
	    return this.lift(new ScanOperator(accumulator, seed));
	}
	exports.scan = scan;
	var ScanOperator = (function () {
	    function ScanOperator(accumulator, seed) {
	        this.accumulator = accumulator;
	        this.seed = seed;
	    }
	    ScanOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ScanSubscriber(subscriber, this.accumulator, this.seed));
	    };
	    return ScanOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ScanSubscriber = (function (_super) {
	    __extends(ScanSubscriber, _super);
	    function ScanSubscriber(destination, accumulator, seed) {
	        _super.call(this, destination);
	        this.accumulator = accumulator;
	        this.index = 0;
	        this.accumulatorSet = false;
	        this.seed = seed;
	        this.accumulatorSet = typeof seed !== 'undefined';
	    }
	    Object.defineProperty(ScanSubscriber.prototype, "seed", {
	        get: function () {
	            return this._seed;
	        },
	        set: function (value) {
	            this.accumulatorSet = true;
	            this._seed = value;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    ScanSubscriber.prototype._next = function (value) {
	        if (!this.accumulatorSet) {
	            this.seed = value;
	            this.destination.next(value);
	        }
	        else {
	            return this._tryNext(value);
	        }
	    };
	    ScanSubscriber.prototype._tryNext = function (value) {
	        var index = this.index++;
	        var result;
	        try {
	            result = this.accumulator(this.seed, value, index);
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	        this.seed = result;
	        this.destination.next(result);
	    };
	    return ScanSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 280 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var sequenceEqual_1 = __webpack_require__(281);
	Observable_1.Observable.prototype.sequenceEqual = sequenceEqual_1.sequenceEqual;


/***/ },
/* 281 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	/**
	 * Compares all values of two observables in sequence using an optional comparor function
	 * and returns an observable of a single boolean value representing whether or not the two sequences
	 * are equal.
	 *
	 * <span class="informal">Checks to see of all values emitted by both observables are equal, in order.</span>
	 *
	 * <img src="./img/sequenceEqual.png" width="100%">
	 *
	 * `sequenceEqual` subscribes to two observables and buffers incoming values from each observable. Whenever either
	 * observable emits a value, the value is buffered and the buffers are shifted and compared from the bottom
	 * up; If any value pair doesn't match, the returned observable will emit `false` and complete. If one of the
	 * observables completes, the operator will wait for the other observable to complete; If the other
	 * observable emits before completing, the returned observable will emit `false` and complete. If one observable never
	 * completes or emits after the other complets, the returned observable will never complete.
	 *
	 * @example <caption>figure out if the Konami code matches</caption>
	 * var code = Observable.from([
	 *  "ArrowUp",
	 *  "ArrowUp",
	 *  "ArrowDown",
	 *  "ArrowDown",
	 *  "ArrowLeft",
	 *  "ArrowRight",
	 *  "ArrowLeft",
	 *  "ArrowRight",
	 *  "KeyB",
	 *  "KeyA",
	 *  "Enter" // no start key, clearly.
	 * ]);
	 *
	 * var keys = Rx.Observable.fromEvent(document, 'keyup')
	 *  .map(e => e.code);
	 * var matches = keys.bufferCount(11, 1)
	 *  .mergeMap(
	 *    last11 =>
	 *      Rx.Observable.from(last11)
	 *        .sequenceEqual(code)
	 *   );
	 * matches.subscribe(matched => console.log('Successful cheat at Contra? ', matched));
	 *
	 * @see {@link combineLatest}
	 * @see {@link zip}
	 * @see {@link withLatestFrom}
	 *
	 * @param {Observable} compareTo the observable sequence to compare the source sequence to.
	 * @param {function} [comparor] An optional function to compare each value pair
	 * @return {Observable} An Observable of a single boolean value representing whether or not
	 * the values emitted by both observables were equal in sequence
	 * @method sequenceEqual
	 * @owner Observable
	 */
	function sequenceEqual(compareTo, comparor) {
	    return this.lift(new SequenceEqualOperator(compareTo, comparor));
	}
	exports.sequenceEqual = sequenceEqual;
	var SequenceEqualOperator = (function () {
	    function SequenceEqualOperator(compareTo, comparor) {
	        this.compareTo = compareTo;
	        this.comparor = comparor;
	    }
	    SequenceEqualOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SequenceEqualSubscriber(subscriber, this.compareTo, this.comparor));
	    };
	    return SequenceEqualOperator;
	}());
	exports.SequenceEqualOperator = SequenceEqualOperator;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SequenceEqualSubscriber = (function (_super) {
	    __extends(SequenceEqualSubscriber, _super);
	    function SequenceEqualSubscriber(destination, compareTo, comparor) {
	        _super.call(this, destination);
	        this.compareTo = compareTo;
	        this.comparor = comparor;
	        this._a = [];
	        this._b = [];
	        this._oneComplete = false;
	        this.add(compareTo.subscribe(new SequenceEqualCompareToSubscriber(destination, this)));
	    }
	    SequenceEqualSubscriber.prototype._next = function (value) {
	        if (this._oneComplete && this._b.length === 0) {
	            this.emit(false);
	        }
	        else {
	            this._a.push(value);
	            this.checkValues();
	        }
	    };
	    SequenceEqualSubscriber.prototype._complete = function () {
	        if (this._oneComplete) {
	            this.emit(this._a.length === 0 && this._b.length === 0);
	        }
	        else {
	            this._oneComplete = true;
	        }
	    };
	    SequenceEqualSubscriber.prototype.checkValues = function () {
	        var _c = this, _a = _c._a, _b = _c._b, comparor = _c.comparor;
	        while (_a.length > 0 && _b.length > 0) {
	            var a = _a.shift();
	            var b = _b.shift();
	            var areEqual = false;
	            if (comparor) {
	                areEqual = tryCatch_1.tryCatch(comparor)(a, b);
	                if (areEqual === errorObject_1.errorObject) {
	                    this.destination.error(errorObject_1.errorObject.e);
	                }
	            }
	            else {
	                areEqual = a === b;
	            }
	            if (!areEqual) {
	                this.emit(false);
	            }
	        }
	    };
	    SequenceEqualSubscriber.prototype.emit = function (value) {
	        var destination = this.destination;
	        destination.next(value);
	        destination.complete();
	    };
	    SequenceEqualSubscriber.prototype.nextB = function (value) {
	        if (this._oneComplete && this._a.length === 0) {
	            this.emit(false);
	        }
	        else {
	            this._b.push(value);
	            this.checkValues();
	        }
	    };
	    return SequenceEqualSubscriber;
	}(Subscriber_1.Subscriber));
	exports.SequenceEqualSubscriber = SequenceEqualSubscriber;
	var SequenceEqualCompareToSubscriber = (function (_super) {
	    __extends(SequenceEqualCompareToSubscriber, _super);
	    function SequenceEqualCompareToSubscriber(destination, parent) {
	        _super.call(this, destination);
	        this.parent = parent;
	    }
	    SequenceEqualCompareToSubscriber.prototype._next = function (value) {
	        this.parent.nextB(value);
	    };
	    SequenceEqualCompareToSubscriber.prototype._error = function (err) {
	        this.parent.error(err);
	    };
	    SequenceEqualCompareToSubscriber.prototype._complete = function () {
	        this.parent._complete();
	    };
	    return SequenceEqualCompareToSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 282 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var share_1 = __webpack_require__(283);
	Observable_1.Observable.prototype.share = share_1.share;


/***/ },
/* 283 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var multicast_1 = __webpack_require__(243);
	var Subject_1 = __webpack_require__(15);
	function shareSubjectFactory() {
	    return new Subject_1.Subject();
	}
	/**
	 * Returns a new Observable that multicasts (shares) the original Observable. As long as there is at least one
	 * Subscriber this Observable will be subscribed and emitting data. When all subscribers have unsubscribed it will
	 * unsubscribe from the source Observable. Because the Observable is multicasting it makes the stream `hot`.
	 * This is an alias for .publish().refCount().
	 *
	 * <img src="./img/share.png" width="100%">
	 *
	 * @return {Observable<T>} an Observable that upon connection causes the source Observable to emit items to its Observers
	 * @method share
	 * @owner Observable
	 */
	function share() {
	    return multicast_1.multicast.call(this, shareSubjectFactory).refCount();
	}
	exports.share = share;
	;


/***/ },
/* 284 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var single_1 = __webpack_require__(285);
	Observable_1.Observable.prototype.single = single_1.single;


/***/ },
/* 285 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var EmptyError_1 = __webpack_require__(206);
	/**
	 * Returns an Observable that emits the single item emitted by the source Observable that matches a specified
	 * predicate, if that Observable emits one such item. If the source Observable emits more than one such item or no
	 * such items, notify of an IllegalArgumentException or NoSuchElementException respectively.
	 *
	 * <img src="./img/single.png" width="100%">
	 *
	 * @throws {EmptyError} Delivers an EmptyError to the Observer's `error`
	 * callback if the Observable completes before any `next` notification was sent.
	 * @param {Function} a predicate function to evaluate items emitted by the source Observable.
	 * @return {Observable<T>} an Observable that emits the single item emitted by the source Observable that matches
	 * the predicate.
	 .
	 * @method single
	 * @owner Observable
	 */
	function single(predicate) {
	    return this.lift(new SingleOperator(predicate, this));
	}
	exports.single = single;
	var SingleOperator = (function () {
	    function SingleOperator(predicate, source) {
	        this.predicate = predicate;
	        this.source = source;
	    }
	    SingleOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SingleSubscriber(subscriber, this.predicate, this.source));
	    };
	    return SingleOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SingleSubscriber = (function (_super) {
	    __extends(SingleSubscriber, _super);
	    function SingleSubscriber(destination, predicate, source) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.source = source;
	        this.seenValue = false;
	        this.index = 0;
	    }
	    SingleSubscriber.prototype.applySingleValue = function (value) {
	        if (this.seenValue) {
	            this.destination.error('Sequence contains more than one element');
	        }
	        else {
	            this.seenValue = true;
	            this.singleValue = value;
	        }
	    };
	    SingleSubscriber.prototype._next = function (value) {
	        var predicate = this.predicate;
	        this.index++;
	        if (predicate) {
	            this.tryNext(value);
	        }
	        else {
	            this.applySingleValue(value);
	        }
	    };
	    SingleSubscriber.prototype.tryNext = function (value) {
	        try {
	            var result = this.predicate(value, this.index, this.source);
	            if (result) {
	                this.applySingleValue(value);
	            }
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    SingleSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        if (this.index > 0) {
	            destination.next(this.seenValue ? this.singleValue : undefined);
	            destination.complete();
	        }
	        else {
	            destination.error(new EmptyError_1.EmptyError);
	        }
	    };
	    return SingleSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 286 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var skip_1 = __webpack_require__(287);
	Observable_1.Observable.prototype.skip = skip_1.skip;


/***/ },
/* 287 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Returns an Observable that skips `n` items emitted by an Observable.
	 *
	 * <img src="./img/skip.png" width="100%">
	 *
	 * @param {Number} the `n` of times, items emitted by source Observable should be skipped.
	 * @return {Observable} an Observable that skips values emitted by the source Observable.
	 *
	 * @method skip
	 * @owner Observable
	 */
	function skip(total) {
	    return this.lift(new SkipOperator(total));
	}
	exports.skip = skip;
	var SkipOperator = (function () {
	    function SkipOperator(total) {
	        this.total = total;
	    }
	    SkipOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SkipSubscriber(subscriber, this.total));
	    };
	    return SkipOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SkipSubscriber = (function (_super) {
	    __extends(SkipSubscriber, _super);
	    function SkipSubscriber(destination, total) {
	        _super.call(this, destination);
	        this.total = total;
	        this.count = 0;
	    }
	    SkipSubscriber.prototype._next = function (x) {
	        if (++this.count > this.total) {
	            this.destination.next(x);
	        }
	    };
	    return SkipSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 288 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var skipUntil_1 = __webpack_require__(289);
	Observable_1.Observable.prototype.skipUntil = skipUntil_1.skipUntil;


/***/ },
/* 289 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Returns an Observable that skips items emitted by the source Observable until a second Observable emits an item.
	 *
	 * <img src="./img/skipUntil.png" width="100%">
	 *
	 * @param {Observable} the second Observable that has to emit an item before the source Observable's elements begin to
	 * be mirrored by the resulting Observable.
	 * @return {Observable<T>} an Observable that skips items from the source Observable until the second Observable emits
	 * an item, then emits the remaining items.
	 * @method skipUntil
	 * @owner Observable
	 */
	function skipUntil(notifier) {
	    return this.lift(new SkipUntilOperator(notifier));
	}
	exports.skipUntil = skipUntil;
	var SkipUntilOperator = (function () {
	    function SkipUntilOperator(notifier) {
	        this.notifier = notifier;
	    }
	    SkipUntilOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SkipUntilSubscriber(subscriber, this.notifier));
	    };
	    return SkipUntilOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SkipUntilSubscriber = (function (_super) {
	    __extends(SkipUntilSubscriber, _super);
	    function SkipUntilSubscriber(destination, notifier) {
	        _super.call(this, destination);
	        this.hasValue = false;
	        this.isInnerStopped = false;
	        this.add(subscribeToResult_1.subscribeToResult(this, notifier));
	    }
	    SkipUntilSubscriber.prototype._next = function (value) {
	        if (this.hasValue) {
	            _super.prototype._next.call(this, value);
	        }
	    };
	    SkipUntilSubscriber.prototype._complete = function () {
	        if (this.isInnerStopped) {
	            _super.prototype._complete.call(this);
	        }
	        else {
	            this.unsubscribe();
	        }
	    };
	    SkipUntilSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.hasValue = true;
	    };
	    SkipUntilSubscriber.prototype.notifyComplete = function () {
	        this.isInnerStopped = true;
	        if (this.isStopped) {
	            _super.prototype._complete.call(this);
	        }
	    };
	    return SkipUntilSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 290 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var skipWhile_1 = __webpack_require__(291);
	Observable_1.Observable.prototype.skipWhile = skipWhile_1.skipWhile;


/***/ },
/* 291 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Returns an Observable that skips all items emitted by the source Observable as long as a specified condition holds
	 * true, but emits all further source items as soon as the condition becomes false.
	 *
	 * <img src="./img/skipWhile.png" width="100%">
	 *
	 * @param {Function} predicate - a function to test each item emitted from the source Observable.
	 * @return {Observable<T>} an Observable that begins emitting items emitted by the source Observable when the
	 * specified predicate becomes false.
	 * @method skipWhile
	 * @owner Observable
	 */
	function skipWhile(predicate) {
	    return this.lift(new SkipWhileOperator(predicate));
	}
	exports.skipWhile = skipWhile;
	var SkipWhileOperator = (function () {
	    function SkipWhileOperator(predicate) {
	        this.predicate = predicate;
	    }
	    SkipWhileOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SkipWhileSubscriber(subscriber, this.predicate));
	    };
	    return SkipWhileOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SkipWhileSubscriber = (function (_super) {
	    __extends(SkipWhileSubscriber, _super);
	    function SkipWhileSubscriber(destination, predicate) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.skipping = true;
	        this.index = 0;
	    }
	    SkipWhileSubscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        if (this.skipping) {
	            this.tryCallPredicate(value);
	        }
	        if (!this.skipping) {
	            destination.next(value);
	        }
	    };
	    SkipWhileSubscriber.prototype.tryCallPredicate = function (value) {
	        try {
	            var result = this.predicate(value, this.index++);
	            this.skipping = Boolean(result);
	        }
	        catch (err) {
	            this.destination.error(err);
	        }
	    };
	    return SkipWhileSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 292 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var startWith_1 = __webpack_require__(293);
	Observable_1.Observable.prototype.startWith = startWith_1.startWith;


/***/ },
/* 293 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var ArrayObservable_1 = __webpack_require__(42);
	var ScalarObservable_1 = __webpack_require__(43);
	var EmptyObservable_1 = __webpack_require__(44);
	var concat_1 = __webpack_require__(53);
	var isScheduler_1 = __webpack_require__(41);
	/**
	 * Returns an Observable that emits the items in a specified Iterable before it begins to emit items emitted by the
	 * source Observable.
	 *
	 * <img src="./img/startWith.png" width="100%">
	 *
	 * @param {Values} an Iterable that contains the items you want the modified Observable to emit first.
	 * @return {Observable} an Observable that emits the items in the specified Iterable and then emits the items
	 * emitted by the source Observable.
	 * @method startWith
	 * @owner Observable
	 */
	function startWith() {
	    var array = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        array[_i - 0] = arguments[_i];
	    }
	    var scheduler = array[array.length - 1];
	    if (isScheduler_1.isScheduler(scheduler)) {
	        array.pop();
	    }
	    else {
	        scheduler = null;
	    }
	    var len = array.length;
	    if (len === 1) {
	        return concat_1.concatStatic(new ScalarObservable_1.ScalarObservable(array[0], scheduler), this);
	    }
	    else if (len > 1) {
	        return concat_1.concatStatic(new ArrayObservable_1.ArrayObservable(array, scheduler), this);
	    }
	    else {
	        return concat_1.concatStatic(new EmptyObservable_1.EmptyObservable(scheduler), this);
	    }
	}
	exports.startWith = startWith;


/***/ },
/* 294 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var subscribeOn_1 = __webpack_require__(295);
	Observable_1.Observable.prototype.subscribeOn = subscribeOn_1.subscribeOn;


/***/ },
/* 295 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var SubscribeOnObservable_1 = __webpack_require__(296);
	/**
	 * Asynchronously subscribes Observers to this Observable on the specified Scheduler.
	 *
	 * <img src="./img/subscribeOn.png" width="100%">
	 *
	 * @param {Scheduler} the Scheduler to perform subscription actions on.
	 * @return {Observable<T>} the source Observable modified so that its subscriptions happen on the specified Scheduler
	 .
	 * @method subscribeOn
	 * @owner Observable
	 */
	function subscribeOn(scheduler, delay) {
	    if (delay === void 0) { delay = 0; }
	    return new SubscribeOnObservable_1.SubscribeOnObservable(this, delay, scheduler);
	}
	exports.subscribeOn = subscribeOn;


/***/ },
/* 296 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var asap_1 = __webpack_require__(297);
	var isNumeric_1 = __webpack_require__(87);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @extends {Ignored}
	 * @hide true
	 */
	var SubscribeOnObservable = (function (_super) {
	    __extends(SubscribeOnObservable, _super);
	    function SubscribeOnObservable(source, delayTime, scheduler) {
	        if (delayTime === void 0) { delayTime = 0; }
	        if (scheduler === void 0) { scheduler = asap_1.asap; }
	        _super.call(this);
	        this.source = source;
	        this.delayTime = delayTime;
	        this.scheduler = scheduler;
	        if (!isNumeric_1.isNumeric(delayTime) || delayTime < 0) {
	            this.delayTime = 0;
	        }
	        if (!scheduler || typeof scheduler.schedule !== 'function') {
	            this.scheduler = asap_1.asap;
	        }
	    }
	    SubscribeOnObservable.create = function (source, delay, scheduler) {
	        if (delay === void 0) { delay = 0; }
	        if (scheduler === void 0) { scheduler = asap_1.asap; }
	        return new SubscribeOnObservable(source, delay, scheduler);
	    };
	    SubscribeOnObservable.dispatch = function (arg) {
	        var source = arg.source, subscriber = arg.subscriber;
	        return source.subscribe(subscriber);
	    };
	    SubscribeOnObservable.prototype._subscribe = function (subscriber) {
	        var delay = this.delayTime;
	        var source = this.source;
	        var scheduler = this.scheduler;
	        return scheduler.schedule(SubscribeOnObservable.dispatch, delay, {
	            source: source, subscriber: subscriber
	        });
	    };
	    return SubscribeOnObservable;
	}(Observable_1.Observable));
	exports.SubscribeOnObservable = SubscribeOnObservable;


/***/ },
/* 297 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var AsapAction_1 = __webpack_require__(298);
	var AsapScheduler_1 = __webpack_require__(302);
	exports.asap = new AsapScheduler_1.AsapScheduler(AsapAction_1.AsapAction);


/***/ },
/* 298 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Immediate_1 = __webpack_require__(299);
	var AsyncAction_1 = __webpack_require__(89);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var AsapAction = (function (_super) {
	    __extends(AsapAction, _super);
	    function AsapAction(scheduler, work) {
	        _super.call(this, scheduler, work);
	        this.scheduler = scheduler;
	        this.work = work;
	    }
	    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        // If delay is greater than 0, request as an async action.
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        // Push the action to the end of the scheduler queue.
	        scheduler.actions.push(this);
	        // If a microtask has already been scheduled, don't schedule another
	        // one. If a microtask hasn't been scheduled yet, schedule one now. Return
	        // the current scheduled microtask id.
	        return scheduler.scheduled || (scheduler.scheduled = Immediate_1.Immediate.setImmediate(scheduler.flush.bind(scheduler, null)));
	    };
	    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        // If delay exists and is greater than 0, recycle as an async action.
	        if (delay !== null && delay > 0) {
	            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
	        }
	        // If the scheduler queue is empty, cancel the requested microtask and
	        // set the scheduled flag to undefined so the next AsapAction will schedule
	        // its own.
	        if (scheduler.actions.length === 0) {
	            Immediate_1.Immediate.clearImmediate(id);
	            scheduler.scheduled = undefined;
	        }
	        // Return undefined so the action knows to request a new async id if it's rescheduled.
	        return undefined;
	    };
	    return AsapAction;
	}(AsyncAction_1.AsyncAction));
	exports.AsapAction = AsapAction;


/***/ },
/* 299 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(clearImmediate, setImmediate) {/**
	Some credit for this helper goes to http://github.com/YuzuJS/setImmediate
	*/
	"use strict";
	var root_1 = __webpack_require__(17);
	var ImmediateDefinition = (function () {
	    function ImmediateDefinition(root) {
	        this.root = root;
	        if (root.setImmediate && typeof root.setImmediate === 'function') {
	            this.setImmediate = root.setImmediate.bind(root);
	            this.clearImmediate = root.clearImmediate.bind(root);
	        }
	        else {
	            this.nextHandle = 1;
	            this.tasksByHandle = {};
	            this.currentlyRunningATask = false;
	            // Don't get fooled by e.g. browserify environments.
	            if (this.canUseProcessNextTick()) {
	                // For Node.js before 0.9
	                this.setImmediate = this.createProcessNextTickSetImmediate();
	            }
	            else if (this.canUsePostMessage()) {
	                // For non-IE10 modern browsers
	                this.setImmediate = this.createPostMessageSetImmediate();
	            }
	            else if (this.canUseMessageChannel()) {
	                // For web workers, where supported
	                this.setImmediate = this.createMessageChannelSetImmediate();
	            }
	            else if (this.canUseReadyStateChange()) {
	                // For IE 6–8
	                this.setImmediate = this.createReadyStateChangeSetImmediate();
	            }
	            else {
	                // For older browsers
	                this.setImmediate = this.createSetTimeoutSetImmediate();
	            }
	            var ci = function clearImmediate(handle) {
	                delete clearImmediate.instance.tasksByHandle[handle];
	            };
	            ci.instance = this;
	            this.clearImmediate = ci;
	        }
	    }
	    ImmediateDefinition.prototype.identify = function (o) {
	        return this.root.Object.prototype.toString.call(o);
	    };
	    ImmediateDefinition.prototype.canUseProcessNextTick = function () {
	        return this.identify(this.root.process) === '[object process]';
	    };
	    ImmediateDefinition.prototype.canUseMessageChannel = function () {
	        return Boolean(this.root.MessageChannel);
	    };
	    ImmediateDefinition.prototype.canUseReadyStateChange = function () {
	        var document = this.root.document;
	        return Boolean(document && 'onreadystatechange' in document.createElement('script'));
	    };
	    ImmediateDefinition.prototype.canUsePostMessage = function () {
	        var root = this.root;
	        // The test against `importScripts` prevents this implementation from being installed inside a web worker,
	        // where `root.postMessage` means something completely different and can't be used for this purpose.
	        if (root.postMessage && !root.importScripts) {
	            var postMessageIsAsynchronous_1 = true;
	            var oldOnMessage = root.onmessage;
	            root.onmessage = function () {
	                postMessageIsAsynchronous_1 = false;
	            };
	            root.postMessage('', '*');
	            root.onmessage = oldOnMessage;
	            return postMessageIsAsynchronous_1;
	        }
	        return false;
	    };
	    // This function accepts the same arguments as setImmediate, but
	    // returns a function that requires no arguments.
	    ImmediateDefinition.prototype.partiallyApplied = function (handler) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var fn = function result() {
	            var _a = result, handler = _a.handler, args = _a.args;
	            if (typeof handler === 'function') {
	                handler.apply(undefined, args);
	            }
	            else {
	                (new Function('' + handler))();
	            }
	        };
	        fn.handler = handler;
	        fn.args = args;
	        return fn;
	    };
	    ImmediateDefinition.prototype.addFromSetImmediateArguments = function (args) {
	        this.tasksByHandle[this.nextHandle] = this.partiallyApplied.apply(undefined, args);
	        return this.nextHandle++;
	    };
	    ImmediateDefinition.prototype.createProcessNextTickSetImmediate = function () {
	        var fn = function setImmediate() {
	            var instance = setImmediate.instance;
	            var handle = instance.addFromSetImmediateArguments(arguments);
	            instance.root.process.nextTick(instance.partiallyApplied(instance.runIfPresent, handle));
	            return handle;
	        };
	        fn.instance = this;
	        return fn;
	    };
	    ImmediateDefinition.prototype.createPostMessageSetImmediate = function () {
	        // Installs an event handler on `global` for the `message` event: see
	        // * https://developer.mozilla.org/en/DOM/window.postMessage
	        // * http://www.whatwg.org/specs/web-apps/current-work/multipage/comms.html#crossDocumentMessages
	        var root = this.root;
	        var messagePrefix = 'setImmediate$' + root.Math.random() + '$';
	        var onGlobalMessage = function globalMessageHandler(event) {
	            var instance = globalMessageHandler.instance;
	            if (event.source === root &&
	                typeof event.data === 'string' &&
	                event.data.indexOf(messagePrefix) === 0) {
	                instance.runIfPresent(+event.data.slice(messagePrefix.length));
	            }
	        };
	        onGlobalMessage.instance = this;
	        root.addEventListener('message', onGlobalMessage, false);
	        var fn = function setImmediate() {
	            var _a = setImmediate, messagePrefix = _a.messagePrefix, instance = _a.instance;
	            var handle = instance.addFromSetImmediateArguments(arguments);
	            instance.root.postMessage(messagePrefix + handle, '*');
	            return handle;
	        };
	        fn.instance = this;
	        fn.messagePrefix = messagePrefix;
	        return fn;
	    };
	    ImmediateDefinition.prototype.runIfPresent = function (handle) {
	        // From the spec: 'Wait until any invocations of this algorithm started before this one have completed.'
	        // So if we're currently running a task, we'll need to delay this invocation.
	        if (this.currentlyRunningATask) {
	            // Delay by doing a setTimeout. setImmediate was tried instead, but in Firefox 7 it generated a
	            // 'too much recursion' error.
	            this.root.setTimeout(this.partiallyApplied(this.runIfPresent, handle), 0);
	        }
	        else {
	            var task = this.tasksByHandle[handle];
	            if (task) {
	                this.currentlyRunningATask = true;
	                try {
	                    task();
	                }
	                finally {
	                    this.clearImmediate(handle);
	                    this.currentlyRunningATask = false;
	                }
	            }
	        }
	    };
	    ImmediateDefinition.prototype.createMessageChannelSetImmediate = function () {
	        var _this = this;
	        var channel = new this.root.MessageChannel();
	        channel.port1.onmessage = function (event) {
	            var handle = event.data;
	            _this.runIfPresent(handle);
	        };
	        var fn = function setImmediate() {
	            var _a = setImmediate, channel = _a.channel, instance = _a.instance;
	            var handle = instance.addFromSetImmediateArguments(arguments);
	            channel.port2.postMessage(handle);
	            return handle;
	        };
	        fn.channel = channel;
	        fn.instance = this;
	        return fn;
	    };
	    ImmediateDefinition.prototype.createReadyStateChangeSetImmediate = function () {
	        var fn = function setImmediate() {
	            var instance = setImmediate.instance;
	            var root = instance.root;
	            var doc = root.document;
	            var html = doc.documentElement;
	            var handle = instance.addFromSetImmediateArguments(arguments);
	            // Create a <script> element; its readystatechange event will be fired asynchronously once it is inserted
	            // into the document. Do so, thus queuing up the task. Remember to clean up once it's been called.
	            var script = doc.createElement('script');
	            script.onreadystatechange = function () {
	                instance.runIfPresent(handle);
	                script.onreadystatechange = null;
	                html.removeChild(script);
	                script = null;
	            };
	            html.appendChild(script);
	            return handle;
	        };
	        fn.instance = this;
	        return fn;
	    };
	    ImmediateDefinition.prototype.createSetTimeoutSetImmediate = function () {
	        var fn = function setImmediate() {
	            var instance = setImmediate.instance;
	            var handle = instance.addFromSetImmediateArguments(arguments);
	            instance.root.setTimeout(instance.partiallyApplied(instance.runIfPresent, handle), 0);
	            return handle;
	        };
	        fn.instance = this;
	        return fn;
	    };
	    return ImmediateDefinition;
	}());
	exports.ImmediateDefinition = ImmediateDefinition;
	exports.Immediate = new ImmediateDefinition(root_1.root);
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(300).clearImmediate, __webpack_require__(300).setImmediate))

/***/ },
/* 300 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(301).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(300).setImmediate, __webpack_require__(300).clearImmediate))

/***/ },
/* 301 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 302 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AsyncScheduler_1 = __webpack_require__(91);
	var AsapScheduler = (function (_super) {
	    __extends(AsapScheduler, _super);
	    function AsapScheduler() {
	        _super.apply(this, arguments);
	    }
	    AsapScheduler.prototype.flush = function () {
	        this.active = true;
	        this.scheduled = undefined;
	        var actions = this.actions;
	        var error;
	        var index = -1;
	        var count = actions.length;
	        var action = actions.shift();
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (++index < count && (action = actions.shift()));
	        this.active = false;
	        if (error) {
	            while (++index < count && (action = actions.shift())) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AsapScheduler;
	}(AsyncScheduler_1.AsyncScheduler));
	exports.AsapScheduler = AsapScheduler;


/***/ },
/* 303 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var switch_1 = __webpack_require__(304);
	Observable_1.Observable.prototype.switch = switch_1._switch;
	Observable_1.Observable.prototype._switch = switch_1._switch;


/***/ },
/* 304 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Converts a higher-order Observable into a first-order Observable by
	 * subscribing to only the most recently emitted of those inner Observables.
	 *
	 * <span class="informal">Flattens an Observable-of-Observables by dropping the
	 * previous inner Observable once a new one appears.</span>
	 *
	 * <img src="./img/switch.png" width="100%">
	 *
	 * `switch` subscribes to an Observable that emits Observables, also known as a
	 * higher-order Observable. Each time it observes one of these emitted inner
	 * Observables, the output Observable subscribes to the inner Observable and
	 * begins emitting the items emitted by that. So far, it behaves
	 * like {@link mergeAll}. However, when a new inner Observable is emitted,
	 * `switch` unsubscribes from the earlier-emitted inner Observable and
	 * subscribes to the new inner Observable and begins emitting items from it. It
	 * continues to behave like this for subsequent inner Observables.
	 *
	 * @example <caption>Rerun an interval Observable on every click event</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * // Each click event is mapped to an Observable that ticks every second
	 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
	 * var switched = higherOrder.switch();
	 * // The outcome is that `switched` is essentially a timer that restarts
	 * // on every click. The interval Observables from older clicks do not merge
	 * // with the current interval Observable.
	 * switched.subscribe(x => console.log(x));
	 *
	 * @see {@link combineAll}
	 * @see {@link concatAll}
	 * @see {@link exhaust}
	 * @see {@link mergeAll}
	 * @see {@link switchMap}
	 * @see {@link switchMapTo}
	 * @see {@link zipAll}
	 *
	 * @return {Observable<T>} An Observable that emits the items emitted by the
	 * Observable most recently emitted by the source Observable.
	 * @method switch
	 * @name switch
	 * @owner Observable
	 */
	function _switch() {
	    return this.lift(new SwitchOperator());
	}
	exports._switch = _switch;
	var SwitchOperator = (function () {
	    function SwitchOperator() {
	    }
	    SwitchOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SwitchSubscriber(subscriber));
	    };
	    return SwitchOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SwitchSubscriber = (function (_super) {
	    __extends(SwitchSubscriber, _super);
	    function SwitchSubscriber(destination) {
	        _super.call(this, destination);
	        this.active = 0;
	        this.hasCompleted = false;
	    }
	    SwitchSubscriber.prototype._next = function (value) {
	        this.unsubscribeInner();
	        this.active++;
	        this.add(this.innerSubscription = subscribeToResult_1.subscribeToResult(this, value));
	    };
	    SwitchSubscriber.prototype._complete = function () {
	        this.hasCompleted = true;
	        if (this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    SwitchSubscriber.prototype.unsubscribeInner = function () {
	        this.active = this.active > 0 ? this.active - 1 : 0;
	        var innerSubscription = this.innerSubscription;
	        if (innerSubscription) {
	            innerSubscription.unsubscribe();
	            this.remove(innerSubscription);
	        }
	    };
	    SwitchSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.destination.next(innerValue);
	    };
	    SwitchSubscriber.prototype.notifyError = function (err) {
	        this.destination.error(err);
	    };
	    SwitchSubscriber.prototype.notifyComplete = function () {
	        this.unsubscribeInner();
	        if (this.hasCompleted && this.active === 0) {
	            this.destination.complete();
	        }
	    };
	    return SwitchSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 305 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var switchMap_1 = __webpack_require__(306);
	Observable_1.Observable.prototype.switchMap = switchMap_1.switchMap;


/***/ },
/* 306 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Projects each source value to an Observable which is merged in the output
	 * Observable, emitting values only from the most recently projected Observable.
	 *
	 * <span class="informal">Maps each value to an Observable, then flattens all of
	 * these inner Observables using {@link switch}.</span>
	 *
	 * <img src="./img/switchMap.png" width="100%">
	 *
	 * Returns an Observable that emits items based on applying a function that you
	 * supply to each item emitted by the source Observable, where that function
	 * returns an (so-called "inner") Observable. Each time it observes one of these
	 * inner Observables, the output Observable begins emitting the items emitted by
	 * that inner Observable. When a new inner Observable is emitted, `switchMap`
	 * stops emitting items from the earlier-emitted inner Observable and begins
	 * emitting items from the new one. It continues to behave like this for
	 * subsequent inner Observables.
	 *
	 * @example <caption>Rerun an interval Observable on every click event</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.switchMap((ev) => Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatMap}
	 * @see {@link exhaustMap}
	 * @see {@link mergeMap}
	 * @see {@link switch}
	 * @see {@link switchMapTo}
	 *
	 * @param {function(value: T, ?index: number): Observable} project A function
	 * that, when applied to an item emitted by the source Observable, returns an
	 * Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @return {Observable} An Observable that emits the result of applying the
	 * projection function (and the optional `resultSelector`) to each item emitted
	 * by the source Observable and taking only the values from the most recently
	 * projected inner Observable.
	 * @method switchMap
	 * @owner Observable
	 */
	function switchMap(project, resultSelector) {
	    return this.lift(new SwitchMapOperator(project, resultSelector));
	}
	exports.switchMap = switchMap;
	var SwitchMapOperator = (function () {
	    function SwitchMapOperator(project, resultSelector) {
	        this.project = project;
	        this.resultSelector = resultSelector;
	    }
	    SwitchMapOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SwitchMapSubscriber(subscriber, this.project, this.resultSelector));
	    };
	    return SwitchMapOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SwitchMapSubscriber = (function (_super) {
	    __extends(SwitchMapSubscriber, _super);
	    function SwitchMapSubscriber(destination, project, resultSelector) {
	        _super.call(this, destination);
	        this.project = project;
	        this.resultSelector = resultSelector;
	        this.index = 0;
	    }
	    SwitchMapSubscriber.prototype._next = function (value) {
	        var result;
	        var index = this.index++;
	        try {
	            result = this.project(value, index);
	        }
	        catch (error) {
	            this.destination.error(error);
	            return;
	        }
	        this._innerSub(result, value, index);
	    };
	    SwitchMapSubscriber.prototype._innerSub = function (result, value, index) {
	        var innerSubscription = this.innerSubscription;
	        if (innerSubscription) {
	            innerSubscription.unsubscribe();
	        }
	        this.add(this.innerSubscription = subscribeToResult_1.subscribeToResult(this, result, value, index));
	    };
	    SwitchMapSubscriber.prototype._complete = function () {
	        var innerSubscription = this.innerSubscription;
	        if (!innerSubscription || innerSubscription.closed) {
	            _super.prototype._complete.call(this);
	        }
	    };
	    SwitchMapSubscriber.prototype._unsubscribe = function () {
	        this.innerSubscription = null;
	    };
	    SwitchMapSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.remove(innerSub);
	        this.innerSubscription = null;
	        if (this.isStopped) {
	            _super.prototype._complete.call(this);
	        }
	    };
	    SwitchMapSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        if (this.resultSelector) {
	            this._tryNotifyNext(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        else {
	            this.destination.next(innerValue);
	        }
	    };
	    SwitchMapSubscriber.prototype._tryNotifyNext = function (outerValue, innerValue, outerIndex, innerIndex) {
	        var result;
	        try {
	            result = this.resultSelector(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return SwitchMapSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 307 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var switchMapTo_1 = __webpack_require__(308);
	Observable_1.Observable.prototype.switchMapTo = switchMapTo_1.switchMapTo;


/***/ },
/* 308 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Projects each source value to the same Observable which is flattened multiple
	 * times with {@link switch} in the output Observable.
	 *
	 * <span class="informal">It's like {@link switchMap}, but maps each value
	 * always to the same inner Observable.</span>
	 *
	 * <img src="./img/switchMapTo.png" width="100%">
	 *
	 * Maps each source value to the given Observable `innerObservable` regardless
	 * of the source value, and then flattens those resulting Observables into one
	 * single Observable, which is the output Observable. The output Observables
	 * emits values only from the most recently emitted instance of
	 * `innerObservable`.
	 *
	 * @example <caption>Rerun an interval Observable on every click event</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.switchMapTo(Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link concatMapTo}
	 * @see {@link switch}
	 * @see {@link switchMap}
	 * @see {@link mergeMapTo}
	 *
	 * @param {Observable} innerObservable An Observable to replace each value from
	 * the source Observable.
	 * @param {function(outerValue: T, innerValue: I, outerIndex: number, innerIndex: number): any} [resultSelector]
	 * A function to produce the value on the output Observable based on the values
	 * and the indices of the source (outer) emission and the inner Observable
	 * emission. The arguments passed to this function are:
	 * - `outerValue`: the value that came from the source
	 * - `innerValue`: the value that came from the projected Observable
	 * - `outerIndex`: the "index" of the value that came from the source
	 * - `innerIndex`: the "index" of the value from the projected Observable
	 * @return {Observable} An Observable that emits items from the given
	 * `innerObservable` every time a value is emitted on the source Observable.
	 * @return {Observable} An Observable that emits items from the given
	 * `innerObservable` (and optionally transformed through `resultSelector`) every
	 * time a value is emitted on the source Observable, and taking only the values
	 * from the most recently projected inner Observable.
	 * @method switchMapTo
	 * @owner Observable
	 */
	function switchMapTo(innerObservable, resultSelector) {
	    return this.lift(new SwitchMapToOperator(innerObservable, resultSelector));
	}
	exports.switchMapTo = switchMapTo;
	var SwitchMapToOperator = (function () {
	    function SwitchMapToOperator(observable, resultSelector) {
	        this.observable = observable;
	        this.resultSelector = resultSelector;
	    }
	    SwitchMapToOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new SwitchMapToSubscriber(subscriber, this.observable, this.resultSelector));
	    };
	    return SwitchMapToOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var SwitchMapToSubscriber = (function (_super) {
	    __extends(SwitchMapToSubscriber, _super);
	    function SwitchMapToSubscriber(destination, inner, resultSelector) {
	        _super.call(this, destination);
	        this.inner = inner;
	        this.resultSelector = resultSelector;
	        this.index = 0;
	    }
	    SwitchMapToSubscriber.prototype._next = function (value) {
	        var innerSubscription = this.innerSubscription;
	        if (innerSubscription) {
	            innerSubscription.unsubscribe();
	        }
	        this.add(this.innerSubscription = subscribeToResult_1.subscribeToResult(this, this.inner, value, this.index++));
	    };
	    SwitchMapToSubscriber.prototype._complete = function () {
	        var innerSubscription = this.innerSubscription;
	        if (!innerSubscription || innerSubscription.closed) {
	            _super.prototype._complete.call(this);
	        }
	    };
	    SwitchMapToSubscriber.prototype._unsubscribe = function () {
	        this.innerSubscription = null;
	    };
	    SwitchMapToSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.remove(innerSub);
	        this.innerSubscription = null;
	        if (this.isStopped) {
	            _super.prototype._complete.call(this);
	        }
	    };
	    SwitchMapToSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
	        if (resultSelector) {
	            this.tryResultSelector(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        else {
	            destination.next(innerValue);
	        }
	    };
	    SwitchMapToSubscriber.prototype.tryResultSelector = function (outerValue, innerValue, outerIndex, innerIndex) {
	        var _a = this, resultSelector = _a.resultSelector, destination = _a.destination;
	        var result;
	        try {
	            result = resultSelector(outerValue, innerValue, outerIndex, innerIndex);
	        }
	        catch (err) {
	            destination.error(err);
	            return;
	        }
	        destination.next(result);
	    };
	    return SwitchMapToSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 309 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var take_1 = __webpack_require__(310);
	Observable_1.Observable.prototype.take = take_1.take;


/***/ },
/* 310 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var ArgumentOutOfRangeError_1 = __webpack_require__(195);
	var EmptyObservable_1 = __webpack_require__(44);
	/**
	 * Emits only the first `count` values emitted by the source Observable.
	 *
	 * <span class="informal">Takes the first `count` values from the source, then
	 * completes.</span>
	 *
	 * <img src="./img/take.png" width="100%">
	 *
	 * `take` returns an Observable that emits only the first `count` values emitted
	 * by the source Observable. If the source emits fewer than `count` values then
	 * all of its values are emitted. After that, it completes, regardless if the
	 * source completes.
	 *
	 * @example <caption>Take the first 5 seconds of an infinite 1-second interval Observable</caption>
	 * var interval = Rx.Observable.interval(1000);
	 * var five = interval.take(5);
	 * five.subscribe(x => console.log(x));
	 *
	 * @see {@link takeLast}
	 * @see {@link takeUntil}
	 * @see {@link takeWhile}
	 * @see {@link skip}
	 *
	 * @throws {ArgumentOutOfRangeError} When using `take(i)`, it delivers an
	 * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.
	 *
	 * @param {number} count The maximum number of `next` values to emit.
	 * @return {Observable<T>} An Observable that emits only the first `count`
	 * values emitted by the source Observable, or all of the values from the source
	 * if the source emits fewer than `count` values.
	 * @method take
	 * @owner Observable
	 */
	function take(count) {
	    if (count === 0) {
	        return new EmptyObservable_1.EmptyObservable();
	    }
	    else {
	        return this.lift(new TakeOperator(count));
	    }
	}
	exports.take = take;
	var TakeOperator = (function () {
	    function TakeOperator(total) {
	        this.total = total;
	        if (this.total < 0) {
	            throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;
	        }
	    }
	    TakeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new TakeSubscriber(subscriber, this.total));
	    };
	    return TakeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TakeSubscriber = (function (_super) {
	    __extends(TakeSubscriber, _super);
	    function TakeSubscriber(destination, total) {
	        _super.call(this, destination);
	        this.total = total;
	        this.count = 0;
	    }
	    TakeSubscriber.prototype._next = function (value) {
	        var total = this.total;
	        if (++this.count <= total) {
	            this.destination.next(value);
	            if (this.count === total) {
	                this.destination.complete();
	                this.unsubscribe();
	            }
	        }
	    };
	    return TakeSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 311 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var takeLast_1 = __webpack_require__(312);
	Observable_1.Observable.prototype.takeLast = takeLast_1.takeLast;


/***/ },
/* 312 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var ArgumentOutOfRangeError_1 = __webpack_require__(195);
	var EmptyObservable_1 = __webpack_require__(44);
	/**
	 * Emits only the last `count` values emitted by the source Observable.
	 *
	 * <span class="informal">Remembers the latest `count` values, then emits those
	 * only when the source completes.</span>
	 *
	 * <img src="./img/takeLast.png" width="100%">
	 *
	 * `takeLast` returns an Observable that emits at most the last `count` values
	 * emitted by the source Observable. If the source emits fewer than `count`
	 * values then all of its values are emitted. This operator must wait until the
	 * `complete` notification emission from the source in order to emit the `next`
	 * values on the output Observable, because otherwise it is impossible to know
	 * whether or not more values will be emitted on the source. For this reason,
	 * all values are emitted synchronously, followed by the complete notification.
	 *
	 * @example <caption>Take the last 3 values of an Observable with many values</caption>
	 * var many = Rx.Observable.range(1, 100);
	 * var lastThree = many.takeLast(3);
	 * lastThree.subscribe(x => console.log(x));
	 *
	 * @see {@link take}
	 * @see {@link takeUntil}
	 * @see {@link takeWhile}
	 * @see {@link skip}
	 *
	 * @throws {ArgumentOutOfRangeError} When using `takeLast(i)`, it delivers an
	 * ArgumentOutOrRangeError to the Observer's `error` callback if `i < 0`.
	 *
	 * @param {number} count The maximum number of values to emit from the end of
	 * the sequence of values emitted by the source Observable.
	 * @return {Observable<T>} An Observable that emits at most the last count
	 * values emitted by the source Observable.
	 * @method takeLast
	 * @owner Observable
	 */
	function takeLast(count) {
	    if (count === 0) {
	        return new EmptyObservable_1.EmptyObservable();
	    }
	    else {
	        return this.lift(new TakeLastOperator(count));
	    }
	}
	exports.takeLast = takeLast;
	var TakeLastOperator = (function () {
	    function TakeLastOperator(total) {
	        this.total = total;
	        if (this.total < 0) {
	            throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError;
	        }
	    }
	    TakeLastOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new TakeLastSubscriber(subscriber, this.total));
	    };
	    return TakeLastOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TakeLastSubscriber = (function (_super) {
	    __extends(TakeLastSubscriber, _super);
	    function TakeLastSubscriber(destination, total) {
	        _super.call(this, destination);
	        this.total = total;
	        this.ring = new Array();
	        this.count = 0;
	    }
	    TakeLastSubscriber.prototype._next = function (value) {
	        var ring = this.ring;
	        var total = this.total;
	        var count = this.count++;
	        if (ring.length < total) {
	            ring.push(value);
	        }
	        else {
	            var index = count % total;
	            ring[index] = value;
	        }
	    };
	    TakeLastSubscriber.prototype._complete = function () {
	        var destination = this.destination;
	        var count = this.count;
	        if (count > 0) {
	            var total = this.count >= this.total ? this.total : this.count;
	            var ring = this.ring;
	            for (var i = 0; i < total; i++) {
	                var idx = (count++) % total;
	                destination.next(ring[idx]);
	            }
	        }
	        destination.complete();
	    };
	    return TakeLastSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 313 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var takeUntil_1 = __webpack_require__(314);
	Observable_1.Observable.prototype.takeUntil = takeUntil_1.takeUntil;


/***/ },
/* 314 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Emits the values emitted by the source Observable until a `notifier`
	 * Observable emits a value.
	 *
	 * <span class="informal">Lets values pass until a second Observable,
	 * `notifier`, emits something. Then, it completes.</span>
	 *
	 * <img src="./img/takeUntil.png" width="100%">
	 *
	 * `takeUntil` subscribes and begins mirroring the source Observable. It also
	 * monitors a second Observable, `notifier` that you provide. If the `notifier`
	 * emits a value or a complete notification, the output Observable stops
	 * mirroring the source Observable and completes.
	 *
	 * @example <caption>Tick every second until the first click happens</caption>
	 * var interval = Rx.Observable.interval(1000);
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = interval.takeUntil(clicks);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link take}
	 * @see {@link takeLast}
	 * @see {@link takeWhile}
	 * @see {@link skip}
	 *
	 * @param {Observable} notifier The Observable whose first emitted value will
	 * cause the output Observable of `takeUntil` to stop emitting values from the
	 * source Observable.
	 * @return {Observable<T>} An Observable that emits the values from the source
	 * Observable until such time as `notifier` emits its first value.
	 * @method takeUntil
	 * @owner Observable
	 */
	function takeUntil(notifier) {
	    return this.lift(new TakeUntilOperator(notifier));
	}
	exports.takeUntil = takeUntil;
	var TakeUntilOperator = (function () {
	    function TakeUntilOperator(notifier) {
	        this.notifier = notifier;
	    }
	    TakeUntilOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new TakeUntilSubscriber(subscriber, this.notifier));
	    };
	    return TakeUntilOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TakeUntilSubscriber = (function (_super) {
	    __extends(TakeUntilSubscriber, _super);
	    function TakeUntilSubscriber(destination, notifier) {
	        _super.call(this, destination);
	        this.notifier = notifier;
	        this.add(subscribeToResult_1.subscribeToResult(this, notifier));
	    }
	    TakeUntilSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.complete();
	    };
	    TakeUntilSubscriber.prototype.notifyComplete = function () {
	        // noop
	    };
	    return TakeUntilSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 315 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var takeWhile_1 = __webpack_require__(316);
	Observable_1.Observable.prototype.takeWhile = takeWhile_1.takeWhile;


/***/ },
/* 316 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Emits values emitted by the source Observable so long as each value satisfies
	 * the given `predicate`, and then completes as soon as this `predicate` is not
	 * satisfied.
	 *
	 * <span class="informal">Takes values from the source only while they pass the
	 * condition given. When the first value does not satisfy, it completes.</span>
	 *
	 * <img src="./img/takeWhile.png" width="100%">
	 *
	 * `takeWhile` subscribes and begins mirroring the source Observable. Each value
	 * emitted on the source is given to the `predicate` function which returns a
	 * boolean, representing a condition to be satisfied by the source values. The
	 * output Observable emits the source values until such time as the `predicate`
	 * returns false, at which point `takeWhile` stops mirroring the source
	 * Observable and completes the output Observable.
	 *
	 * @example <caption>Emit click events only while the clientX property is greater than 200</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.takeWhile(ev => ev.clientX > 200);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link take}
	 * @see {@link takeLast}
	 * @see {@link takeUntil}
	 * @see {@link skip}
	 *
	 * @param {function(value: T, index: number): boolean} predicate A function that
	 * evaluates a value emitted by the source Observable and returns a boolean.
	 * Also takes the (zero-based) index as the second argument.
	 * @return {Observable<T>} An Observable that emits the values from the source
	 * Observable so long as each value satisfies the condition defined by the
	 * `predicate`, then completes.
	 * @method takeWhile
	 * @owner Observable
	 */
	function takeWhile(predicate) {
	    return this.lift(new TakeWhileOperator(predicate));
	}
	exports.takeWhile = takeWhile;
	var TakeWhileOperator = (function () {
	    function TakeWhileOperator(predicate) {
	        this.predicate = predicate;
	    }
	    TakeWhileOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new TakeWhileSubscriber(subscriber, this.predicate));
	    };
	    return TakeWhileOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TakeWhileSubscriber = (function (_super) {
	    __extends(TakeWhileSubscriber, _super);
	    function TakeWhileSubscriber(destination, predicate) {
	        _super.call(this, destination);
	        this.predicate = predicate;
	        this.index = 0;
	    }
	    TakeWhileSubscriber.prototype._next = function (value) {
	        var destination = this.destination;
	        var result;
	        try {
	            result = this.predicate(value, this.index++);
	        }
	        catch (err) {
	            destination.error(err);
	            return;
	        }
	        this.nextOrComplete(value, result);
	    };
	    TakeWhileSubscriber.prototype.nextOrComplete = function (value, predicateResult) {
	        var destination = this.destination;
	        if (Boolean(predicateResult)) {
	            destination.next(value);
	        }
	        else {
	            destination.complete();
	        }
	    };
	    return TakeWhileSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 317 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var throttle_1 = __webpack_require__(318);
	Observable_1.Observable.prototype.throttle = throttle_1.throttle;


/***/ },
/* 318 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Emits a value from the source Observable, then ignores subsequent source
	 * values for a duration determined by another Observable, then repeats this
	 * process.
	 *
	 * <span class="informal">It's like {@link throttleTime}, but the silencing
	 * duration is determined by a second Observable.</span>
	 *
	 * <img src="./img/throttle.png" width="100%">
	 *
	 * `throttle` emits the source Observable values on the output Observable
	 * when its internal timer is disabled, and ignores source values when the timer
	 * is enabled. Initially, the timer is disabled. As soon as the first source
	 * value arrives, it is forwarded to the output Observable, and then the timer
	 * is enabled by calling the `durationSelector` function with the source value,
	 * which returns the "duration" Observable. When the duration Observable emits a
	 * value or completes, the timer is disabled, and this process repeats for the
	 * next source value.
	 *
	 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.throttle(ev => Rx.Observable.interval(1000));
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link audit}
	 * @see {@link debounce}
	 * @see {@link delayWhen}
	 * @see {@link sample}
	 * @see {@link throttleTime}
	 *
	 * @param {function(value: T): Observable|Promise} durationSelector A function
	 * that receives a value from the source Observable, for computing the silencing
	 * duration for each source value, returned as an Observable or a Promise.
	 * @return {Observable<T>} An Observable that performs the throttle operation to
	 * limit the rate of emissions from the source.
	 * @method throttle
	 * @owner Observable
	 */
	function throttle(durationSelector) {
	    return this.lift(new ThrottleOperator(durationSelector));
	}
	exports.throttle = throttle;
	var ThrottleOperator = (function () {
	    function ThrottleOperator(durationSelector) {
	        this.durationSelector = durationSelector;
	    }
	    ThrottleOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ThrottleSubscriber(subscriber, this.durationSelector));
	    };
	    return ThrottleOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ThrottleSubscriber = (function (_super) {
	    __extends(ThrottleSubscriber, _super);
	    function ThrottleSubscriber(destination, durationSelector) {
	        _super.call(this, destination);
	        this.destination = destination;
	        this.durationSelector = durationSelector;
	    }
	    ThrottleSubscriber.prototype._next = function (value) {
	        if (!this.throttled) {
	            this.tryDurationSelector(value);
	        }
	    };
	    ThrottleSubscriber.prototype.tryDurationSelector = function (value) {
	        var duration = null;
	        try {
	            duration = this.durationSelector(value);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.emitAndThrottle(value, duration);
	    };
	    ThrottleSubscriber.prototype.emitAndThrottle = function (value, duration) {
	        this.add(this.throttled = subscribeToResult_1.subscribeToResult(this, duration));
	        this.destination.next(value);
	    };
	    ThrottleSubscriber.prototype._unsubscribe = function () {
	        var throttled = this.throttled;
	        if (throttled) {
	            this.remove(throttled);
	            this.throttled = null;
	            throttled.unsubscribe();
	        }
	    };
	    ThrottleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this._unsubscribe();
	    };
	    ThrottleSubscriber.prototype.notifyComplete = function () {
	        this._unsubscribe();
	    };
	    return ThrottleSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 319 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var throttleTime_1 = __webpack_require__(320);
	Observable_1.Observable.prototype.throttleTime = throttleTime_1.throttleTime;


/***/ },
/* 320 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var async_1 = __webpack_require__(88);
	/**
	 * Emits a value from the source Observable, then ignores subsequent source
	 * values for `duration` milliseconds, then repeats this process.
	 *
	 * <span class="informal">Lets a value pass, then ignores source values for the
	 * next `duration` milliseconds.</span>
	 *
	 * <img src="./img/throttleTime.png" width="100%">
	 *
	 * `throttleTime` emits the source Observable values on the output Observable
	 * when its internal timer is disabled, and ignores source values when the timer
	 * is enabled. Initially, the timer is disabled. As soon as the first source
	 * value arrives, it is forwarded to the output Observable, and then the timer
	 * is enabled. After `duration` milliseconds (or the time unit determined
	 * internally by the optional `scheduler`) has passed, the timer is disabled,
	 * and this process repeats for the next source value. Optionally takes a
	 * {@link Scheduler} for managing timers.
	 *
	 * @example <caption>Emit clicks at a rate of at most one click per second</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.throttleTime(1000);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link auditTime}
	 * @see {@link debounceTime}
	 * @see {@link delay}
	 * @see {@link sampleTime}
	 * @see {@link throttle}
	 *
	 * @param {number} duration Time to wait before emitting another value after
	 * emitting the last value, measured in milliseconds or the time unit determined
	 * internally by the optional `scheduler`.
	 * @param {Scheduler} [scheduler=async] The {@link Scheduler} to use for
	 * managing the timers that handle the sampling.
	 * @return {Observable<T>} An Observable that performs the throttle operation to
	 * limit the rate of emissions from the source.
	 * @method throttleTime
	 * @owner Observable
	 */
	function throttleTime(duration, scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new ThrottleTimeOperator(duration, scheduler));
	}
	exports.throttleTime = throttleTime;
	var ThrottleTimeOperator = (function () {
	    function ThrottleTimeOperator(duration, scheduler) {
	        this.duration = duration;
	        this.scheduler = scheduler;
	    }
	    ThrottleTimeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ThrottleTimeSubscriber(subscriber, this.duration, this.scheduler));
	    };
	    return ThrottleTimeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ThrottleTimeSubscriber = (function (_super) {
	    __extends(ThrottleTimeSubscriber, _super);
	    function ThrottleTimeSubscriber(destination, duration, scheduler) {
	        _super.call(this, destination);
	        this.duration = duration;
	        this.scheduler = scheduler;
	    }
	    ThrottleTimeSubscriber.prototype._next = function (value) {
	        if (!this.throttled) {
	            this.add(this.throttled = this.scheduler.schedule(dispatchNext, this.duration, { subscriber: this }));
	            this.destination.next(value);
	        }
	    };
	    ThrottleTimeSubscriber.prototype.clearThrottle = function () {
	        var throttled = this.throttled;
	        if (throttled) {
	            throttled.unsubscribe();
	            this.remove(throttled);
	            this.throttled = null;
	        }
	    };
	    return ThrottleTimeSubscriber;
	}(Subscriber_1.Subscriber));
	function dispatchNext(arg) {
	    var subscriber = arg.subscriber;
	    subscriber.clearThrottle();
	}


/***/ },
/* 321 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var timeInterval_1 = __webpack_require__(322);
	Observable_1.Observable.prototype.timeInterval = timeInterval_1.timeInterval;


/***/ },
/* 322 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var async_1 = __webpack_require__(88);
	/**
	 * @param scheduler
	 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
	 * @method timeInterval
	 * @owner Observable
	 */
	function timeInterval(scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new TimeIntervalOperator(scheduler));
	}
	exports.timeInterval = timeInterval;
	var TimeInterval = (function () {
	    function TimeInterval(value, interval) {
	        this.value = value;
	        this.interval = interval;
	    }
	    return TimeInterval;
	}());
	exports.TimeInterval = TimeInterval;
	;
	var TimeIntervalOperator = (function () {
	    function TimeIntervalOperator(scheduler) {
	        this.scheduler = scheduler;
	    }
	    TimeIntervalOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new TimeIntervalSubscriber(observer, this.scheduler));
	    };
	    return TimeIntervalOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TimeIntervalSubscriber = (function (_super) {
	    __extends(TimeIntervalSubscriber, _super);
	    function TimeIntervalSubscriber(destination, scheduler) {
	        _super.call(this, destination);
	        this.scheduler = scheduler;
	        this.lastTime = 0;
	        this.lastTime = scheduler.now();
	    }
	    TimeIntervalSubscriber.prototype._next = function (value) {
	        var now = this.scheduler.now();
	        var span = now - this.lastTime;
	        this.lastTime = now;
	        this.destination.next(new TimeInterval(value, span));
	    };
	    return TimeIntervalSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 323 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var timeout_1 = __webpack_require__(324);
	Observable_1.Observable.prototype.timeout = timeout_1.timeout;


/***/ },
/* 324 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var async_1 = __webpack_require__(88);
	var isDate_1 = __webpack_require__(121);
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * @param due
	 * @param errorToSend
	 * @param scheduler
	 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
	 * @method timeout
	 * @owner Observable
	 */
	function timeout(due, errorToSend, scheduler) {
	    if (errorToSend === void 0) { errorToSend = null; }
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    var absoluteTimeout = isDate_1.isDate(due);
	    var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
	    return this.lift(new TimeoutOperator(waitFor, absoluteTimeout, errorToSend, scheduler));
	}
	exports.timeout = timeout;
	var TimeoutOperator = (function () {
	    function TimeoutOperator(waitFor, absoluteTimeout, errorToSend, scheduler) {
	        this.waitFor = waitFor;
	        this.absoluteTimeout = absoluteTimeout;
	        this.errorToSend = errorToSend;
	        this.scheduler = scheduler;
	    }
	    TimeoutOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new TimeoutSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.errorToSend, this.scheduler));
	    };
	    return TimeoutOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TimeoutSubscriber = (function (_super) {
	    __extends(TimeoutSubscriber, _super);
	    function TimeoutSubscriber(destination, absoluteTimeout, waitFor, errorToSend, scheduler) {
	        _super.call(this, destination);
	        this.absoluteTimeout = absoluteTimeout;
	        this.waitFor = waitFor;
	        this.errorToSend = errorToSend;
	        this.scheduler = scheduler;
	        this.index = 0;
	        this._previousIndex = 0;
	        this._hasCompleted = false;
	        this.scheduleTimeout();
	    }
	    Object.defineProperty(TimeoutSubscriber.prototype, "previousIndex", {
	        get: function () {
	            return this._previousIndex;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TimeoutSubscriber.prototype, "hasCompleted", {
	        get: function () {
	            return this._hasCompleted;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    TimeoutSubscriber.dispatchTimeout = function (state) {
	        var source = state.subscriber;
	        var currentIndex = state.index;
	        if (!source.hasCompleted && source.previousIndex === currentIndex) {
	            source.notifyTimeout();
	        }
	    };
	    TimeoutSubscriber.prototype.scheduleTimeout = function () {
	        var currentIndex = this.index;
	        this.scheduler.schedule(TimeoutSubscriber.dispatchTimeout, this.waitFor, { subscriber: this, index: currentIndex });
	        this.index++;
	        this._previousIndex = currentIndex;
	    };
	    TimeoutSubscriber.prototype._next = function (value) {
	        this.destination.next(value);
	        if (!this.absoluteTimeout) {
	            this.scheduleTimeout();
	        }
	    };
	    TimeoutSubscriber.prototype._error = function (err) {
	        this.destination.error(err);
	        this._hasCompleted = true;
	    };
	    TimeoutSubscriber.prototype._complete = function () {
	        this.destination.complete();
	        this._hasCompleted = true;
	    };
	    TimeoutSubscriber.prototype.notifyTimeout = function () {
	        this.error(this.errorToSend || new Error('timeout'));
	    };
	    return TimeoutSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 325 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var timeoutWith_1 = __webpack_require__(326);
	Observable_1.Observable.prototype.timeoutWith = timeoutWith_1.timeoutWith;


/***/ },
/* 326 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var async_1 = __webpack_require__(88);
	var isDate_1 = __webpack_require__(121);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * @param due
	 * @param withObservable
	 * @param scheduler
	 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
	 * @method timeoutWith
	 * @owner Observable
	 */
	function timeoutWith(due, withObservable, scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    var absoluteTimeout = isDate_1.isDate(due);
	    var waitFor = absoluteTimeout ? (+due - scheduler.now()) : Math.abs(due);
	    return this.lift(new TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler));
	}
	exports.timeoutWith = timeoutWith;
	var TimeoutWithOperator = (function () {
	    function TimeoutWithOperator(waitFor, absoluteTimeout, withObservable, scheduler) {
	        this.waitFor = waitFor;
	        this.absoluteTimeout = absoluteTimeout;
	        this.withObservable = withObservable;
	        this.scheduler = scheduler;
	    }
	    TimeoutWithOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new TimeoutWithSubscriber(subscriber, this.absoluteTimeout, this.waitFor, this.withObservable, this.scheduler));
	    };
	    return TimeoutWithOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var TimeoutWithSubscriber = (function (_super) {
	    __extends(TimeoutWithSubscriber, _super);
	    function TimeoutWithSubscriber(destination, absoluteTimeout, waitFor, withObservable, scheduler) {
	        _super.call(this);
	        this.destination = destination;
	        this.absoluteTimeout = absoluteTimeout;
	        this.waitFor = waitFor;
	        this.withObservable = withObservable;
	        this.scheduler = scheduler;
	        this.timeoutSubscription = undefined;
	        this.index = 0;
	        this._previousIndex = 0;
	        this._hasCompleted = false;
	        destination.add(this);
	        this.scheduleTimeout();
	    }
	    Object.defineProperty(TimeoutWithSubscriber.prototype, "previousIndex", {
	        get: function () {
	            return this._previousIndex;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    Object.defineProperty(TimeoutWithSubscriber.prototype, "hasCompleted", {
	        get: function () {
	            return this._hasCompleted;
	        },
	        enumerable: true,
	        configurable: true
	    });
	    TimeoutWithSubscriber.dispatchTimeout = function (state) {
	        var source = state.subscriber;
	        var currentIndex = state.index;
	        if (!source.hasCompleted && source.previousIndex === currentIndex) {
	            source.handleTimeout();
	        }
	    };
	    TimeoutWithSubscriber.prototype.scheduleTimeout = function () {
	        var currentIndex = this.index;
	        var timeoutState = { subscriber: this, index: currentIndex };
	        this.scheduler.schedule(TimeoutWithSubscriber.dispatchTimeout, this.waitFor, timeoutState);
	        this.index++;
	        this._previousIndex = currentIndex;
	    };
	    TimeoutWithSubscriber.prototype._next = function (value) {
	        this.destination.next(value);
	        if (!this.absoluteTimeout) {
	            this.scheduleTimeout();
	        }
	    };
	    TimeoutWithSubscriber.prototype._error = function (err) {
	        this.destination.error(err);
	        this._hasCompleted = true;
	    };
	    TimeoutWithSubscriber.prototype._complete = function () {
	        this.destination.complete();
	        this._hasCompleted = true;
	    };
	    TimeoutWithSubscriber.prototype.handleTimeout = function () {
	        if (!this.closed) {
	            var withObservable = this.withObservable;
	            this.unsubscribe();
	            this.destination.add(this.timeoutSubscription = subscribeToResult_1.subscribeToResult(this, withObservable));
	        }
	    };
	    return TimeoutWithSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 327 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var timestamp_1 = __webpack_require__(328);
	Observable_1.Observable.prototype.timestamp = timestamp_1.timestamp;


/***/ },
/* 328 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var async_1 = __webpack_require__(88);
	/**
	 * @param scheduler
	 * @return {Observable<Timestamp<any>>|WebSocketSubject<T>|Observable<T>}
	 * @method timestamp
	 * @owner Observable
	 */
	function timestamp(scheduler) {
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new TimestampOperator(scheduler));
	}
	exports.timestamp = timestamp;
	var Timestamp = (function () {
	    function Timestamp(value, timestamp) {
	        this.value = value;
	        this.timestamp = timestamp;
	    }
	    return Timestamp;
	}());
	exports.Timestamp = Timestamp;
	;
	var TimestampOperator = (function () {
	    function TimestampOperator(scheduler) {
	        this.scheduler = scheduler;
	    }
	    TimestampOperator.prototype.call = function (observer, source) {
	        return source._subscribe(new TimestampSubscriber(observer, this.scheduler));
	    };
	    return TimestampOperator;
	}());
	var TimestampSubscriber = (function (_super) {
	    __extends(TimestampSubscriber, _super);
	    function TimestampSubscriber(destination, scheduler) {
	        _super.call(this, destination);
	        this.scheduler = scheduler;
	    }
	    TimestampSubscriber.prototype._next = function (value) {
	        var now = this.scheduler.now();
	        this.destination.next(new Timestamp(value, now));
	    };
	    return TimestampSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 329 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var toArray_1 = __webpack_require__(330);
	Observable_1.Observable.prototype.toArray = toArray_1.toArray;


/***/ },
/* 330 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
	 * @method toArray
	 * @owner Observable
	 */
	function toArray() {
	    return this.lift(new ToArrayOperator());
	}
	exports.toArray = toArray;
	var ToArrayOperator = (function () {
	    function ToArrayOperator() {
	    }
	    ToArrayOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new ToArraySubscriber(subscriber));
	    };
	    return ToArrayOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ToArraySubscriber = (function (_super) {
	    __extends(ToArraySubscriber, _super);
	    function ToArraySubscriber(destination) {
	        _super.call(this, destination);
	        this.array = [];
	    }
	    ToArraySubscriber.prototype._next = function (x) {
	        this.array.push(x);
	    };
	    ToArraySubscriber.prototype._complete = function () {
	        this.destination.next(this.array);
	        this.destination.complete();
	    };
	    return ToArraySubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 331 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var toPromise_1 = __webpack_require__(332);
	Observable_1.Observable.prototype.toPromise = toPromise_1.toPromise;


/***/ },
/* 332 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	/**
	 * @param PromiseCtor
	 * @return {Promise<T>}
	 * @method toPromise
	 * @owner Observable
	 */
	function toPromise(PromiseCtor) {
	    var _this = this;
	    if (!PromiseCtor) {
	        if (root_1.root.Rx && root_1.root.Rx.config && root_1.root.Rx.config.Promise) {
	            PromiseCtor = root_1.root.Rx.config.Promise;
	        }
	        else if (root_1.root.Promise) {
	            PromiseCtor = root_1.root.Promise;
	        }
	    }
	    if (!PromiseCtor) {
	        throw new Error('no Promise impl found');
	    }
	    return new PromiseCtor(function (resolve, reject) {
	        var value;
	        _this.subscribe(function (x) { return value = x; }, function (err) { return reject(err); }, function () { return resolve(value); });
	    });
	}
	exports.toPromise = toPromise;


/***/ },
/* 333 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var window_1 = __webpack_require__(334);
	Observable_1.Observable.prototype.window = window_1.window;


/***/ },
/* 334 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Branch out the source Observable values as a nested Observable whenever
	 * `windowBoundaries` emits.
	 *
	 * <span class="informal">It's like {@link buffer}, but emits a nested Observable
	 * instead of an array.</span>
	 *
	 * <img src="./img/window.png" width="100%">
	 *
	 * Returns an Observable that emits windows of items it collects from the source
	 * Observable. The output Observable emits connected, non-overlapping
	 * windows. It emits the current window and opens a new one whenever the
	 * Observable `windowBoundaries` emits an item. Because each window is an
	 * Observable, the output is a higher-order Observable.
	 *
	 * @example <caption>In every window of 1 second each, emit at most 2 click events</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var interval = Rx.Observable.interval(1000);
	 * var result = clicks.window(interval)
	 *   .map(win => win.take(2)) // each window has at most 2 emissions
	 *   .mergeAll(); // flatten the Observable-of-Observables
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link windowCount}
	 * @see {@link windowTime}
	 * @see {@link windowToggle}
	 * @see {@link windowWhen}
	 * @see {@link buffer}
	 *
	 * @param {Observable<any>} windowBoundaries An Observable that completes the
	 * previous window and starts a new window.
	 * @return {Observable<Observable<T>>} An Observable of windows, which are
	 * Observables emitting values of the source Observable.
	 * @method window
	 * @owner Observable
	 */
	function window(windowBoundaries) {
	    return this.lift(new WindowOperator(windowBoundaries));
	}
	exports.window = window;
	var WindowOperator = (function () {
	    function WindowOperator(windowBoundaries) {
	        this.windowBoundaries = windowBoundaries;
	    }
	    WindowOperator.prototype.call = function (subscriber, source) {
	        var windowSubscriber = new WindowSubscriber(subscriber);
	        var sourceSubscription = source._subscribe(windowSubscriber);
	        if (!sourceSubscription.closed) {
	            windowSubscriber.add(subscribeToResult_1.subscribeToResult(windowSubscriber, this.windowBoundaries));
	        }
	        return sourceSubscription;
	    };
	    return WindowOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var WindowSubscriber = (function (_super) {
	    __extends(WindowSubscriber, _super);
	    function WindowSubscriber(destination) {
	        _super.call(this, destination);
	        this.window = new Subject_1.Subject();
	        destination.next(this.window);
	    }
	    WindowSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.openWindow();
	    };
	    WindowSubscriber.prototype.notifyError = function (error, innerSub) {
	        this._error(error);
	    };
	    WindowSubscriber.prototype.notifyComplete = function (innerSub) {
	        this._complete();
	    };
	    WindowSubscriber.prototype._next = function (value) {
	        this.window.next(value);
	    };
	    WindowSubscriber.prototype._error = function (err) {
	        this.window.error(err);
	        this.destination.error(err);
	    };
	    WindowSubscriber.prototype._complete = function () {
	        this.window.complete();
	        this.destination.complete();
	    };
	    WindowSubscriber.prototype._unsubscribe = function () {
	        this.window = null;
	    };
	    WindowSubscriber.prototype.openWindow = function () {
	        var prevWindow = this.window;
	        if (prevWindow) {
	            prevWindow.complete();
	        }
	        var destination = this.destination;
	        var newWindow = this.window = new Subject_1.Subject();
	        destination.next(newWindow);
	    };
	    return WindowSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 335 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var windowCount_1 = __webpack_require__(336);
	Observable_1.Observable.prototype.windowCount = windowCount_1.windowCount;


/***/ },
/* 336 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subscriber_1 = __webpack_require__(19);
	var Subject_1 = __webpack_require__(15);
	/**
	 * Branch out the source Observable values as a nested Observable with each
	 * nested Observable emitting at most `windowSize` values.
	 *
	 * <span class="informal">It's like {@link bufferCount}, but emits a nested
	 * Observable instead of an array.</span>
	 *
	 * <img src="./img/windowCount.png" width="100%">
	 *
	 * Returns an Observable that emits windows of items it collects from the source
	 * Observable. The output Observable emits windows every `startWindowEvery`
	 * items, each containing no more than `windowSize` items. When the source
	 * Observable completes or encounters an error, the output Observable emits
	 * the current window and propagates the notification from the source
	 * Observable. If `startWindowEvery` is not provided, then new windows are
	 * started immediately at the start of the source and when each window completes
	 * with size `windowSize`.
	 *
	 * @example <caption>Ignore every 3rd click event, starting from the first one</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.windowCount(3)
	 *   .map(win => win.skip(1)) // skip first of every 3 clicks
	 *   .mergeAll(); // flatten the Observable-of-Observables
	 * result.subscribe(x => console.log(x));
	 *
	 * @example <caption>Ignore every 3rd click event, starting from the third one</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.windowCount(2, 3)
	 *   .mergeAll(); // flatten the Observable-of-Observables
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link window}
	 * @see {@link windowTime}
	 * @see {@link windowToggle}
	 * @see {@link windowWhen}
	 * @see {@link bufferCount}
	 *
	 * @param {number} windowSize The maximum number of values emitted by each
	 * window.
	 * @param {number} [startWindowEvery] Interval at which to start a new window.
	 * For example if `startWindowEvery` is `2`, then a new window will be started
	 * on every other value from the source. A new window is started at the
	 * beginning of the source by default.
	 * @return {Observable<Observable<T>>} An Observable of windows, which in turn
	 * are Observable of values.
	 * @method windowCount
	 * @owner Observable
	 */
	function windowCount(windowSize, startWindowEvery) {
	    if (startWindowEvery === void 0) { startWindowEvery = 0; }
	    return this.lift(new WindowCountOperator(windowSize, startWindowEvery));
	}
	exports.windowCount = windowCount;
	var WindowCountOperator = (function () {
	    function WindowCountOperator(windowSize, startWindowEvery) {
	        this.windowSize = windowSize;
	        this.startWindowEvery = startWindowEvery;
	    }
	    WindowCountOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new WindowCountSubscriber(subscriber, this.windowSize, this.startWindowEvery));
	    };
	    return WindowCountOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var WindowCountSubscriber = (function (_super) {
	    __extends(WindowCountSubscriber, _super);
	    function WindowCountSubscriber(destination, windowSize, startWindowEvery) {
	        _super.call(this, destination);
	        this.destination = destination;
	        this.windowSize = windowSize;
	        this.startWindowEvery = startWindowEvery;
	        this.windows = [new Subject_1.Subject()];
	        this.count = 0;
	        destination.next(this.windows[0]);
	    }
	    WindowCountSubscriber.prototype._next = function (value) {
	        var startWindowEvery = (this.startWindowEvery > 0) ? this.startWindowEvery : this.windowSize;
	        var destination = this.destination;
	        var windowSize = this.windowSize;
	        var windows = this.windows;
	        var len = windows.length;
	        for (var i = 0; i < len && !this.closed; i++) {
	            windows[i].next(value);
	        }
	        var c = this.count - windowSize + 1;
	        if (c >= 0 && c % startWindowEvery === 0 && !this.closed) {
	            windows.shift().complete();
	        }
	        if (++this.count % startWindowEvery === 0 && !this.closed) {
	            var window_1 = new Subject_1.Subject();
	            windows.push(window_1);
	            destination.next(window_1);
	        }
	    };
	    WindowCountSubscriber.prototype._error = function (err) {
	        var windows = this.windows;
	        if (windows) {
	            while (windows.length > 0 && !this.closed) {
	                windows.shift().error(err);
	            }
	        }
	        this.destination.error(err);
	    };
	    WindowCountSubscriber.prototype._complete = function () {
	        var windows = this.windows;
	        if (windows) {
	            while (windows.length > 0 && !this.closed) {
	                windows.shift().complete();
	            }
	        }
	        this.destination.complete();
	    };
	    WindowCountSubscriber.prototype._unsubscribe = function () {
	        this.count = 0;
	        this.windows = null;
	    };
	    return WindowCountSubscriber;
	}(Subscriber_1.Subscriber));


/***/ },
/* 337 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var windowTime_1 = __webpack_require__(338);
	Observable_1.Observable.prototype.windowTime = windowTime_1.windowTime;


/***/ },
/* 338 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var async_1 = __webpack_require__(88);
	var Subscriber_1 = __webpack_require__(19);
	/**
	 * Branch out the source Observable values as a nested Observable periodically
	 * in time.
	 *
	 * <span class="informal">It's like {@link bufferTime}, but emits a nested
	 * Observable instead of an array.</span>
	 *
	 * <img src="./img/windowTime.png" width="100%">
	 *
	 * Returns an Observable that emits windows of items it collects from the source
	 * Observable. The output Observable starts a new window periodically, as
	 * determined by the `windowCreationInterval` argument. It emits each window
	 * after a fixed timespan, specified by the `windowTimeSpan` argument. When the
	 * source Observable completes or encounters an error, the output Observable
	 * emits the current window and propagates the notification from the source
	 * Observable. If `windowCreationInterval` is not provided, the output
	 * Observable starts a new window when the previous window of duration
	 * `windowTimeSpan` completes.
	 *
	 * @example <caption>In every window of 1 second each, emit at most 2 click events</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.windowTime(1000)
	 *   .map(win => win.take(2)) // each window has at most 2 emissions
	 *   .mergeAll(); // flatten the Observable-of-Observables
	 * result.subscribe(x => console.log(x));
	 *
	 * @example <caption>Every 5 seconds start a window 1 second long, and emit at most 2 click events per window</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks.windowTime(1000, 5000)
	 *   .map(win => win.take(2)) // each window has at most 2 emissions
	 *   .mergeAll(); // flatten the Observable-of-Observables
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link window}
	 * @see {@link windowCount}
	 * @see {@link windowToggle}
	 * @see {@link windowWhen}
	 * @see {@link bufferTime}
	 *
	 * @param {number} windowTimeSpan The amount of time to fill each window.
	 * @param {number} [windowCreationInterval] The interval at which to start new
	 * windows.
	 * @param {Scheduler} [scheduler=async] The scheduler on which to schedule the
	 * intervals that determine window boundaries.
	 * @return {Observable<Observable<T>>} An observable of windows, which in turn
	 * are Observables.
	 * @method windowTime
	 * @owner Observable
	 */
	function windowTime(windowTimeSpan, windowCreationInterval, scheduler) {
	    if (windowCreationInterval === void 0) { windowCreationInterval = null; }
	    if (scheduler === void 0) { scheduler = async_1.async; }
	    return this.lift(new WindowTimeOperator(windowTimeSpan, windowCreationInterval, scheduler));
	}
	exports.windowTime = windowTime;
	var WindowTimeOperator = (function () {
	    function WindowTimeOperator(windowTimeSpan, windowCreationInterval, scheduler) {
	        this.windowTimeSpan = windowTimeSpan;
	        this.windowCreationInterval = windowCreationInterval;
	        this.scheduler = scheduler;
	    }
	    WindowTimeOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new WindowTimeSubscriber(subscriber, this.windowTimeSpan, this.windowCreationInterval, this.scheduler));
	    };
	    return WindowTimeOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var WindowTimeSubscriber = (function (_super) {
	    __extends(WindowTimeSubscriber, _super);
	    function WindowTimeSubscriber(destination, windowTimeSpan, windowCreationInterval, scheduler) {
	        _super.call(this, destination);
	        this.destination = destination;
	        this.windowTimeSpan = windowTimeSpan;
	        this.windowCreationInterval = windowCreationInterval;
	        this.scheduler = scheduler;
	        this.windows = [];
	        if (windowCreationInterval !== null && windowCreationInterval >= 0) {
	            var window_1 = this.openWindow();
	            var closeState = { subscriber: this, window: window_1, context: null };
	            var creationState = { windowTimeSpan: windowTimeSpan, windowCreationInterval: windowCreationInterval, subscriber: this, scheduler: scheduler };
	            this.add(scheduler.schedule(dispatchWindowClose, windowTimeSpan, closeState));
	            this.add(scheduler.schedule(dispatchWindowCreation, windowCreationInterval, creationState));
	        }
	        else {
	            var window_2 = this.openWindow();
	            var timeSpanOnlyState = { subscriber: this, window: window_2, windowTimeSpan: windowTimeSpan };
	            this.add(scheduler.schedule(dispatchWindowTimeSpanOnly, windowTimeSpan, timeSpanOnlyState));
	        }
	    }
	    WindowTimeSubscriber.prototype._next = function (value) {
	        var windows = this.windows;
	        var len = windows.length;
	        for (var i = 0; i < len; i++) {
	            var window_3 = windows[i];
	            if (!window_3.closed) {
	                window_3.next(value);
	            }
	        }
	    };
	    WindowTimeSubscriber.prototype._error = function (err) {
	        var windows = this.windows;
	        while (windows.length > 0) {
	            windows.shift().error(err);
	        }
	        this.destination.error(err);
	    };
	    WindowTimeSubscriber.prototype._complete = function () {
	        var windows = this.windows;
	        while (windows.length > 0) {
	            var window_4 = windows.shift();
	            if (!window_4.closed) {
	                window_4.complete();
	            }
	        }
	        this.destination.complete();
	    };
	    WindowTimeSubscriber.prototype.openWindow = function () {
	        var window = new Subject_1.Subject();
	        this.windows.push(window);
	        var destination = this.destination;
	        destination.next(window);
	        return window;
	    };
	    WindowTimeSubscriber.prototype.closeWindow = function (window) {
	        window.complete();
	        var windows = this.windows;
	        windows.splice(windows.indexOf(window), 1);
	    };
	    return WindowTimeSubscriber;
	}(Subscriber_1.Subscriber));
	function dispatchWindowTimeSpanOnly(state) {
	    var subscriber = state.subscriber, windowTimeSpan = state.windowTimeSpan, window = state.window;
	    if (window) {
	        window.complete();
	    }
	    state.window = subscriber.openWindow();
	    this.schedule(state, windowTimeSpan);
	}
	function dispatchWindowCreation(state) {
	    var windowTimeSpan = state.windowTimeSpan, subscriber = state.subscriber, scheduler = state.scheduler, windowCreationInterval = state.windowCreationInterval;
	    var window = subscriber.openWindow();
	    var action = this;
	    var context = { action: action, subscription: null };
	    var timeSpanState = { subscriber: subscriber, window: window, context: context };
	    context.subscription = scheduler.schedule(dispatchWindowClose, windowTimeSpan, timeSpanState);
	    action.add(context.subscription);
	    action.schedule(state, windowCreationInterval);
	}
	function dispatchWindowClose(arg) {
	    var subscriber = arg.subscriber, window = arg.window, context = arg.context;
	    if (context && context.action && context.subscription) {
	        context.action.remove(context.subscription);
	    }
	    subscriber.closeWindow(window);
	}


/***/ },
/* 339 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var windowToggle_1 = __webpack_require__(340);
	Observable_1.Observable.prototype.windowToggle = windowToggle_1.windowToggle;


/***/ },
/* 340 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var Subscription_1 = __webpack_require__(21);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Branch out the source Observable values as a nested Observable starting from
	 * an emission from `openings` and ending when the output of `closingSelector`
	 * emits.
	 *
	 * <span class="informal">It's like {@link bufferToggle}, but emits a nested
	 * Observable instead of an array.</span>
	 *
	 * <img src="./img/windowToggle.png" width="100%">
	 *
	 * Returns an Observable that emits windows of items it collects from the source
	 * Observable. The output Observable emits windows that contain those items
	 * emitted by the source Observable between the time when the `openings`
	 * Observable emits an item and when the Observable returned by
	 * `closingSelector` emits an item.
	 *
	 * @example <caption>Every other second, emit the click events from the next 500ms</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var openings = Rx.Observable.interval(1000);
	 * var result = clicks.windowToggle(openings, i =>
	 *   i % 2 ? Rx.Observable.interval(500) : Rx.Observable.empty()
	 * ).mergeAll();
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link window}
	 * @see {@link windowCount}
	 * @see {@link windowTime}
	 * @see {@link windowWhen}
	 * @see {@link bufferToggle}
	 *
	 * @param {Observable<O>} openings An observable of notifications to start new
	 * windows.
	 * @param {function(value: O): Observable} closingSelector A function that takes
	 * the value emitted by the `openings` observable and returns an Observable,
	 * which, when it emits (either `next` or `complete`), signals that the
	 * associated window should complete.
	 * @return {Observable<Observable<T>>} An observable of windows, which in turn
	 * are Observables.
	 * @method windowToggle
	 * @owner Observable
	 */
	function windowToggle(openings, closingSelector) {
	    return this.lift(new WindowToggleOperator(openings, closingSelector));
	}
	exports.windowToggle = windowToggle;
	var WindowToggleOperator = (function () {
	    function WindowToggleOperator(openings, closingSelector) {
	        this.openings = openings;
	        this.closingSelector = closingSelector;
	    }
	    WindowToggleOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new WindowToggleSubscriber(subscriber, this.openings, this.closingSelector));
	    };
	    return WindowToggleOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var WindowToggleSubscriber = (function (_super) {
	    __extends(WindowToggleSubscriber, _super);
	    function WindowToggleSubscriber(destination, openings, closingSelector) {
	        _super.call(this, destination);
	        this.openings = openings;
	        this.closingSelector = closingSelector;
	        this.contexts = [];
	        this.add(this.openSubscription = subscribeToResult_1.subscribeToResult(this, openings, openings));
	    }
	    WindowToggleSubscriber.prototype._next = function (value) {
	        var contexts = this.contexts;
	        if (contexts) {
	            var len = contexts.length;
	            for (var i = 0; i < len; i++) {
	                contexts[i].window.next(value);
	            }
	        }
	    };
	    WindowToggleSubscriber.prototype._error = function (err) {
	        var contexts = this.contexts;
	        this.contexts = null;
	        if (contexts) {
	            var len = contexts.length;
	            var index = -1;
	            while (++index < len) {
	                var context = contexts[index];
	                context.window.error(err);
	                context.subscription.unsubscribe();
	            }
	        }
	        _super.prototype._error.call(this, err);
	    };
	    WindowToggleSubscriber.prototype._complete = function () {
	        var contexts = this.contexts;
	        this.contexts = null;
	        if (contexts) {
	            var len = contexts.length;
	            var index = -1;
	            while (++index < len) {
	                var context = contexts[index];
	                context.window.complete();
	                context.subscription.unsubscribe();
	            }
	        }
	        _super.prototype._complete.call(this);
	    };
	    WindowToggleSubscriber.prototype._unsubscribe = function () {
	        var contexts = this.contexts;
	        this.contexts = null;
	        if (contexts) {
	            var len = contexts.length;
	            var index = -1;
	            while (++index < len) {
	                var context = contexts[index];
	                context.window.unsubscribe();
	                context.subscription.unsubscribe();
	            }
	        }
	    };
	    WindowToggleSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        if (outerValue === this.openings) {
	            var closingSelector = this.closingSelector;
	            var closingNotifier = tryCatch_1.tryCatch(closingSelector)(innerValue);
	            if (closingNotifier === errorObject_1.errorObject) {
	                return this.error(errorObject_1.errorObject.e);
	            }
	            else {
	                var window_1 = new Subject_1.Subject();
	                var subscription = new Subscription_1.Subscription();
	                var context = { window: window_1, subscription: subscription };
	                this.contexts.push(context);
	                var innerSubscription = subscribeToResult_1.subscribeToResult(this, closingNotifier, context);
	                if (innerSubscription.closed) {
	                    this.closeWindow(this.contexts.length - 1);
	                }
	                else {
	                    innerSubscription.context = context;
	                    subscription.add(innerSubscription);
	                }
	                this.destination.next(window_1);
	            }
	        }
	        else {
	            this.closeWindow(this.contexts.indexOf(outerValue));
	        }
	    };
	    WindowToggleSubscriber.prototype.notifyError = function (err) {
	        this.error(err);
	    };
	    WindowToggleSubscriber.prototype.notifyComplete = function (inner) {
	        if (inner !== this.openSubscription) {
	            this.closeWindow(this.contexts.indexOf(inner.context));
	        }
	    };
	    WindowToggleSubscriber.prototype.closeWindow = function (index) {
	        if (index === -1) {
	            return;
	        }
	        var contexts = this.contexts;
	        var context = contexts[index];
	        var window = context.window, subscription = context.subscription;
	        contexts.splice(index, 1);
	        window.complete();
	        subscription.unsubscribe();
	    };
	    return WindowToggleSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 341 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var windowWhen_1 = __webpack_require__(342);
	Observable_1.Observable.prototype.windowWhen = windowWhen_1.windowWhen;


/***/ },
/* 342 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var tryCatch_1 = __webpack_require__(24);
	var errorObject_1 = __webpack_require__(25);
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Branch out the source Observable values as a nested Observable using a
	 * factory function of closing Observables to determine when to start a new
	 * window.
	 *
	 * <span class="informal">It's like {@link bufferWhen}, but emits a nested
	 * Observable instead of an array.</span>
	 *
	 * <img src="./img/windowWhen.png" width="100%">
	 *
	 * Returns an Observable that emits windows of items it collects from the source
	 * Observable. The output Observable emits connected, non-overlapping windows.
	 * It emits the current window and opens a new one whenever the Observable
	 * produced by the specified `closingSelector` function emits an item. The first
	 * window is opened immediately when subscribing to the output Observable.
	 *
	 * @example <caption>Emit only the first two clicks events in every window of [1-5] random seconds</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var result = clicks
	 *   .windowWhen(() => Rx.Observable.interval(1000 + Math.random() * 4000))
	 *   .map(win => win.take(2)) // each window has at most 2 emissions
	 *   .mergeAll(); // flatten the Observable-of-Observables
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link window}
	 * @see {@link windowCount}
	 * @see {@link windowTime}
	 * @see {@link windowToggle}
	 * @see {@link bufferWhen}
	 *
	 * @param {function(): Observable} closingSelector A function that takes no
	 * arguments and returns an Observable that signals (on either `next` or
	 * `complete`) when to close the previous window and start a new one.
	 * @return {Observable<Observable<T>>} An observable of windows, which in turn
	 * are Observables.
	 * @method windowWhen
	 * @owner Observable
	 */
	function windowWhen(closingSelector) {
	    return this.lift(new WindowOperator(closingSelector));
	}
	exports.windowWhen = windowWhen;
	var WindowOperator = (function () {
	    function WindowOperator(closingSelector) {
	        this.closingSelector = closingSelector;
	    }
	    WindowOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new WindowSubscriber(subscriber, this.closingSelector));
	    };
	    return WindowOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var WindowSubscriber = (function (_super) {
	    __extends(WindowSubscriber, _super);
	    function WindowSubscriber(destination, closingSelector) {
	        _super.call(this, destination);
	        this.destination = destination;
	        this.closingSelector = closingSelector;
	        this.openWindow();
	    }
	    WindowSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.openWindow(innerSub);
	    };
	    WindowSubscriber.prototype.notifyError = function (error, innerSub) {
	        this._error(error);
	    };
	    WindowSubscriber.prototype.notifyComplete = function (innerSub) {
	        this.openWindow(innerSub);
	    };
	    WindowSubscriber.prototype._next = function (value) {
	        this.window.next(value);
	    };
	    WindowSubscriber.prototype._error = function (err) {
	        this.window.error(err);
	        this.destination.error(err);
	        this.unsubscribeClosingNotification();
	    };
	    WindowSubscriber.prototype._complete = function () {
	        this.window.complete();
	        this.destination.complete();
	        this.unsubscribeClosingNotification();
	    };
	    WindowSubscriber.prototype.unsubscribeClosingNotification = function () {
	        if (this.closingNotification) {
	            this.closingNotification.unsubscribe();
	        }
	    };
	    WindowSubscriber.prototype.openWindow = function (innerSub) {
	        if (innerSub === void 0) { innerSub = null; }
	        if (innerSub) {
	            this.remove(innerSub);
	            innerSub.unsubscribe();
	        }
	        var prevWindow = this.window;
	        if (prevWindow) {
	            prevWindow.complete();
	        }
	        var window = this.window = new Subject_1.Subject();
	        this.destination.next(window);
	        var closingNotifier = tryCatch_1.tryCatch(this.closingSelector)();
	        if (closingNotifier === errorObject_1.errorObject) {
	            var err = errorObject_1.errorObject.e;
	            this.destination.error(err);
	            this.window.error(err);
	        }
	        else {
	            this.add(this.closingNotification = subscribeToResult_1.subscribeToResult(this, closingNotifier));
	        }
	    };
	    return WindowSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 343 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var withLatestFrom_1 = __webpack_require__(344);
	Observable_1.Observable.prototype.withLatestFrom = withLatestFrom_1.withLatestFrom;


/***/ },
/* 344 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var OuterSubscriber_1 = __webpack_require__(46);
	var subscribeToResult_1 = __webpack_require__(47);
	/**
	 * Combines the source Observable with other Observables to create an Observable
	 * whose values are calculated from the latest values of each, only when the
	 * source emits.
	 *
	 * <span class="informal">Whenever the source Observable emits a value, it
	 * computes a formula using that value plus the latest values from other input
	 * Observables, then emits the output of that formula.</span>
	 *
	 * <img src="./img/withLatestFrom.png" width="100%">
	 *
	 * `withLatestFrom` combines each value from the source Observable (the
	 * instance) with the latest values from the other input Observables only when
	 * the source emits a value, optionally using a `project` function to determine
	 * the value to be emitted on the output Observable. All input Observables must
	 * emit at least one value before the output Observable will emit a value.
	 *
	 * @example <caption>On every click event, emit an array with the latest timer event plus the click event</caption>
	 * var clicks = Rx.Observable.fromEvent(document, 'click');
	 * var timer = Rx.Observable.interval(1000);
	 * var result = clicks.withLatestFrom(timer);
	 * result.subscribe(x => console.log(x));
	 *
	 * @see {@link combineLatest}
	 *
	 * @param {Observable} other An input Observable to combine with the source
	 * Observable. More than one input Observables may be given as argument.
	 * @param {Function} [project] Projection function for combining values
	 * together. Receives all values in order of the Observables passed, where the
	 * first parameter is a value from the source Observable. (e.g.
	 * `a.withLatestFrom(b, c, (a1, b1, c1) => a1 + b1 + c1)`). If this is not
	 * passed, arrays will be emitted on the output Observable.
	 * @return {Observable} An Observable of projected values from the most recent
	 * values from each input Observable, or an array of the most recent values from
	 * each input Observable.
	 * @method withLatestFrom
	 * @owner Observable
	 */
	function withLatestFrom() {
	    var args = [];
	    for (var _i = 0; _i < arguments.length; _i++) {
	        args[_i - 0] = arguments[_i];
	    }
	    var project;
	    if (typeof args[args.length - 1] === 'function') {
	        project = args.pop();
	    }
	    var observables = args;
	    return this.lift(new WithLatestFromOperator(observables, project));
	}
	exports.withLatestFrom = withLatestFrom;
	/* tslint:enable:max-line-length */
	var WithLatestFromOperator = (function () {
	    function WithLatestFromOperator(observables, project) {
	        this.observables = observables;
	        this.project = project;
	    }
	    WithLatestFromOperator.prototype.call = function (subscriber, source) {
	        return source._subscribe(new WithLatestFromSubscriber(subscriber, this.observables, this.project));
	    };
	    return WithLatestFromOperator;
	}());
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var WithLatestFromSubscriber = (function (_super) {
	    __extends(WithLatestFromSubscriber, _super);
	    function WithLatestFromSubscriber(destination, observables, project) {
	        _super.call(this, destination);
	        this.observables = observables;
	        this.project = project;
	        this.toRespond = [];
	        var len = observables.length;
	        this.values = new Array(len);
	        for (var i = 0; i < len; i++) {
	            this.toRespond.push(i);
	        }
	        for (var i = 0; i < len; i++) {
	            var observable = observables[i];
	            this.add(subscribeToResult_1.subscribeToResult(this, observable, observable, i));
	        }
	    }
	    WithLatestFromSubscriber.prototype.notifyNext = function (outerValue, innerValue, outerIndex, innerIndex, innerSub) {
	        this.values[outerIndex] = innerValue;
	        var toRespond = this.toRespond;
	        if (toRespond.length > 0) {
	            var found = toRespond.indexOf(outerIndex);
	            if (found !== -1) {
	                toRespond.splice(found, 1);
	            }
	        }
	    };
	    WithLatestFromSubscriber.prototype.notifyComplete = function () {
	        // noop
	    };
	    WithLatestFromSubscriber.prototype._next = function (value) {
	        if (this.toRespond.length === 0) {
	            var args = [value].concat(this.values);
	            if (this.project) {
	                this._tryProject(args);
	            }
	            else {
	                this.destination.next(args);
	            }
	        }
	    };
	    WithLatestFromSubscriber.prototype._tryProject = function (args) {
	        var result;
	        try {
	            result = this.project.apply(this, args);
	        }
	        catch (err) {
	            this.destination.error(err);
	            return;
	        }
	        this.destination.next(result);
	    };
	    return WithLatestFromSubscriber;
	}(OuterSubscriber_1.OuterSubscriber));


/***/ },
/* 345 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var zip_1 = __webpack_require__(124);
	Observable_1.Observable.prototype.zip = zip_1.zipProto;


/***/ },
/* 346 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Observable_1 = __webpack_require__(16);
	var zipAll_1 = __webpack_require__(347);
	Observable_1.Observable.prototype.zipAll = zipAll_1.zipAll;


/***/ },
/* 347 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var zip_1 = __webpack_require__(124);
	/**
	 * @param project
	 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
	 * @method zipAll
	 * @owner Observable
	 */
	function zipAll(project) {
	    return this.lift(new zip_1.ZipOperator(project));
	}
	exports.zipAll = zipAll;


/***/ },
/* 348 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var Notification_1 = __webpack_require__(70);
	var ColdObservable_1 = __webpack_require__(349);
	var HotObservable_1 = __webpack_require__(353);
	var SubscriptionLog_1 = __webpack_require__(351);
	var VirtualTimeScheduler_1 = __webpack_require__(354);
	var defaultMaxFrame = 750;
	var TestScheduler = (function (_super) {
	    __extends(TestScheduler, _super);
	    function TestScheduler(assertDeepEqual) {
	        _super.call(this, VirtualTimeScheduler_1.VirtualAction, defaultMaxFrame);
	        this.assertDeepEqual = assertDeepEqual;
	        this.hotObservables = [];
	        this.coldObservables = [];
	        this.flushTests = [];
	    }
	    TestScheduler.prototype.createTime = function (marbles) {
	        var indexOf = marbles.indexOf('|');
	        if (indexOf === -1) {
	            throw new Error('marble diagram for time should have a completion marker "|"');
	        }
	        return indexOf * TestScheduler.frameTimeFactor;
	    };
	    TestScheduler.prototype.createColdObservable = function (marbles, values, error) {
	        if (marbles.indexOf('^') !== -1) {
	            throw new Error('cold observable cannot have subscription offset "^"');
	        }
	        if (marbles.indexOf('!') !== -1) {
	            throw new Error('cold observable cannot have unsubscription marker "!"');
	        }
	        var messages = TestScheduler.parseMarbles(marbles, values, error);
	        var cold = new ColdObservable_1.ColdObservable(messages, this);
	        this.coldObservables.push(cold);
	        return cold;
	    };
	    TestScheduler.prototype.createHotObservable = function (marbles, values, error) {
	        if (marbles.indexOf('!') !== -1) {
	            throw new Error('hot observable cannot have unsubscription marker "!"');
	        }
	        var messages = TestScheduler.parseMarbles(marbles, values, error);
	        var subject = new HotObservable_1.HotObservable(messages, this);
	        this.hotObservables.push(subject);
	        return subject;
	    };
	    TestScheduler.prototype.materializeInnerObservable = function (observable, outerFrame) {
	        var _this = this;
	        var messages = [];
	        observable.subscribe(function (value) {
	            messages.push({ frame: _this.frame - outerFrame, notification: Notification_1.Notification.createNext(value) });
	        }, function (err) {
	            messages.push({ frame: _this.frame - outerFrame, notification: Notification_1.Notification.createError(err) });
	        }, function () {
	            messages.push({ frame: _this.frame - outerFrame, notification: Notification_1.Notification.createComplete() });
	        });
	        return messages;
	    };
	    TestScheduler.prototype.expectObservable = function (observable, unsubscriptionMarbles) {
	        var _this = this;
	        if (unsubscriptionMarbles === void 0) { unsubscriptionMarbles = null; }
	        var actual = [];
	        var flushTest = { actual: actual, ready: false };
	        var unsubscriptionFrame = TestScheduler
	            .parseMarblesAsSubscriptions(unsubscriptionMarbles).unsubscribedFrame;
	        var subscription;
	        this.schedule(function () {
	            subscription = observable.subscribe(function (x) {
	                var value = x;
	                // Support Observable-of-Observables
	                if (x instanceof Observable_1.Observable) {
	                    value = _this.materializeInnerObservable(value, _this.frame);
	                }
	                actual.push({ frame: _this.frame, notification: Notification_1.Notification.createNext(value) });
	            }, function (err) {
	                actual.push({ frame: _this.frame, notification: Notification_1.Notification.createError(err) });
	            }, function () {
	                actual.push({ frame: _this.frame, notification: Notification_1.Notification.createComplete() });
	            });
	        }, 0);
	        if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
	            this.schedule(function () { return subscription.unsubscribe(); }, unsubscriptionFrame);
	        }
	        this.flushTests.push(flushTest);
	        return {
	            toBe: function (marbles, values, errorValue) {
	                flushTest.ready = true;
	                flushTest.expected = TestScheduler.parseMarbles(marbles, values, errorValue, true);
	            }
	        };
	    };
	    TestScheduler.prototype.expectSubscriptions = function (actualSubscriptionLogs) {
	        var flushTest = { actual: actualSubscriptionLogs, ready: false };
	        this.flushTests.push(flushTest);
	        return {
	            toBe: function (marbles) {
	                var marblesArray = (typeof marbles === 'string') ? [marbles] : marbles;
	                flushTest.ready = true;
	                flushTest.expected = marblesArray.map(function (marbles) {
	                    return TestScheduler.parseMarblesAsSubscriptions(marbles);
	                });
	            }
	        };
	    };
	    TestScheduler.prototype.flush = function () {
	        var hotObservables = this.hotObservables;
	        while (hotObservables.length > 0) {
	            hotObservables.shift().setup();
	        }
	        _super.prototype.flush.call(this);
	        var readyFlushTests = this.flushTests.filter(function (test) { return test.ready; });
	        while (readyFlushTests.length > 0) {
	            var test = readyFlushTests.shift();
	            this.assertDeepEqual(test.actual, test.expected);
	        }
	    };
	    TestScheduler.parseMarblesAsSubscriptions = function (marbles) {
	        if (typeof marbles !== 'string') {
	            return new SubscriptionLog_1.SubscriptionLog(Number.POSITIVE_INFINITY);
	        }
	        var len = marbles.length;
	        var groupStart = -1;
	        var subscriptionFrame = Number.POSITIVE_INFINITY;
	        var unsubscriptionFrame = Number.POSITIVE_INFINITY;
	        for (var i = 0; i < len; i++) {
	            var frame = i * this.frameTimeFactor;
	            var c = marbles[i];
	            switch (c) {
	                case '-':
	                case ' ':
	                    break;
	                case '(':
	                    groupStart = frame;
	                    break;
	                case ')':
	                    groupStart = -1;
	                    break;
	                case '^':
	                    if (subscriptionFrame !== Number.POSITIVE_INFINITY) {
	                        throw new Error('found a second subscription point \'^\' in a ' +
	                            'subscription marble diagram. There can only be one.');
	                    }
	                    subscriptionFrame = groupStart > -1 ? groupStart : frame;
	                    break;
	                case '!':
	                    if (unsubscriptionFrame !== Number.POSITIVE_INFINITY) {
	                        throw new Error('found a second subscription point \'^\' in a ' +
	                            'subscription marble diagram. There can only be one.');
	                    }
	                    unsubscriptionFrame = groupStart > -1 ? groupStart : frame;
	                    break;
	                default:
	                    throw new Error('there can only be \'^\' and \'!\' markers in a ' +
	                        'subscription marble diagram. Found instead \'' + c + '\'.');
	            }
	        }
	        if (unsubscriptionFrame < 0) {
	            return new SubscriptionLog_1.SubscriptionLog(subscriptionFrame);
	        }
	        else {
	            return new SubscriptionLog_1.SubscriptionLog(subscriptionFrame, unsubscriptionFrame);
	        }
	    };
	    TestScheduler.parseMarbles = function (marbles, values, errorValue, materializeInnerObservables) {
	        if (materializeInnerObservables === void 0) { materializeInnerObservables = false; }
	        if (marbles.indexOf('!') !== -1) {
	            throw new Error('conventional marble diagrams cannot have the ' +
	                'unsubscription marker "!"');
	        }
	        var len = marbles.length;
	        var testMessages = [];
	        var subIndex = marbles.indexOf('^');
	        var frameOffset = subIndex === -1 ? 0 : (subIndex * -this.frameTimeFactor);
	        var getValue = typeof values !== 'object' ?
	            function (x) { return x; } :
	            function (x) {
	                // Support Observable-of-Observables
	                if (materializeInnerObservables && values[x] instanceof ColdObservable_1.ColdObservable) {
	                    return values[x].messages;
	                }
	                return values[x];
	            };
	        var groupStart = -1;
	        for (var i = 0; i < len; i++) {
	            var frame = i * this.frameTimeFactor + frameOffset;
	            var notification = void 0;
	            var c = marbles[i];
	            switch (c) {
	                case '-':
	                case ' ':
	                    break;
	                case '(':
	                    groupStart = frame;
	                    break;
	                case ')':
	                    groupStart = -1;
	                    break;
	                case '|':
	                    notification = Notification_1.Notification.createComplete();
	                    break;
	                case '^':
	                    break;
	                case '#':
	                    notification = Notification_1.Notification.createError(errorValue || 'error');
	                    break;
	                default:
	                    notification = Notification_1.Notification.createNext(getValue(c));
	                    break;
	            }
	            if (notification) {
	                testMessages.push({ frame: groupStart > -1 ? groupStart : frame, notification: notification });
	            }
	        }
	        return testMessages;
	    };
	    return TestScheduler;
	}(VirtualTimeScheduler_1.VirtualTimeScheduler));
	exports.TestScheduler = TestScheduler;


/***/ },
/* 349 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Observable_1 = __webpack_require__(16);
	var Subscription_1 = __webpack_require__(21);
	var SubscriptionLoggable_1 = __webpack_require__(350);
	var applyMixins_1 = __webpack_require__(352);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var ColdObservable = (function (_super) {
	    __extends(ColdObservable, _super);
	    function ColdObservable(messages, scheduler) {
	        _super.call(this, function (subscriber) {
	            var observable = this;
	            var index = observable.logSubscribedFrame();
	            subscriber.add(new Subscription_1.Subscription(function () {
	                observable.logUnsubscribedFrame(index);
	            }));
	            observable.scheduleMessages(subscriber);
	            return subscriber;
	        });
	        this.messages = messages;
	        this.subscriptions = [];
	        this.scheduler = scheduler;
	    }
	    ColdObservable.prototype.scheduleMessages = function (subscriber) {
	        var messagesLength = this.messages.length;
	        for (var i = 0; i < messagesLength; i++) {
	            var message = this.messages[i];
	            subscriber.add(this.scheduler.schedule(function (_a) {
	                var message = _a.message, subscriber = _a.subscriber;
	                message.notification.observe(subscriber);
	            }, message.frame, { message: message, subscriber: subscriber }));
	        }
	    };
	    return ColdObservable;
	}(Observable_1.Observable));
	exports.ColdObservable = ColdObservable;
	applyMixins_1.applyMixins(ColdObservable, [SubscriptionLoggable_1.SubscriptionLoggable]);


/***/ },
/* 350 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var SubscriptionLog_1 = __webpack_require__(351);
	var SubscriptionLoggable = (function () {
	    function SubscriptionLoggable() {
	        this.subscriptions = [];
	    }
	    SubscriptionLoggable.prototype.logSubscribedFrame = function () {
	        this.subscriptions.push(new SubscriptionLog_1.SubscriptionLog(this.scheduler.now()));
	        return this.subscriptions.length - 1;
	    };
	    SubscriptionLoggable.prototype.logUnsubscribedFrame = function (index) {
	        var subscriptionLogs = this.subscriptions;
	        var oldSubscriptionLog = subscriptionLogs[index];
	        subscriptionLogs[index] = new SubscriptionLog_1.SubscriptionLog(oldSubscriptionLog.subscribedFrame, this.scheduler.now());
	    };
	    return SubscriptionLoggable;
	}());
	exports.SubscriptionLoggable = SubscriptionLoggable;


/***/ },
/* 351 */
/***/ function(module, exports) {

	"use strict";
	var SubscriptionLog = (function () {
	    function SubscriptionLog(subscribedFrame, unsubscribedFrame) {
	        if (unsubscribedFrame === void 0) { unsubscribedFrame = Number.POSITIVE_INFINITY; }
	        this.subscribedFrame = subscribedFrame;
	        this.unsubscribedFrame = unsubscribedFrame;
	    }
	    return SubscriptionLog;
	}());
	exports.SubscriptionLog = SubscriptionLog;


/***/ },
/* 352 */
/***/ function(module, exports) {

	"use strict";
	function applyMixins(derivedCtor, baseCtors) {
	    for (var i = 0, len = baseCtors.length; i < len; i++) {
	        var baseCtor = baseCtors[i];
	        var propertyKeys = Object.getOwnPropertyNames(baseCtor.prototype);
	        for (var j = 0, len2 = propertyKeys.length; j < len2; j++) {
	            var name_1 = propertyKeys[j];
	            derivedCtor.prototype[name_1] = baseCtor.prototype[name_1];
	        }
	    }
	}
	exports.applyMixins = applyMixins;


/***/ },
/* 353 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Subject_1 = __webpack_require__(15);
	var Subscription_1 = __webpack_require__(21);
	var SubscriptionLoggable_1 = __webpack_require__(350);
	var applyMixins_1 = __webpack_require__(352);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var HotObservable = (function (_super) {
	    __extends(HotObservable, _super);
	    function HotObservable(messages, scheduler) {
	        _super.call(this);
	        this.messages = messages;
	        this.subscriptions = [];
	        this.scheduler = scheduler;
	    }
	    HotObservable.prototype._subscribe = function (subscriber) {
	        var subject = this;
	        var index = subject.logSubscribedFrame();
	        subscriber.add(new Subscription_1.Subscription(function () {
	            subject.logUnsubscribedFrame(index);
	        }));
	        return _super.prototype._subscribe.call(this, subscriber);
	    };
	    HotObservable.prototype.setup = function () {
	        var subject = this;
	        var messagesLength = subject.messages.length;
	        /* tslint:disable:no-var-keyword */
	        for (var i = 0; i < messagesLength; i++) {
	            (function () {
	                var message = subject.messages[i];
	                /* tslint:enable */
	                subject.scheduler.schedule(function () { message.notification.observe(subject); }, message.frame);
	            })();
	        }
	    };
	    return HotObservable;
	}(Subject_1.Subject));
	exports.HotObservable = HotObservable;
	applyMixins_1.applyMixins(HotObservable, [SubscriptionLoggable_1.SubscriptionLoggable]);


/***/ },
/* 354 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AsyncAction_1 = __webpack_require__(89);
	var AsyncScheduler_1 = __webpack_require__(91);
	var VirtualTimeScheduler = (function (_super) {
	    __extends(VirtualTimeScheduler, _super);
	    function VirtualTimeScheduler(SchedulerAction, maxFrames) {
	        var _this = this;
	        if (SchedulerAction === void 0) { SchedulerAction = VirtualAction; }
	        if (maxFrames === void 0) { maxFrames = Number.POSITIVE_INFINITY; }
	        _super.call(this, SchedulerAction, function () { return _this.frame; });
	        this.maxFrames = maxFrames;
	        this.frame = 0;
	        this.index = -1;
	    }
	    /**
	     * Prompt the Scheduler to execute all of its queued actions, therefore
	     * clearing its queue.
	     * @return {void}
	     */
	    VirtualTimeScheduler.prototype.flush = function () {
	        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
	        var error, action;
	        while ((action = actions.shift()) && (this.frame = action.delay) <= maxFrames) {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        }
	        if (error) {
	            while (action = actions.shift()) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    VirtualTimeScheduler.frameTimeFactor = 10;
	    return VirtualTimeScheduler;
	}(AsyncScheduler_1.AsyncScheduler));
	exports.VirtualTimeScheduler = VirtualTimeScheduler;
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var VirtualAction = (function (_super) {
	    __extends(VirtualAction, _super);
	    function VirtualAction(scheduler, work, index) {
	        if (index === void 0) { index = scheduler.index += 1; }
	        _super.call(this, scheduler, work);
	        this.scheduler = scheduler;
	        this.work = work;
	        this.index = index;
	        this.index = scheduler.index = index;
	    }
	    VirtualAction.prototype.schedule = function (state, delay) {
	        if (delay === void 0) { delay = 0; }
	        return !this.id ?
	            _super.prototype.schedule.call(this, state, delay) : this.add(new VirtualAction(this.scheduler, this.work)).schedule(state, delay);
	    };
	    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        this.delay = scheduler.frame + delay;
	        var actions = scheduler.actions;
	        actions.push(this);
	        actions.sort(VirtualAction.sortActions);
	        return true;
	    };
	    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        return undefined;
	    };
	    VirtualAction.sortActions = function (a, b) {
	        if (a.delay === b.delay) {
	            if (a.index === b.index) {
	                return 0;
	            }
	            else if (a.index > b.index) {
	                return 1;
	            }
	            else {
	                return -1;
	            }
	        }
	        else if (a.delay > b.delay) {
	            return 1;
	        }
	        else {
	            return -1;
	        }
	    };
	    return VirtualAction;
	}(AsyncAction_1.AsyncAction));
	exports.VirtualAction = VirtualAction;


/***/ },
/* 355 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var AnimationFrameAction_1 = __webpack_require__(356);
	var AnimationFrameScheduler_1 = __webpack_require__(358);
	exports.animationFrame = new AnimationFrameScheduler_1.AnimationFrameScheduler(AnimationFrameAction_1.AnimationFrameAction);


/***/ },
/* 356 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AsyncAction_1 = __webpack_require__(89);
	var AnimationFrame_1 = __webpack_require__(357);
	/**
	 * We need this JSDoc comment for affecting ESDoc.
	 * @ignore
	 * @extends {Ignored}
	 */
	var AnimationFrameAction = (function (_super) {
	    __extends(AnimationFrameAction, _super);
	    function AnimationFrameAction(scheduler, work) {
	        _super.call(this, scheduler, work);
	        this.scheduler = scheduler;
	        this.work = work;
	    }
	    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        // If delay is greater than 0, request as an async action.
	        if (delay !== null && delay > 0) {
	            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
	        }
	        // Push the action to the end of the scheduler queue.
	        scheduler.actions.push(this);
	        // If an animation frame has already been requested, don't request another
	        // one. If an animation frame hasn't been requested yet, request one. Return
	        // the current animation frame request id.
	        return scheduler.scheduled || (scheduler.scheduled = AnimationFrame_1.AnimationFrame.requestAnimationFrame(scheduler.flush.bind(scheduler, null)));
	    };
	    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
	        if (delay === void 0) { delay = 0; }
	        // If delay exists and is greater than 0, recycle as an async action.
	        if (delay !== null && delay > 0) {
	            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
	        }
	        // If the scheduler queue is empty, cancel the requested animation frame and
	        // set the scheduled flag to undefined so the next AnimationFrameAction will
	        // request its own.
	        if (scheduler.actions.length === 0) {
	            AnimationFrame_1.AnimationFrame.cancelAnimationFrame(id);
	            scheduler.scheduled = undefined;
	        }
	        // Return undefined so the action knows to request a new async id if it's rescheduled.
	        return undefined;
	    };
	    return AnimationFrameAction;
	}(AsyncAction_1.AsyncAction));
	exports.AnimationFrameAction = AnimationFrameAction;


/***/ },
/* 357 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var root_1 = __webpack_require__(17);
	var RequestAnimationFrameDefinition = (function () {
	    function RequestAnimationFrameDefinition(root) {
	        if (root.requestAnimationFrame) {
	            this.cancelAnimationFrame = root.cancelAnimationFrame.bind(root);
	            this.requestAnimationFrame = root.requestAnimationFrame.bind(root);
	        }
	        else if (root.mozRequestAnimationFrame) {
	            this.cancelAnimationFrame = root.mozCancelAnimationFrame.bind(root);
	            this.requestAnimationFrame = root.mozRequestAnimationFrame.bind(root);
	        }
	        else if (root.webkitRequestAnimationFrame) {
	            this.cancelAnimationFrame = root.webkitCancelAnimationFrame.bind(root);
	            this.requestAnimationFrame = root.webkitRequestAnimationFrame.bind(root);
	        }
	        else if (root.msRequestAnimationFrame) {
	            this.cancelAnimationFrame = root.msCancelAnimationFrame.bind(root);
	            this.requestAnimationFrame = root.msRequestAnimationFrame.bind(root);
	        }
	        else if (root.oRequestAnimationFrame) {
	            this.cancelAnimationFrame = root.oCancelAnimationFrame.bind(root);
	            this.requestAnimationFrame = root.oRequestAnimationFrame.bind(root);
	        }
	        else {
	            this.cancelAnimationFrame = root.clearTimeout.bind(root);
	            this.requestAnimationFrame = function (cb) { return root.setTimeout(cb, 1000 / 60); };
	        }
	    }
	    return RequestAnimationFrameDefinition;
	}());
	exports.RequestAnimationFrameDefinition = RequestAnimationFrameDefinition;
	exports.AnimationFrame = new RequestAnimationFrameDefinition(root_1.root);


/***/ },
/* 358 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var AsyncScheduler_1 = __webpack_require__(91);
	var AnimationFrameScheduler = (function (_super) {
	    __extends(AnimationFrameScheduler, _super);
	    function AnimationFrameScheduler() {
	        _super.apply(this, arguments);
	    }
	    AnimationFrameScheduler.prototype.flush = function () {
	        this.active = true;
	        this.scheduled = undefined;
	        var actions = this.actions;
	        var error;
	        var index = -1;
	        var count = actions.length;
	        var action = actions.shift();
	        do {
	            if (error = action.execute(action.state, action.delay)) {
	                break;
	            }
	        } while (++index < count && (action = actions.shift()));
	        this.active = false;
	        if (error) {
	            while (++index < count && (action = actions.shift())) {
	                action.unsubscribe();
	            }
	            throw error;
	        }
	    };
	    return AnimationFrameScheduler;
	}(AsyncScheduler_1.AsyncScheduler));
	exports.AnimationFrameScheduler = AnimationFrameScheduler;


/***/ },
/* 359 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(3);
	var Shell = (function (_super) {
	    __extends(Shell, _super);
	    function Shell(props) {
	        _super.call(this, props);
	    }
	    Shell.prototype.sendFiles = function (files) {
	        var _this = this;
	        var _loop_1 = function(i, numFiles) {
	            var file = files[i];
	            console.log("file", file);
	            var state = this_1.props.store.getState();
	            var sendId = state.history.sendCounter;
	            this_1.props.store.dispatch({ type: 'Send_Message', activity: {
	                    type: "message",
	                    from: state.connection.user,
	                    timestamp: Date.now().toString(),
	                    attachments: [{
	                            contentType: file.type,
	                            contentUrl: window.URL.createObjectURL(file),
	                            name: file.name
	                        }]
	                } });
	            state = this_1.props.store.getState();
	            state.connection.botConnection.postFile(file, state.connection.user)
	                .retry(2)
	                .subscribe(function (id) {
	                console.log("success posting file");
	                _this.props.store.dispatch({ type: "Send_Message_Succeed", sendId: sendId, id: id });
	            }, function (error) {
	                console.log("failed to post file");
	                _this.props.store.dispatch({ type: "Send_Message_Fail", sendId: sendId });
	            });
	        };
	        var this_1 = this;
	        for (var i = 0, numFiles = files.length; i < numFiles; i++) {
	            _loop_1(i, numFiles);
	        }
	    };
	    Shell.prototype.sendMessage = function () {
	        var state = this.props.store.getState();
	        if (state.history.input.length === 0)
	            return;
	        var sendId = state.history.sendCounter;
	        this.props.store.dispatch({ type: 'Send_Message', activity: {
	                type: "message",
	                text: state.history.input,
	                from: state.connection.user,
	                timestamp: Date.now().toString()
	            } });
	        this.trySendMessage(sendId);
	    };
	    Shell.prototype.trySendMessage = function (sendId, updateStatus) {
	        var _this = this;
	        if (updateStatus === void 0) { updateStatus = false; }
	        if (updateStatus) {
	            this.props.store.dispatch({ type: "Send_Message_Try", sendId: sendId });
	        }
	        var state = this.props.store.getState();
	        var activity = state.history.activities.find(function (activity) { return activity["sendId"] === sendId; });
	        state.connection.botConnection.postMessage(activity.text, state.connection.user)
	            .subscribe(function (id) {
	            console.log("success posting message");
	            _this.props.store.dispatch({ type: "Send_Message_Succeed", sendId: sendId, id: id });
	        }, function (error) {
	            console.log("failed to post message");
	            // TODO: show an error under the message with "retry" link
	            _this.props.store.dispatch({ type: "Send_Message_Fail", sendId: sendId });
	        });
	    };
	    Shell.prototype.onKeyPress = function (e) {
	        if (e.key === 'Enter')
	            this.sendMessage();
	    };
	    Shell.prototype.onClickSend = function () {
	        this.textInput.focus();
	        this.sendMessage();
	    };
	    Shell.prototype.onClickFile = function (files) {
	        this.textInput.focus();
	        this.sendFiles(files);
	    };
	    Shell.prototype.onChangeInput = function (input) {
	        this.props.store.dispatch({ type: 'Update_Input', input: input });
	    };
	    Shell.prototype.render = function () {
	        var _this = this;
	        var state = this.props.store.getState();
	        return (React.createElement("div", {className: "wc-console"}, 
	            React.createElement("label", {className: "wc-upload"}, 
	                React.createElement("input", {type: "file", accept: "image/*", multiple: true, onChange: function (e) { return _this.onClickFile(e.target.files); }}), 
	                React.createElement("svg", {width: "26", height: "18"}, 
	                    React.createElement("path", {d: "M 19.9603965 4.789052 m -2 0 a 2 2 0 0 1 4 0 a 2 2 0 0 1 -4 0 z M 8.3168322 4.1917918 L 2.49505 15.5342575 L 22.455446 15.5342575 L 17.465347 8.5643945 L 14.4158421 11.1780931 L 8.3168322 4.1917918 Z M 1.04 1 L 1.04 17 L 24.96 17 L 24.96 1 L 1.04 1 Z M 1.0352753 0 L 24.9647247 0 C 25.5364915 0 26 0.444957 26 0.9934084 L 26 17.006613 C 26 17.5552514 25.5265266 18 24.9647247 18 L 1.0352753 18 C 0.4635085 18 0 17.5550644 0 17.006613 L 0 0.9934084 C 0 0.44477 0.4734734 0 1.0352753 0 Z"})
	                )), 
	            React.createElement("div", {className: "wc-textbox"}, 
	                React.createElement("input", {type: "text", ref: function (ref) { return _this.textInput = ref; }, autoFocus: true, value: state.history.input, onChange: function (e) { return _this.onChangeInput(e.target.value); }, onKeyPress: function (e) { return _this.onKeyPress(e); }, placeholder: "Type your message..."})
	            ), 
	            React.createElement("label", {className: "wc-send", onClick: function () { return _this.onClickSend(); }}, 
	                React.createElement("svg", {width: "27", height: "18"}, 
	                    React.createElement("path", {d: "M 26.7862876 9.3774996 A 0.3121028 0.3121028 0 0 0 26.7862876 8.785123 L 0.4081408 0.0226012 C 0.363153 0.0000109 0.3406591 0.0000109 0.3181652 0.0000109 C 0.1372585 0.0000109 0 0.1315165 0 0.2887646 C 0 0.3270384 0.0081316 0.3668374 0.0257445 0.4066363 L 3.4448168 9.0813113 L 0.0257445 17.7556097 A 0.288143 0.288143 0 0 0 0.0126457 17.7975417 A 0.279813 0.279813 0 0 0 0.0055133 17.8603089 C 0.0055133 18.0178895 0.138422 18.1590562 0.303205 18.1590562 A 0.3049569 0.3049569 0 0 0 0.4081408 18.1400213 L 26.7862876 9.3774996 Z M 0.8130309 0.7906714 L 24.8365128 8.7876374 L 3.9846704 8.7876374 L 0.8130309 0.7906714 Z M 3.9846704 9.3749852 L 24.8365128 9.3749852 L 0.8130309 17.3719511 L 3.9846704 9.3749852 Z"})
	                )
	            )));
	    };
	    return Shell;
	}(React.Component));
	exports.Shell = Shell;


/***/ },
/* 360 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var redux_1 = __webpack_require__(361);
	var Strings_1 = __webpack_require__(375);
	exports.formatReducer = function (state, action) {
	    if (state === void 0) { state = {
	        options: {
	            showHeader: true
	        },
	        strings: Strings_1.strings('en-us')
	    }; }
	    switch (action.type) {
	        case 'Set_Format_Options':
	            return { options: action.options, strings: state.strings };
	        case 'Set_Localized_Strings':
	            return { options: state.options, strings: action.strings };
	        default:
	            return state;
	    }
	};
	exports.connectionReducer = function (state, action) {
	    if (state === void 0) { state = {
	        connected: false,
	        botConnection: undefined,
	        user: undefined,
	        host: undefined
	    }; }
	    switch (action.type) {
	        case 'Start_Connection':
	            return { connected: false, botConnection: action.botConnection, user: action.user, host: state.host };
	        case 'Connected_To_Bot':
	            return { connected: true, botConnection: state.botConnection, user: state.user, host: state.host };
	        case 'Subscribe_Host':
	            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: action.host };
	        case 'Unsubscribe_Host':
	            return { connected: state.connected, botConnection: state.botConnection, user: state.user, host: undefined };
	        default:
	            return state;
	    }
	};
	exports.historyReducer = function (state, action) {
	    if (state === void 0) { state = {
	        activities: [],
	        input: '',
	        sendCounter: 0,
	        autoscroll: true,
	        selectedActivity: null
	    }; }
	    console.log("history action", action);
	    switch (action.type) {
	        case 'Update_Input':
	            return Object.assign({}, state, {
	                input: action.input
	            });
	        case 'Receive_Message':
	            return Object.assign({}, state, {
	                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
	                    Object.assign({}, action.activity, {
	                        status: "received"
	                    })
	                ], state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }))
	            });
	        case 'Send_Message':
	            return Object.assign({}, state, {
	                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat([
	                    Object.assign({}, action.activity, {
	                        status: "sending",
	                        sendId: state.sendCounter
	                    })
	                ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
	                input: '',
	                sendCounter: state.sendCounter + 1,
	                autoscroll: true
	            });
	        case 'Send_Message_Try':
	            var activity = state.activities.find(function (activity) { return activity["sendId"] === action.sendId; });
	            return Object.assign({}, state, {
	                activities: state.activities.filter(function (activity) { return activity["sendId"] !== action.sendId && activity.type !== "typing"; }).concat([
	                    Object.assign({}, activity, {
	                        status: "sending",
	                        sendId: state.sendCounter
	                    })
	                ], state.activities.filter(function (activity) { return activity.type === "typing"; })),
	                sendCounter: state.sendCounter + 1,
	                autoscroll: true
	            });
	        case 'Send_Message_Succeed':
	        case 'Send_Message_Fail':
	            var i = state.activities.findIndex(function (activity) { return activity["sendId"] === action.sendId; });
	            if (i === -1)
	                return state;
	            return Object.assign({}, state, {
	                activities: state.activities.slice(0, i).concat([
	                    Object.assign({}, state.activities[i], {
	                        status: action.type === 'Send_Message_Succeed' ? "sent" : "retry",
	                        id: action.type === 'Send_Message_Succeed' ? action.id : undefined
	                    })
	                ], state.activities.slice(i + 1)),
	                sendCounter: state.sendCounter + 1,
	                autoscroll: true
	            });
	        case 'Show_Typing':
	            return Object.assign({}, state, {
	                activities: state.activities.filter(function (activity) { return activity.type !== "typing"; }).concat(state.activities.filter(function (activity) { return activity.from.id !== action.activity.from.id && activity.type === "typing"; }), [
	                    Object.assign({}, action.activity, {
	                        status: "received"
	                    })
	                ])
	            });
	        case 'Clear_Typing':
	            return Object.assign({}, state, {
	                activities: state.activities.filter(function (activity) { return activity.from.id !== action.from.id || activity.type !== "typing"; })
	            });
	        case 'Set_Autoscroll':
	            return Object.assign({}, state, {
	                autoscroll: action.autoscroll
	            });
	        case 'Select_Activity':
	            return Object.assign({}, state, {
	                selectedActivity: action.selectedActivity
	            });
	        default:
	            return state;
	    }
	};
	exports.createStore = function () {
	    return redux_1.createStore(redux_1.combineReducers({
	        format: exports.formatReducer,
	        connection: exports.connectionReducer,
	        history: exports.historyReducer
	    }));
	};


/***/ },
/* 361 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;
	
	var _createStore = __webpack_require__(362);
	
	var _createStore2 = _interopRequireDefault(_createStore);
	
	var _combineReducers = __webpack_require__(370);
	
	var _combineReducers2 = _interopRequireDefault(_combineReducers);
	
	var _bindActionCreators = __webpack_require__(372);
	
	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);
	
	var _applyMiddleware = __webpack_require__(373);
	
	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);
	
	var _compose = __webpack_require__(374);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	var _warning = __webpack_require__(371);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}
	
	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}
	
	exports.createStore = _createStore2['default'];
	exports.combineReducers = _combineReducers2['default'];
	exports.bindActionCreators = _bindActionCreators2['default'];
	exports.applyMiddleware = _applyMiddleware2['default'];
	exports.compose = _compose2['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(301)))

/***/ },
/* 362 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports['default'] = createStore;
	
	var _isPlainObject = __webpack_require__(363);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _symbolObservable = __webpack_require__(367);
	
	var _symbolObservable2 = _interopRequireDefault(_symbolObservable);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};
	
	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [preloadedState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, preloadedState, enhancer) {
	  var _ref2;
	
	  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = preloadedState;
	    preloadedState = undefined;
	  }
	
	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }
	
	    return enhancer(createStore)(reducer, preloadedState);
	  }
	
	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }
	
	  var currentReducer = reducer;
	  var currentState = preloadedState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;
	
	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }
	
	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }
	
	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }
	
	    var isSubscribed = true;
	
	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);
	
	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }
	
	      isSubscribed = false;
	
	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }
	
	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2['default'])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }
	
	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }
	
	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }
	
	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }
	
	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }
	
	    return action;
	  }
	
	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }
	
	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }
	
	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/zenparsing/es-observable
	   */
	  function observable() {
	    var _ref;
	
	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	      subscribe: function subscribe(observer) {
	        if (typeof observer !== 'object') {
	          throw new TypeError('Expected the observer to be an object.');
	        }
	
	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }
	
	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[_symbolObservable2['default']] = function () {
	      return this;
	    }, _ref;
	  }
	
	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });
	
	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
	}

/***/ },
/* 363 */
/***/ function(module, exports, __webpack_require__) {

	var getPrototype = __webpack_require__(364),
	    isObjectLike = __webpack_require__(366);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objectToString = objectProto.toString;
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) || objectToString.call(value) != objectTag) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return (typeof Ctor == 'function' &&
	    Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString);
	}
	
	module.exports = isPlainObject;


/***/ },
/* 364 */
/***/ function(module, exports, __webpack_require__) {

	var overArg = __webpack_require__(365);
	
	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);
	
	module.exports = getPrototype;


/***/ },
/* 365 */
/***/ function(module, exports) {

	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function(arg) {
	    return func(transform(arg));
	  };
	}
	
	module.exports = overArg;


/***/ },
/* 366 */
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 367 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(368);


/***/ },
/* 368 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _ponyfill = __webpack_require__(369);
	
	var _ponyfill2 = _interopRequireDefault(_ponyfill);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var root = undefined; /* global window */
	
	if (typeof global !== 'undefined') {
		root = global;
	} else if (typeof window !== 'undefined') {
		root = window;
	}
	
	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 369 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;
	
		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};

/***/ },
/* 370 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports['default'] = combineReducers;
	
	var _createStore = __webpack_require__(362);
	
	var _isPlainObject = __webpack_require__(363);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _warning = __webpack_require__(371);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
	
	  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
	}
	
	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';
	
	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }
	
	  if (!(0, _isPlainObject2['default'])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }
	
	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
	  });
	
	  unexpectedKeys.forEach(function (key) {
	    unexpectedKeyCache[key] = true;
	  });
	
	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}
	
	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });
	
	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }
	
	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}
	
	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	
	    if (process.env.NODE_ENV !== 'production') {
	      if (typeof reducers[key] === 'undefined') {
	        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
	      }
	    }
	
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);
	
	  if (process.env.NODE_ENV !== 'production') {
	    var unexpectedKeyCache = {};
	  }
	
	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }
	
	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];
	
	    if (sanityError) {
	      throw sanityError;
	    }
	
	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
	      if (warningMessage) {
	        (0, _warning2['default'])(warningMessage);
	      }
	    }
	
	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(301)))

/***/ },
/* 371 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 372 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}
	
	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }
	
	  if (typeof actionCreators !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }
	
	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 373 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	exports['default'] = applyMiddleware;
	
	var _compose = __webpack_require__(374);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }
	
	  return function (createStore) {
	    return function (reducer, preloadedState, enhancer) {
	      var store = createStore(reducer, preloadedState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];
	
	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);
	
	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 374 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left. The rightmost
	 * function can take multiple arguments as it provides the signature for
	 * the resulting composite function.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing the argument functions
	 * from right to left. For example, compose(f, g, h) is identical to doing
	 * (...args) => f(g(h(...args))).
	 */
	
	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }
	
	  if (funcs.length === 0) {
	    return function (arg) {
	      return arg;
	    };
	  }
	
	  if (funcs.length === 1) {
	    return funcs[0];
	  }
	
	  var last = funcs[funcs.length - 1];
	  var rest = funcs.slice(0, -1);
	  return function () {
	    return rest.reduceRight(function (composed, f) {
	      return f(composed);
	    }, last.apply(undefined, arguments));
	  };
	}

/***/ },
/* 375 */
/***/ function(module, exports) {

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


/***/ },
/* 376 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var rxjs_1 = __webpack_require__(13);
	var intervalRefreshToken = 29 * 60 * 1000;
	var DirectLine = (function () {
	    function DirectLine(secretOrToken, domain) {
	        if (domain === void 0) { domain = "https://directline.botframework.com"; }
	        this.domain = domain;
	        this.connected$ = new rxjs_1.BehaviorSubject(false);
	        this.id = 0;
	        this.secret = secretOrToken.secret;
	        this.token = secretOrToken.secret || secretOrToken.token;
	    }
	    DirectLine.prototype.start = function () {
	        var _this = this;
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
	            if (!_this.secret) {
	                _this.tokenRefreshSubscription = rxjs_1.Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(function (_) {
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
	    };
	    DirectLine.prototype.end = function () {
	        if (this.tokenRefreshSubscription) {
	            this.tokenRefreshSubscription.unsubscribe();
	            this.tokenRefreshSubscription = undefined;
	        }
	        if (this.getActivityGroupSubscription) {
	            this.getActivityGroupSubscription.unsubscribe();
	            this.getActivityGroupSubscription = undefined;
	        }
	        if (this.pollTimer) {
	            clearTimeout(this.pollTimer);
	            this.pollTimer = undefined;
	        }
	    };
	    DirectLine.prototype.postMessage = function (text, from, channelData) {
	        console.log("sending", text);
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
	            .mapTo((this.id++).toString());
	    };
	    DirectLine.prototype.postFile = function (file, from) {
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
	            .mapTo((this.id++).toString());
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
	        this.getActivityGroupSubscription = this.getActivityGroup(watermark).subscribe(function (activityGroup) {
	            var someMessages = activityGroup && activityGroup.messages && activityGroup.messages.length > 0;
	            if (someMessages)
	                subscriber.next(rxjs_1.Observable.from(activityGroup.messages));
	            _this.pollTimer = setTimeout(function () { return _this.activitiesGenerator(subscriber, activityGroup && activityGroup.watermark); }, someMessages && activityGroup.watermark ? 0 : 1000);
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


/***/ },
/* 377 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var rxjs_1 = __webpack_require__(13);
	var intervalRefreshToken = 29 * 60 * 1000;
	var DirectLine3 = (function () {
	    function DirectLine3(secretOrToken, domain, segment) {
	        if (domain === void 0) { domain = "https://directline.botframework.com"; }
	        this.domain = domain;
	        this.segment = segment;
	        this.connected$ = new rxjs_1.BehaviorSubject(false);
	        this.secret = secretOrToken.secret;
	        this.token = secretOrToken.secret || secretOrToken.token;
	    }
	    DirectLine3.prototype.start = function () {
	        var _this = this;
	        rxjs_1.Observable.ajax({
	            method: "POST",
	            url: this.domain + "/" + this.segment + "/conversations",
	            headers: {
	                "Accept": "application/json",
	                "Authorization": "Bearer " + this.token
	            }
	        })
	            .map(function (ajaxResponse) { return ajaxResponse.response; })
	            .retryWhen(function (error$) { return error$.delay(1000); })
	            .subscribe(function (conversation) {
	            _this.conversationId = conversation.conversationId;
	            _this.token = conversation.token;
	            _this.connected$.next(true);
	            if (!_this.secret) {
	                _this.tokenRefreshSubscription = rxjs_1.Observable.timer(intervalRefreshToken, intervalRefreshToken).flatMap(function (_) {
	                    return rxjs_1.Observable.ajax({
	                        method: "GET",
	                        url: _this.domain + "/" + _this.segment + "/tokens/" + _this.conversationId + "/refresh",
	                        headers: {
	                            "Authorization": "Bearer " + _this.token
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
	            .flatMap(function (_) { return _this.getActivity$(); });
	    };
	    DirectLine3.prototype.end = function () {
	        if (this.tokenRefreshSubscription) {
	            this.tokenRefreshSubscription.unsubscribe();
	            this.tokenRefreshSubscription = undefined;
	        }
	        if (this.getActivityGroupSubscription) {
	            this.getActivityGroupSubscription.unsubscribe();
	            this.getActivityGroupSubscription = undefined;
	        }
	        if (this.pollTimer) {
	            clearTimeout(this.pollTimer);
	            this.pollTimer = undefined;
	        }
	    };
	    DirectLine3.prototype.postMessage = function (text, from, channelData) {
	        return rxjs_1.Observable.ajax({
	            method: "POST",
	            url: this.domain + "/" + this.segment + "/conversations/" + this.conversationId + "/activities",
	            body: {
	                type: "message",
	                text: text,
	                from: from,
	                conversationId: this.conversationId,
	                channelData: channelData
	            },
	            headers: {
	                "Content-Type": "application/json",
	                "Authorization": "Bearer " + this.token
	            }
	        })
	            .retryWhen(function (error$) { return error$.delay(1000); })
	            .map(function (ajaxResponse) { return ajaxResponse.response.id; });
	    };
	    DirectLine3.prototype.postFile = function (file, from) {
	        var formData = new FormData();
	        formData.append('file', file);
	        return rxjs_1.Observable.ajax({
	            method: "POST",
	            url: this.domain + "/" + this.segment + "/conversations/" + this.conversationId + "/upload?userId=" + from.id,
	            body: formData,
	            headers: {
	                "Authorization": "Bearer " + this.token,
	                "Content-Type": file.type,
	                "Content-Disposition": "filename=" + file.name
	            }
	        })
	            .retryWhen(function (error$) { return error$.delay(1000); })
	            .map(function (ajaxResponse) { return ajaxResponse.response.id; });
	    };
	    DirectLine3.prototype.getActivity$ = function () {
	        var _this = this;
	        return new rxjs_1.Observable(function (subscriber) {
	            return _this.activitiesGenerator(subscriber);
	        })
	            .concatAll()
	            .do(function (activity) { return console.log("Activity", activity); });
	    };
	    DirectLine3.prototype.activitiesGenerator = function (subscriber, watermark) {
	        var _this = this;
	        this.getActivityGroupSubscription = this.getActivityGroup(watermark).subscribe(function (activityGroup) {
	            var someMessages = activityGroup && activityGroup.activities && activityGroup.activities.length > 0;
	            if (someMessages)
	                subscriber.next(rxjs_1.Observable.from(activityGroup.activities));
	            _this.pollTimer = setTimeout(function () { return _this.activitiesGenerator(subscriber, activityGroup && activityGroup.watermark); }, someMessages && activityGroup.watermark ? 0 : 1000);
	        }, function (error) {
	            return subscriber.error(error);
	        });
	    };
	    DirectLine3.prototype.getActivityGroup = function (watermark) {
	        if (watermark === void 0) { watermark = ""; }
	        return rxjs_1.Observable.ajax({
	            method: "GET",
	            url: this.domain + "/" + this.segment + "/conversations/" + this.conversationId + "/activities?watermark=" + watermark,
	            headers: {
	                "Accept": "application/json",
	                "Authorization": "Bearer " + this.token
	            }
	        })
	            .retryWhen(function (error$) { return error$.delay(1000); })
	            .map(function (ajaxResponse) { return ajaxResponse.response; });
	    };
	    return DirectLine3;
	}());
	exports.DirectLine3 = DirectLine3;


/***/ }
/******/ ])
});
;
//# sourceMappingURL=botchat.js.map