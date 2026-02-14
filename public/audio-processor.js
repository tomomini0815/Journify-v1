class AudioProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 2048; // Send chunks of this size
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || !input[0]) return true;

        const inputChannel = input[0];

        // Simple downsampling/buffering could happen here, but for now we just
        // fill a buffer and send it to the main thread.
        // The main thread (hook) will handle resampling to 16kHz if needed.

        for (let i = 0; i < inputChannel.length; i++) {
            this.buffer[this.bufferIndex++] = inputChannel[i];

            if (this.bufferIndex >= this.bufferSize) {
                this.port.postMessage(this.buffer.slice());
                this.bufferIndex = 0;
            }
        }

        return true;
    }
}

registerProcessor("audio-processor", AudioProcessor);
