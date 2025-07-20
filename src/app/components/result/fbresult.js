import { useState } from "react";

export default function DownloadResult({ result }) {
  const [videoError, setVideoError] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
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

  const handleMp3Download = async () => {
    setAudioLoading(true);

    try {
      const response = await fetch("/api/mp3", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: result.url,
          title: result.title,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengkonversi audio");
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `fesnuksave-web_${code()}_mp3convert`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("MP3 conversion failed:", error);
      alert(`Gagal mengkonversi ke MP3: ${error.message}`);
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
          onClick={() => handleDownload(`fesnuksave-web_${code()}_hd-video`)}
          disabled={videoLoading}
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
                <span>Downloading MP4...</span>
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
          disabled={audioLoading}
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
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L4.617 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.617l3.766-3.793a1 1 0 011.617.793zm7.447 2.17a1 1 0 011.414 0A9.06 9.06 0 0121 12a9.06 9.06 0 01-2.756 6.754 1 1 0 11-1.414-1.414A7.06 7.06 0 0019 12a7.06 7.06 0 00-2.17-5.16 1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A4.532 4.532 0 0116 12a4.532 4.532 0 01-.583 2.926 1 1 0 11-1.415-1.414A2.532 2.532 0 0014.5 12a2.532 2.532 0 00-.498-1.512 1 1 0 010-1.414z"
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
