import { Speech, Action } from '../SpeechModule'
import { konsole } from '../Chat';

export interface ICognitiveServicesSpeechSynthesisProperties {
    subscriptionKey: string,
    gender?: SynthesisGender,
    voiceName?: string
}

export enum SynthesisGender { Male, Female };

interface SpeakRequest {
    isReadyToPlay: boolean,
    data: ArrayBuffer,
    text: string,
    locale: string,
    onSpeakingStarted: Action,
    onSpeakingFinished: Action,
}

interface HttpHeader {
    name: string,
    value: string
}

export class SpeechSynthesizer implements Speech.ISpeechSynthesizer {
    private _requestQueue: SpeakRequest[] = null;
    private _isPlaying: boolean = false;
    private _audioElement: AudioContext;
    private _helper: CognitiveServicesHelper;
    private _properties: ICognitiveServicesSpeechSynthesisProperties;

    constructor(properties: ICognitiveServicesSpeechSynthesisProperties) {
        this._helper = new CognitiveServicesHelper(properties.subscriptionKey);
        this._properties = properties;
        this._audioElement = new AudioContext();
        this._requestQueue = new Array();
    }

    speak(text: string, lang: string, onSpeakingStarted: Action = null, onSpeakingFinished: Action = null): void {
        this._requestQueue.push(
            {
                isReadyToPlay: false,
                data: null,
                text: text,
                locale: lang,
                onSpeakingStarted: onSpeakingStarted,
                onSpeakingFinished: onSpeakingFinished
            }
        );

        this.getSpeechData().then(() => {
            this.playAudio();
        });

    }

    stopSpeaking(): void {
        if (this._isPlaying) {
            this._requestQueue = [];
            this._isPlaying = false;
            if(this._audioElement.state !== "closed"){
                this._audioElement.close();
            }
        }
    }

    private playAudio() {
        if (this._requestQueue.length == 0) {
            return;
        }

        let top = this._requestQueue[0];
        if (!top) {
            return;
        }

        if (!top.isReadyToPlay) {
            window.setTimeout(() => this.playAudio(), 100);
            return;
        }

        if (!this._isPlaying) {
            this._isPlaying = true;
            if(this._audioElement.state === "closed"){
                this._audioElement = new AudioContext();
            }

            this._audioElement.decodeAudioData(top.data, (buffer) => {
                let source = this._audioElement.createBufferSource();
                source.buffer = buffer;
                source.connect(this._audioElement.destination);

                if (top.onSpeakingStarted) {
                    top.onSpeakingStarted();
                }

                source.start(0);
                source.onended = (event) => {
                    this._isPlaying = false;
                    if (top.onSpeakingFinished) {
                        top.onSpeakingFinished();
                    }
                    this._requestQueue = this._requestQueue.slice(1, this._requestQueue.length);
                    if (this._requestQueue.length > 0) {
                        this.playAudio();
                    }
                }
            }, (ex) => {
                this.log(ex.message);
                this._isPlaying = false;
                this._requestQueue = this._requestQueue.slice(1, this._requestQueue.length);
                if (this._requestQueue.length > 0) {
                    this.playAudio();
                }
            });
        }
    }

    private getSpeechData(): Promise<any> {
        if (this._requestQueue.length == 0) {
            return;
        }

        let latest = this._requestQueue[this._requestQueue.length - 1];

        return this._helper.fetchSpeechData(latest.text, latest.locale, this._properties).then((result) => {
            latest.data = result;
            latest.isReadyToPlay = true;
        }, (ex) => {
            // Failed to get the speech data, ignore this item
            this.log(ex);
            this._requestQueue = this._requestQueue.slice(0, this._requestQueue.length - 1);
        });
    }

    private log(message: string) {
        konsole.log('CognitiveServicesSpeechSynthesis: ' + message);
    }
}

class CognitiveServicesHelper {
    private readonly _tokenURL = "https://api.cognitive.microsoft.com/sts/v1.0/issueToken";
    private readonly _synthesisURL = "https://speech.platform.bing.com/synthesize";
    private readonly _outputFormat = "riff-16khz-16bit-mono-pcm";
    private _apiKey: string;
    private _token: string;
    private _lastTokenTime: number;

    constructor(apiKey: string) {
        if (!apiKey) {
            throw "Please provide a valid Bing Speech API key";
        }

        this._apiKey = apiKey;
        this.checkAuthToken();
    }

    public fetchSpeechData(text: string, locale: string, synthesisProperties: ICognitiveServicesSpeechSynthesisProperties): Promise<any> {
        return this.checkAuthToken().then(() => {
            let optionalHeaders;
            optionalHeaders = [{ name: "Content-type", value: 'application/ssml+xml' },
            { name: "X-Microsoft-OutputFormat", value: this._outputFormat },
            { name: "Authorization", value: this._token },
            { name: "Ocp-Apim-Subscription-Key", value: this._apiKey }]

            let SSML = this.makeSSML(text, locale, synthesisProperties);

            return this.makeHttpCall("POST", this._synthesisURL, true, optionalHeaders, SSML);
        });
    }

