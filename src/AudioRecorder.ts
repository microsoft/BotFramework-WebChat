
/*License (MIT)

Copyright Â© 2013 Matt Diamond

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and 
to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of 
the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO 
THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
DEALINGS IN THE SOFTWARE.
*/

export type Action = () => void

export class AudioRecorder {
    private input: GainNode;
    private context: any;
    private node: any;
    private audioActive: boolean;
    private recording: boolean;
    private websocket: WebSocket;
    private onAudioFlowing: Action;
    private readonly bufferLen = 4096;

    constructor(source: GainNode, onAudioFlowing: Action = null) {
        this.input = source;
        this.context = source.context;
        this.onAudioFlowing = onAudioFlowing;
        if (!this.context.createScriptProcessor) {
            this.node = this.context.createJavaScriptNode(this.bufferLen, 2, 2);
        } else {
            this.node = this.context.createScriptProcessor(this.bufferLen, 2, 2);
        }

        this.recording = false;
        this.audioActive = false;

        this.node.onaudioprocess = (e : any) => {
            this.audioActive = true;
            if (this.onAudioFlowing) {
                this.onAudioFlowing();
                this.onAudioFlowing = null;
            }

            if (!this.recording)
                return;

            let inputL = e.inputBuffer.getChannelData(0);
            let length = Math.floor(inputL.length / 3);
            let result = new Float32Array(length);

            let index = 0;
            let inputIndex = 0;

            while (index < length) {
                result[index++] = inputL[inputIndex];
                inputIndex += 3;
            }

            let offset = 0;
            let buffer = new ArrayBuffer(length * 2);
            let view = new DataView(buffer);
            for (let i = 0; i < result.length; i++ , offset += 2) {
                let s = Math.max(-1, Math.min(1, result[i]));
                view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }

            this.websocket.send(view);
        }

        source.connect(this.node);
        this.node.connect(this.context.destination);   // if the script node is not connected to an output the "onaudioprocess" event is not triggered in chrome.
    }

    public record(websocket : WebSocket) {
        this.websocket = websocket;
        this.recording = true;
    }

    public get isAudioActive() {
        return this.audioActive;
    }

    public stop() {
        this.recording = false;
        this.audioActive = false
        this.node.disconnect(0);
        this.input.disconnect(0);
    }

    public sendHeader(ws : WebSocket) {
        let sampleLength = 1000000;
        let mono = true;
        let sampleRate = 16000;
        let buffer = new ArrayBuffer(44);
        let view = new DataView(buffer);

        /* RIFF identifier */
        this.writeString(view, 0, 'RIFF');
        /* file length */
        view.setUint32(4, 32 + sampleLength * 2, true);
        /* RIFF type */
        this.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        this.writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, 1, true);
        /* channel count */
        view.setUint16(22, mono ? 1 : 2, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate * 2, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, 2, true);
        /* bits per sample */
        view.setUint16(34, 16, true);
        /* data chunk identifier */
        this.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, sampleLength * 2, true);

        ws.send(view);
    }

    private writeString(view : DataView, offset : number, string : string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}