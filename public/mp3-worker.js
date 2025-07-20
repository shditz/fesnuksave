self.importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js"
);

self.onmessage = function (e) {
  const { audioBuffer, sampleRate } = e.data;

  try {
    const int16Samples = new Int16Array(audioBuffer.length);
    for (let i = 0; i < audioBuffer.length; i++) {
      int16Samples[i] = Math.max(-1, Math.min(1, audioBuffer[i])) * 0x7fff;
    }

    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
    const mp3Data = [];

    const sampleBlockSize = 1152;

    for (let i = 0; i < int16Samples.length; i += sampleBlockSize) {
      const sampleChunk = int16Samples.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(mp3buf);
      }

      const progress = (i / int16Samples.length) * 100;
      self.postMessage({
        type: "progress",
        progress: Math.min(progress, 100),
      });
    }

    const mp3buf = mp3encoder.flush();
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf);
    }

    self.postMessage({
      type: "complete",
      mp3Data: mp3Data,
    });
  } catch (error) {
    self.postMessage({
      type: "error",
      message: error.message,
    });
  }
};
