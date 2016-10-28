"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Attachment_1 = require('./Attachment');
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
    };
    return Carousel;
}(React.Component));
exports.Carousel = Carousel;
//# sourceMappingURL=Carousel.js.map