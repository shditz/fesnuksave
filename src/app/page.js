// app/page.js - Optimized frontend
"use client";
import { useState, useCallback, useMemo } from "react";
import DownloadResult from "./components/result/fbresult";
import WhyUseFesnukSave from "./components/explanation/fbexplanation";
import FacebookGuide from "./components/guide/fbguide";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidUrl = useMemo(() => {
    const fbRegex = /^(https?:\/\/)?(www\.|m\.|mobile\.)?facebook\.com\/.*/i;
    return url && fbRegex.test(url);
  }, [url]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError("");
    } catch (err) {
      setError("Gagal membaca clipboard. Pastikan Anda memberikan izin akses.");
    }
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!isValidUrl) {
        setError("URL Facebook tidak valid");
        return;
      }

      setLoading(true);
      setError("");
      setResult(null);

      try {
        const timeoutId = setTimeout(() => {
          setError("Request timeout. Silakan coba lagi.");
          setLoading(false);
        }, 20000);

        const response = await fetch("/api/downloadfb", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok)
          throw new Error(data.error || "Gagal memproses video");
        if (!data.url) throw new Error("Tidak ada video yang tersedia");

        setResult({
          title: data.title,
          thumbnail: data.thumbnail,
          url: data.url,
        });
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    },
    [url, isValidUrl]
  );

  const resetForm = useCallback(() => {
    setResult(null);
    setError("");
    setUrl("");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-700">
            Facebook Video Downloader
          </h1>
          <p className="text-gray-600 mt-2">
            Download Facebook videos using FesnukSave for free and fast
          </p>
        </div>

        {!result && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-purple-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Tempel URL video Facebook"
                    required
                    className={`w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 transition ${
                      url && !isValidUrl
                        ? "border-red-300 focus:border-red-500"
                        : "border-purple-200 focus:border-purple-500"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-purple-600 transition-colors"
                    title="Tempel dari clipboard"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                      />
                    </svg>
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={loading || !isValidUrl}
                  className={`flex-shrink-0 py-3 px-4 rounded-xl text-white font-bold shadow-lg flex items-center transition-all duration-300 ${
                    loading || !isValidUrl
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 transform hover:scale-[1.02]"
                  }`}
                  title="Download video"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
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
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Memproses...
                    </div>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="w-5 h-5 mr-1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Download
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex items-center text-red-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">Error:</span>
            </div>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div>
            <DownloadResult result={result} />
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto mb-6 mt-6 border-purple-200 border-t"></div>
      <section>
        <WhyUseFesnukSave />
      </section>
      <div className="max-w-6xl mx-auto mb-6 mt-6 border-purple-200 border-t"></div>
      <section>
        <FacebookGuide />
      </section>
    </div>
  );
}
