"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var Chat_1 = require('./Chat');
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
    Shell.prototype.onKeyPress = function (e) {
        if (e.key === 'Enter' && this.textInput.value.length >= 0)
            Chat_1.sendMessage(this.props.store, this.textInput.value);
    };
    Shell.prototype.onClickSend = function () {
        this.textInput.focus();
        if (this.textInput.value.length >= 0)
            Chat_1.sendMessage(this.props.store, this.textInput.value);
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
//# sourceMappingURL=Shell.js.map