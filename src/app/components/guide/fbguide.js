import React from "react";
import Image from "next/image";

const FacebookGuide = () => {
  return (
    <div className="py-12 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
          Steps to Download Facebook Videos with FesnukSave
        </h2>
        <p className="text-gray-600 text-center mb-12 leading-relaxed">
          Save Facebook videos to your device by following the three steps
          below.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div
              className="relative mb-6 rounded overflow-hidden"
              style={{ height: "200px" }}
            >
              <Image
                src="/images/fbguide/step1.png"
                alt="Step 1: Copy Facebook video URL"
                layout="fill"
                objectFit="contain"
                quality={100}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Step 1: Copy the Video URL
            </h3>
            <p className="text-gray-600">
              Start by copying the URL of the video post. Make sure the URL is
              complete to get the best results.
            </p>
          </div>

          <div>
            <div
              className="relative mb-6 rounded overflow-hidden"
              style={{ height: "200px" }}
            >
              <Image
                src="/images/fbguide/step2.png"
                alt="Step 2: Paste URL in FesnukSave"
                layout="fill"
                objectFit="contain"
                quality={100}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Step 2: Paste the URL in FesnukSave
            </h3>
            <p className="text-gray-600">
              Open the FesnukSave website, paste the video link into the input
              field, and click the Download button. An intuitive interface
              ensures the process runs smoothly and quickly. FesnukSave will
              immediately process your video link.
            </p>
          </div>

          <div>
            <div
              className="relative mb-6 rounded overflow-hidden"
              style={{ height: "200px" }}
            >
              <Image
                src="/images/fbguide/step3.png"
                alt="Step 3: Select quality and download"
                layout="fill"
                objectFit="contain"
                quality={100}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Step 3: Select Video Quality and Download
            </h3>
            <p className="text-gray-600">
              Choose the video quality you want from the available options and
              start downloading. Once selected, the download process will begin
              and the video will be saved to your device right away.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacebookGuide;
