"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var konsole = require("../Konsole");
var SynthesisGender;
(function (SynthesisGender) {
    SynthesisGender[SynthesisGender["Male"] = 0] = "Male";
    SynthesisGender[SynthesisGender["Female"] = 1] = "Female";
})(SynthesisGender = exports.SynthesisGender || (exports.SynthesisGender = {}));
var SpeechSynthesizer = (function () {
    // tslint:enable:variable-name
    function SpeechSynthesizer(properties) {
        // tslint:disable:variable-name
        this._requestQueue = null;
        this._isPlaying = false;
        this._helper = new CognitiveServicesHelper(properties);
        this._properties = properties;
        this._requestQueue = new Array();
    }
    SpeechSynthesizer.prototype.speak = function (text, lang, onSpeakingStarted, onSpeakingFinished) {
        var _this = this;
        if (onSpeakingStarted === void 0) { onSpeakingStarted = null; }
        if (onSpeakingFinished === void 0) { onSpeakingFinished = null; }
        this._requestQueue.push({
            isReadyToPlay: false,
            data: null,
            text: text,
            locale: lang,
            onSpeakingStarted: onSpeakingStarted,
            onSpeakingFinished: onSpeakingFinished
        });
        this.getSpeechData().then(function () {
            _this.playAudio();
        });
    };
    SpeechSynthesizer.prototype.stopSpeaking = function () {
        if (this._isPlaying) {
            this._requestQueue = [];
            this._isPlaying = false;
            if (this._audioElement && this._audioElement.state !== 'closed') {
                this._audioElement.close();
            }
        }
    };
    SpeechSynthesizer.prototype.playAudio = function () {
        var _this = this;
        if (this._requestQueue.length === 0) {
            return;
        }
        var top = this._requestQueue[0];
        if (!top) {
            return;
        }
        if (!top.isReadyToPlay) {
            window.setTimeout(function () { return _this.playAudio(); }, 100);
            return;
        }
        if (!this._isPlaying) {
            this._isPlaying = true;
            if (!this._audioElement || this._audioElement.state === 'closed') {
                if (typeof webkitAudioContext !== 'undefined') {
                    this._audioElement = new webkitAudioContext();
                }
                else {
                    this._audioElement = new AudioContext();
                }
            }
            this._audioElement.decodeAudioData(top.data, function (buffer) {
                var source = _this._audioElement.createBufferSource();
                source.buffer = buffer;
                source.connect(_this._audioElement.destination);
                if (top.onSpeakingStarted) {
                    top.onSpeakingStarted();
                }
                source.start(0);
                source.onended = function (event) {
                    _this._isPlaying = false;
                    if (top.onSpeakingFinished) {
                        top.onSpeakingFinished();
                    }
                    _this._requestQueue = _this._requestQueue.slice(1, _this._requestQueue.length);
                    if (_this._requestQueue.length > 0) {
                        _this.playAudio();
                    }
                };
            }, function (ex) {
                _this.log(ex.message);
                _this._isPlaying = false;
                _this._requestQueue = _this._requestQueue.slice(1, _this._requestQueue.length);
                if (_this._requestQueue.length > 0) {
                    _this.playAudio();
                }
            });
        }
    };
    SpeechSynthesizer.prototype.getSpeechData = function () {
        var _this = this;
        if (this._requestQueue.length === 0) {
            return;
        }
        var latest = this._requestQueue[this._requestQueue.length - 1];
        return this._helper.fetchSpeechData(latest.text, latest.locale, this._properties).then(function (result) {
            latest.data = result;
            latest.isReadyToPlay = true;
        }, function (ex) {
            // Failed to get the speech data, ignore this item
            _this.log(ex);
            _this._requestQueue = _this._requestQueue.slice(0, _this._requestQueue.length - 1);
        });
    };
    SpeechSynthesizer.prototype.log = function (message) {
        konsole.log('CognitiveServicesSpeechSynthesis: ' + message);
    };
    return SpeechSynthesizer;
}());
exports.SpeechSynthesizer = SpeechSynthesizer;
var CognitiveServicesHelper = (function () {
    // tslint:enable:variable-name
    function CognitiveServicesHelper(props) {
        var _this = this;
        // tslint:disable:variable-name
        this._tokenURL = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
        this._synthesisURL = 'https://speech.platform.bing.com/synthesize';
        this._outputFormat = 'riff-16khz-16bit-mono-pcm';
        // source: https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/bingvoiceoutput
        // tslint:disable-next-line:variable-name
        this._femaleVoiceMap = {
            'ar-eg': 'Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)',
            'ca-es': 'Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)',
            'da-dk': 'Microsoft Server Speech Text to Speech Voice (da-DK, HelleRUS)',
            'de-de': 'Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)',
            'en-au': 'Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)',
            'en-ca': 'Microsoft Server Speech Text to Speech Voice (en-CA, Linda)',
            'en-gb': 'Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)',
            'en-in': 'Microsoft Server Speech Text to Speech Voice (en-IN, Heera, Apollo)',
            'en-us': 'Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)',
            'es-es': 'Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)',
            'es-mx': 'Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)',
            'fi-fi': 'Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)',
            'fr-ca': 'Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)',
            'fr-fr': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)',
            'hi-in': 'Microsoft Server Speech Text to Speech Voice (hi-IN, Kalpana, Apollo)',
            'ja-jp': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)',
            'ko-kr': 'Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)',
            'nb-no': 'Microsoft Server Speech Text to Speech Voice (nb-NO, HuldaRUS)',
            'nl-nl': 'Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)',
            'pl-pl': 'Microsoft Server Speech Text to Speech Voice (pl-PL, PaulinaRUS)',
            'pt-br': 'Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)',
            'pt-pt': 'Microsoft Server Speech Text to Speech Voice (pt-PT, HeliaRUS)',
            'ru-ru': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)',
            'sv-se': 'Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)',
            'tr-tr': 'Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)',
            'zh-cn': 'Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)',
            'zh-hk': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)',
            'zh-tw': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)'
        };
        // tslint:disable-next-line:variable-name
        this._maleVoiceMap = {
            'ar-sa': 'Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)',
            'cs-cz': 'Microsoft Server Speech Text to Speech Voice (cs-CZ, Vit)',
            'de-at': 'Microsoft Server Speech Text to Speech Voice (de-AT, Michael)',
            'de-ch': 'Microsoft Server Speech Text to Speech Voice (de-CH, Karsten)',
            'de-de': 'Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)',
            'el-gr': 'Microsoft Server Speech Text to Speech Voice (el-GR, Stefanos)',
            'en-gb': 'Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)',
            'en-ie': 'Microsoft Server Speech Text to Speech Voice (en-IE, Shaun)',
            'en-in': 'Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)',
            'en-us': 'Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)',
            'es-es': 'Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)',
            'es-mx': 'Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)',
            'fr-ch': 'Microsoft Server Speech Text to Speech Voice (fr-CH, Guillaume)',
            'fr-fr': 'Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)',
            'he-il': 'Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)',
            'hi-in': 'Microsoft Server Speech Text to Speech Voice (hi-IN, Hemant)',
            'hu-hu': 'Microsoft Server Speech Text to Speech Voice (hu-HU, Szabolcs)',
            'id-id': 'Microsoft Server Speech Text to Speech Voice (id-ID, Andika)',
            'it-it': 'Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)',
            'ja-jp': 'Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)',
            'pt-br': 'Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)',
            'ro-ro': 'Microsoft Server Speech Text to Speech Voice (ro-RO, Andrei)',
            'ru-ru': 'Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)',
            'sk-sk': 'Microsoft Server Speech Text to Speech Voice (sk-SK, Filip)',
            'th-th': 'Microsoft Server Speech Text to Speech Voice (th-TH, Pattara)',
            'zh-cn': 'Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)',
            'zh-hk': 'Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)',
            'zh-tw': 'Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)'
        };
        if (props.subscriptionKey) {
            this._tokenCallback = function (id) { return _this.fetchSpeechToken(id); };
            this._tokenExpiredCallback = function (id) { return _this.fetchSpeechToken(id); };
        }
        else if (props.fetchCallback && props.fetchOnExpiryCallback) {
            this._tokenCallback = props.fetchCallback;
            this._tokenExpiredCallback = props.fetchOnExpiryCallback;
        }
        else {
            throw new Error('Error: The CognitiveServicesSpeechSynthesis requires either a subscriptionKey or a fetchCallback and a fetchOnExpiryCallback.');
        }
    }
    CognitiveServicesHelper.prototype.fetchSpeechData = function (text, locale, synthesisProperties) {
        var _this = this;
        var SSML = this.makeSSML(text, locale, synthesisProperties);
        var cbAfterToken = function (token) {
            _this._lastTokenTime = Date.now();
            var optionalHeaders = [
                { name: 'Content-type', value: 'application/ssml+xml' },
                { name: 'X-Microsoft-OutputFormat', value: _this._outputFormat },
                { name: 'Authorization', value: token }
            ];
            return _this.makeHttpCall('POST', _this._synthesisURL, true, optionalHeaders, SSML);
        };
        if (Date.now() - this._lastTokenTime > 500000) {
            return this._tokenExpiredCallback(synthesisProperties.subscriptionKey).then(function (token) { return cbAfterToken(token); });
        }
        else {
            return this._tokenCallback(synthesisProperties.subscriptionKey).then(function (token) { return cbAfterToken(token); });
        }
    };
    CognitiveServicesHelper.prototype.makeSSML = function (text, locale, synthesisProperties) {
        if (text.indexOf('<speak') === 0) {
            return this.processSSML(text, synthesisProperties);
        }
        else {
            var ssml = '<speak version=\'1.0\' xml:lang=\'' + locale + '\'><voice xml:lang=\'' + locale + '\' xml:gender=\'' + (synthesisProperties && synthesisProperties.gender ? SynthesisGender[synthesisProperties.gender] : 'Female') + '\' name=\'';
            if (synthesisProperties.voiceName) {
                ssml += synthesisProperties.voiceName;
            }
            else if (synthesisProperties.gender !== null && synthesisProperties.gender !== undefined) {
                ssml += this.fetchVoiceName(locale, synthesisProperties.gender);
            }
            else {
                ssml += this.fetchVoiceName(locale, SynthesisGender.Female);
            }
            return ssml + '\'>' + this.encodeHTML(text) + '</voice></speak>';
        }
    };
    CognitiveServicesHelper.prototype.processSSML = function (ssml, synthesisProperties) {
        var processDone = false;
        // Extract locale info from ssml
        var locale;
        var match = /xml:lang=['"](\w\w-\w\w)['"]/.exec(ssml);
        if (match) {
            locale = match[1];
        }
        else {
            locale = 'en-us';
        }
        // Extract gender from properties
        var gender = synthesisProperties && synthesisProperties.gender;
        if (gender === null || gender === undefined) {
            gender = SynthesisGender.Female;
        }
        var parser = new DOMParser();
        var dom = parser.parseFromString(ssml, 'text/xml');
        var nodes = dom.documentElement.childNodes;
        // Check if there is a voice node
        // tslint:disable-next-line:prefer-for-of
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i].nodeName === 'voice') {
                // Check if there is a name attribute on voice element
                // tslint:disable-next-line:prefer-for-of
                for (var j = 0; j < nodes[i].attributes.length; ++j) {
                    if (nodes[i].attributes[j].nodeName === 'name') {
                        // Name attribute is found on voice element, use it directly
                        processDone = true;
                        break;
                    }
                    // Find the gender info from voice element, this will override what is in the properties
                    if (nodes[i].attributes[j].nodeName === 'xml:gender') {
                        gender = nodes[i].attributes[j].nodeValue.toLowerCase() === 'male' ? SynthesisGender.Male : SynthesisGender.Female;
                    }
                }
                if (!processDone) {
                    // Otherwise add the name attribute based on locale and gender
                    var attribute = dom.createAttribute('name');
                    attribute.value = (synthesisProperties && synthesisProperties.voiceName) || this.fetchVoiceName(locale, gender);
                    nodes[i].attributes.setNamedItem(attribute);
                    processDone = true;
                }
                break;
            }
        }
        var serializer = new XMLSerializer();
        if (!processDone) {
            // There is no voice element, add one based on locale
            var voiceNode = dom.createElement('voice');
            var attribute = dom.createAttribute('name');
            attribute.value = (synthesisProperties && synthesisProperties.voiceName) || this.fetchVoiceName(locale, gender);
            voiceNode.attributes.setNamedItem(attribute);
            while (nodes.length > 0) {
                voiceNode.appendChild(dom.documentElement.firstChild);
            }
            dom.documentElement.appendChild(voiceNode);
        }
        return serializer.serializeToString(dom);
    };
    CognitiveServicesHelper.prototype.encodeHTML = function (text) {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
    CognitiveServicesHelper.prototype.fetchSpeechToken = function (apiKey) {
        var optionalHeaders = [{ name: 'Ocp-Apim-Subscription-Key', value: apiKey },
            // required for Firefox otherwise a CORS error is raised
            { name: 'Access-Control-Allow-Origin', value: '*' }];
        return this.makeHttpCall('POST', this._tokenURL, false, optionalHeaders).then(function (text) {
            konsole.log('New authentication token generated.');
            return Promise.resolve(text);
        }, function (ex) {
            var reason = 'Failed to generate authentication token';
            konsole.log(reason);
            return Promise.reject(reason);
        });
    };
    CognitiveServicesHelper.prototype.makeHttpCall = function (actionType, url, isArrayBuffer, optionalHeaders, dataToSend) {
        if (isArrayBuffer === void 0) { isArrayBuffer = false; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            if (isArrayBuffer) {
                xhr.responseType = 'arraybuffer';
            }
            xhr.onreadystatechange = function (event) {
                if (xhr.readyState !== 4) {
                    return;
                }
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (!isArrayBuffer) {
                        resolve(xhr.responseText);
                    }
                    else {
                        resolve(xhr.response);
                    }
                }
                else {
                    reject(xhr.status);
                }
            };
            try {
                xhr.open(actionType, url, true);
                if (optionalHeaders) {
                    optionalHeaders.forEach(function (header) {
                        xhr.setRequestHeader(header.name, header.value);
                    });
                }
                if (dataToSend) {
                    xhr.send(dataToSend);
                }
                else {
                    xhr.send();
                }
            }
            catch (ex) {
                reject(ex);
            }
        });
    };
    CognitiveServicesHelper.prototype.fetchVoiceName = function (locale, gender) {
        var voiceName;
        var localeLowerCase = locale.toLowerCase();
        if (gender === SynthesisGender.Female) {
            voiceName = this._femaleVoiceMap[localeLowerCase] || this._femaleVoiceMap['en-us'];
        }
        else {
            voiceName = this._maleVoiceMap[localeLowerCase] || this._maleVoiceMap['en-us'];
        }
        return voiceName;
    };
    return CognitiveServicesHelper;
}());
//# sourceMappingURL=SpeechSynthesis.js.map