    private makeSSML(text: string, locale: string, synthesisProperties: ICognitiveServicesSpeechSynthesisProperties): string {
        if (text.indexOf("<speak") === 0) {
            return this.processSSML(text, synthesisProperties);
        }
        else {
            let ssml = "<speak version='1.0' xml:lang='" + locale + "'><voice xml:lang='" + locale + "' xml:gender='" + (synthesisProperties && synthesisProperties.gender ? SynthesisGender[synthesisProperties.gender] : "Female") + "' name='";

            if (synthesisProperties.voiceName) {
                ssml += synthesisProperties.voiceName;
            }
            else if (synthesisProperties.gender !== null && synthesisProperties.gender !== undefined) {
                ssml += this.fetchVoiceName(locale, synthesisProperties.gender);
            }
            else {
                ssml += this.fetchVoiceName(locale, SynthesisGender.Female);
            }

            return ssml + "'>" + this.encodeHTML(text) + "</voice></speak>";
        }
    }

    private processSSML(ssml: string, synthesisProperties: ICognitiveServicesSpeechSynthesisProperties): string {
        let processDone: boolean = false;

        // Extract locale info from ssml
        let locale: string;
        let match = /xml:lang=['"](\w\w-\w\w)['"]/.exec(ssml);
        if (match) {
            locale = match[1];
        }
        else {
            locale = "en-us";
        }

        const parser = new DOMParser();
        const dom = parser.parseFromString(ssml, 'text/xml');
        const nodes = dom.documentElement.childNodes;

        // Check if there is a voice node
        for (var i = 0; i < nodes.length; ++i) {
            if (nodes[i].nodeName === "voice") {
                let gender: SynthesisGender = null;
                // Check if there is a name attribute on voice element
                for (var j = 0; j < nodes[i].attributes.length; ++j) {
                    if (nodes[i].attributes[j].nodeName === "name") {
                        // Name attribute is found on voice element, use it directly
                        processDone = true;
                        break;
                    }

                    // Find the gender info from voice element in case there is no name attribute
                    if (nodes[i].attributes[j].nodeName === "xml:gender") {
                        gender = nodes[i].attributes[j].nodeValue.toLowerCase() === 'male' ? SynthesisGender.Male : SynthesisGender.Female;
                    }
                }

                if (!processDone) {
                    // Otherwise add the name attribute based on locale and gender
                    if (gender === null) {
                        gender = SynthesisGender.Female;
                    }

                    let attribute = dom.createAttribute("name");
                    attribute.value = synthesisProperties.voiceName || this.fetchVoiceName(locale, gender);
                    nodes[i].attributes.setNamedItem(attribute);
                    processDone = true;
                }
                break;
            }
        }

        const serializer = new XMLSerializer();
        if (!processDone) {
            // There is no voice element, add one based on locale
            let voiceNode = dom.createElement("voice") as Node;
            let attribute = dom.createAttribute("name");
            attribute.value = synthesisProperties.voiceName || this.fetchVoiceName(locale, SynthesisGender.Female);
            voiceNode.attributes.setNamedItem(attribute);

            while (nodes.length > 0) {
                voiceNode.appendChild(dom.documentElement.firstChild);
            }

            dom.documentElement.appendChild(voiceNode);
        }
        return serializer.serializeToString(dom);
    }

    private encodeHTML(text: string): string {
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    private checkAuthToken(): Promise<void> {
        // Token expires in 10 minutes. So we renew the token every 500s
        if (!this._token || (Date.now() - this._lastTokenTime > 500000)) {
            let optionalHeaders: HttpHeader[] = [{ name: "Ocp-Apim-Subscription-Key", value: this._apiKey },
            // required for Firefox otherwise a CORS error is raised
            { name: "Access-Control-Allow-Origin", value: "*" }];

            return this.makeHttpCall("POST", this._tokenURL, false, optionalHeaders).then((text) => {
                this._token = text;
                this._lastTokenTime = Date.now();
                konsole.log("New authentication token generated.");
            }, (ex) => {
                konsole.log("Failed to generate authentication token.");
            });
        }

        return Promise.resolve();
    }

    private makeHttpCall(actionType: string, url: string, isArrayBuffer: boolean = false, optionalHeaders?: HttpHeader[], dataToSend?: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var xhr = new XMLHttpRequest();

            if (isArrayBuffer) {
                xhr.responseType = 'arraybuffer';
            }

            xhr.onreadystatechange = function (event) {
                if (xhr.readyState !== 4) return;
                if (xhr.status >= 200 && xhr.status < 300) {
                    if (!isArrayBuffer) {
                        resolve(xhr.responseText);
                    }
                    else {
                        resolve(xhr.response);
                    }
                } else {
                    reject(xhr.status);
                }
            };
            try {
                xhr.open(actionType, url, true);

                if (optionalHeaders) {
                    optionalHeaders.forEach((header) => {
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
                reject(ex)
            }
        });
    }

    private fetchVoiceName(locale: string, gender: SynthesisGender): string {
        let voiceName: string;

        // source: https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/bingvoiceoutput
        if (gender === SynthesisGender.Female) {
            switch (locale.toLowerCase()) {
                case "ar-eg":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ar-EG, Hoda)";
                    break;
                case "ca-es":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ca-ES, HerenaRUS)";
                    break;
                case "da-dk":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (da-DK, HelleRUS)";
                    break;
                case "de-de":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (de-DE, Hedda)";
                    break;
                case "en-au":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-AU, Catherine)";
                    break;
                case "en-ca":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-CA, Linda)";
                    break;
                case "en-gb":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-GB, Susan, Apollo)";
                    break;
                case "en-in":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-IN, Heera, Apollo)";
                    break;
                case "en-us":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)";
                    break;
                case "es-es":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (es-ES, Laura, Apollo)";
                    break;
                case "es-mx":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (es-MX, HildaRUS)";
                    break;
                case "fi-fi":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (fi-FI, HeidiRUS)";
                    break;
                case "fr-ca":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (fr-CA, Caroline)";
                    break;
                case "fr-fr":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (fr-FR, Julie, Apollo)";
                    break;
                case "hi-in":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (hi-IN, Kalpana, Apollo)";
                    break;
                case "ja-jp":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ja-JP, Ayumi, Apollo)";
                    break;
                case "ko-kr":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ko-KR, HeamiRUS)";
                    break;
                case "nb-no":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (nb-NO, HuldaRUS)";
                    break;
                case "nl-nl":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (nl-NL, HannaRUS)";
                    break;
                case "pl-pl":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (pl-PL, PaulinaRUS)";
                    break;
                case "pt-br":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (pt-BR, HeloisaRUS)";
                    break;
                case "pt-pt":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (pt-PT, HeliaRUS)";
                    break;
                case "ru-ru":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ru-RU, Irina, Apollo)";
                    break;
                case "sv-se":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (sv-SE, HedvigRUS)";
                    break;
                case "tr-tr":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (tr-TR, SedaRUS)";
                    break;
                case "zh-cn":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)";
                    break;
                case "zh-hk":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (zh-HK, Tracy, Apollo)";
                    break;
                case "zh-tw":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (zh-TW, Yating, Apollo)";
                    break;
                default:
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)";
            }
        }
        else {
            switch (locale.toLowerCase()) {
                case "ar-sa":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ar-SA, Naayf)";
                    break;
                case "cs-cz":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (cs-CZ, Vit)";
                    break;
                case "de-at":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (de-AT, Michael)";
                    break;
                case "de-ch":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (de-CH, Karsten)";
                    break;
                case "de-de":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (de-DE, Stefan, Apollo)";
                    break;
                case "el-gr":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (el-GR, Stefanos)";
                    break;
                case "en-gb":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-GB, George, Apollo)";
                    break;
                case "en-ie":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-IE, Shaun)";
                    break;
                case "en-in":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-IN, Ravi, Apollo)";
                    break;
                case "en-us":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)";
                    break;
                case "es-es":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (es-ES, Pablo, Apollo)";
                    break;
                case "es-mx":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (es-MX, Raul, Apollo)";
                    break;
                case "fr-ch":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (fr-CH, Guillaume)";
                    break;
                case "fr-fr":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (fr-FR, Paul, Apollo)";
                    break;
                case "he-il":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (he-IL, Asaf)";
                    break;
                case "hi-in":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (hi-IN, Hemant)";
                    break;
                case "hu-hu":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (hu-HU, Szabolcs)";
                    break;
                case "id-id":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (id-ID, Andika)";
                    break;
                case "it-it":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (it-IT, Cosimo, Apollo)";
                    break;
                case "ja-jp":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ja-JP, Ichiro, Apollo)";
                    break;
                case "pt-br":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (pt-BR, Daniel, Apollo)";
                    break;
                case "ro-ro":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ro-RO, Andrei)";
                    break;
                case "ru-ru":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (ru-RU, Pavel, Apollo)";
                    break;
                case "sk-sk":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (sk-SK, Filip)";
                    break;
                case "th-th":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (th-TH, Pattara)";
                    break;
                case "zh-cn":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (zh-CN, Kangkang, Apollo)";
                    break;
                case "zh-hk":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (zh-HK, Danny, Apollo)";
                    break;
                case "zh-tw":
                    voiceName = "Microsoft Server Speech Text to Speech Voice (zh-TW, Zhiwei, Apollo)";
                    break;
                default:
                    voiceName = "Microsoft Server Speech Text to Speech Voice (en-US, BenjaminRUS)";
            }
        }

        return voiceName;
    }
}
