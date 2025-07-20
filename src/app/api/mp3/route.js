import { NextResponse } from "next/server";
import { spawn } from "child_process";

export async function POST(req) {
  const { videoUrl, title } = await req.json();

  if (!videoUrl) {
    return NextResponse.json(
      { error: "URL video diperlukan" },
      { status: 400 }
    );
  }

  const safeTitle = (title || "audio").replace(/[^a-z0-9]/gi, "_");

  try {
    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to download video");

    const videoBuffer = Buffer.from(await response.arrayBuffer());
    const audioBuffer = await convertVideoToMp3(videoBuffer);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${safeTitle}.mp3"`,
      },
    });
  } catch (error) {
    console.error("Audio extraction error:", error);
    return NextResponse.json(
      { error: `Gagal mengkonversi audio: ${error.message}` },
      { status: 500 }
    );
  }
}

function convertVideoToMp3(videoBuffer) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      "pipe:0",
      "-vn",
      "-acodec",
      "libmp3lame",
      "-ab",
      "128k",
      "-ar",
      "44100",
      "-f",
      "mp3",
      "pipe:1",
    ]);

    ffmpeg.stdout.on("data", (chunk) => {
      chunks.push(chunk);
    });

    ffmpeg.stderr.on("data", (data) => {
      console.log("FFmpeg stderr:", data.toString());
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        const audioBuffer = Buffer.concat(chunks);
        resolve(audioBuffer);
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });

    ffmpeg.on("error", (error) => {
      reject(new Error(`FFmpeg spawn error: ${error.message}`));
    });

    ffmpeg.stdin.write(videoBuffer);
    ffmpeg.stdin.end();
  });
}

export function convertVideoToMp3Stream(videoBuffer) {
  return new Promise((resolve, reject) => {
    const { Readable, Transform } = require("stream");
    const chunks = [];

    const ffmpeg = spawn("ffmpeg", [
      "-i",
      "pipe:0",
      "-vn",
      "-acodec",
      "libmp3lame",
      "-ab",
      "128k",
      "-ar",
      "44100",
      "-f",
      "mp3",
      "pipe:1",
    ]);

    const videoStream = new Readable({
      read() {},
    });

    videoStream.push(videoBuffer);
    videoStream.push(null);

    videoStream.pipe(ffmpeg.stdin);

    ffmpeg.stdout.on("data", (chunk) => {
      chunks.push(chunk);
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error(`FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on("error", reject);
  });
}
