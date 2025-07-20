import { useState } from "react";

export default function DownloadResult({ result }) {
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  const code = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 24; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleDownload = async (filename) => {
    setVideoLoading(true);
    try {
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(
        result.url
      )}&title=${encodeURIComponent(filename)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert(`Gagal mengunduh video: ${error.message}`);
    } finally {
      setVideoLoading(false);
    }
  };

  const extractAudioToMp3 = async (videoBlob) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoBlob);
      video.crossOrigin = "anonymous";

      video.addEventListener("loadedmetadata", async () => {
        try {
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();

          source.connect(destination);
          source.connect(audioContext.destination);

          const mediaRecorder = new MediaRecorder(destination.stream, {
            mimeType: "audio/webm;codecs=opus",
          });

          const audioChunks = [];

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunks.push(event.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const webmBlob = new Blob(audioChunks, { type: "audio/webm" });

            try {
              const mp3Blob = await convertWebmToMp3(webmBlob);
              resolve(mp3Blob);
            } catch (conversionError) {
              console.warn("MP3 conversion failed, falling back to WebM");
              resolve(webmBlob);
            }

            audioContext.close();
            URL.revokeObjectURL(video.src);
          };

          mediaRecorder.start();

          await video.play();

          video.addEventListener("ended", () => {
            mediaRecorder.stop();
          });
        } catch (error) {
          reject(error);
        }
      });

      video.addEventListener("error", (error) => {
        reject(new Error("Gagal memuat video untuk ekstraksi audio"));
      });
    });
  };

  const convertWebmToMp3 = async (webmBlob) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js";
      script.onload = async () => {
        try {
          const arrayBuffer = await webmBlob.arrayBuffer();
          const audioContext = new (window.AudioContext ||
            window.webkitAudioContext)();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

          const samples = audioBuffer.getChannelData(0);
          const sampleRate = audioBuffer.sampleRate;

          const int16Samples = new Int16Array(samples.length);
          for (let i = 0; i < samples.length; i++) {
            int16Samples[i] = Math.max(-1, Math.min(1, samples[i])) * 0x7fff;
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
          }

          const mp3buf = mp3encoder.flush();
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }

          const mp3Blob = new Blob(mp3Data, { type: "audio/mp3" });
          resolve(mp3Blob);
        } catch (error) {
          reject(error);
        }
      };

      script.onerror = () => {
        reject(new Error("Gagal memuat library MP3 encoder"));
      };

      document.head.appendChild(script);
    });
  };

  const handleMp3Download = async () => {
    setAudioLoading(true);
    try {
      const response = await fetch(
        `/api/proxy?url=${encodeURIComponent(result.url)}`
      );
      if (!response.ok) throw new Error("Gagal mengunduh video");

      const videoBlob = await response.blob();

      const audioBlob = await extractAudioToMp3(videoBlob);

      const fileExtension = audioBlob.type.includes("mp3") ? "mp3" : "webm";

      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fesnuksave-audio_${code()}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Audio extraction failed:", error);
      alert(`Gagal mengekstrak audio: ${error.message}`);
    } finally {
      setAudioLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-purple-100">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2">
          {result.title}
        </h3>
        <div className="aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-purple-50 to-gray-100 border border-purple-100 mb-4">
          {!videoError ? (
            <video
              controls
              preload="auto"
              playsInline
              className="w-full h-full object-cover"
              onError={() => setVideoError(true)}
              src={result.url}
              poster={result.thumbnail || ""}
            >
              Browser Anda tidak mendukung pemutaran video
            </video>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-purple-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-500 text-center">
                Video tidak dapat diputar, silahkan download
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() =>
            handleDownload(`fesnuksave-web_${code()}_hd-video.mp4`)
          }
          disabled={videoLoading || audioLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center space-x-2">
            {videoLoading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Downloading Video...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Download MP4</span>
              </>
            )}
          </div>
        </button>

        <button
          onClick={handleMp3Download}
          disabled={videoLoading || audioLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold rounded-xl shadow-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center space-x-2">
            {audioLoading ? (
              <>
                <svg
                  className="animate-spin w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Converting to MP3...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793l-4.146-3.317a1 1 0 00-.632-.226H2a1 1 0 01-1-1V7.25a1 1 0 011-1h1.605a1 1 0 00.632-.226l4.146-3.317zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Download MP3</span>
              </>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
