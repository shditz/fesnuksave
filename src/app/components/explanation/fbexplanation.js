import React from "react";

const WhyUseFesnukSave = () => {
  return (
    <div className="max-w-6xl mx-auto bg-purple-50 py-6 px-6 md:px-6">
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Why you should use{" "}
          <span className="bg-gradient-to-r from-purple-600 to-indigo-700 text-transparent bg-clip-text">
            FesnukSave?
          </span>
        </h2>
        <p className="text-gray-600 text-center mb-12 leading-relaxed">
          FesnukSave is the best website for downloading Facebook videos to help
          you download high-quality Facebook videos simply by pasting the URL.
          <br />
          Use FesnukSave to download videos from Facebook using your browser. No
          need to install any software. Supports Android and iOS.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Best Quality
            </h3>
            <p className="text-gray-600">
              FesnukSave can download Facebook videos in Full HD up to 4K
              quality. So you can enjoy Facebook videos with better quality.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy</h3>
            <p className="text-gray-600">
              Facebook video downloader for any device (phone, PC, or tablet),
              and any OS (Android, iOS). You don't need to install any software.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Free</h3>
            <p className="text-gray-600">
              FesnukSave is always free and without ads. So you can download
              Facebook videos easily and without limits.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyUseFesnukSave;
