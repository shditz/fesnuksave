import { NextResponse } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import stream from "stream";
import { promisify } from "util";
import axios from "axios";

export async function POST(request) {
  const { videoUrl } = await request.json();

  try {
    const videoResponse = await axios.get(videoUrl, { responseType: "stream" });

    const pipeline = promisify(stream.pipeline);
    const transformStream = new stream.PassThrough();

    ffmpeg(videoResponse.data)
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        transformStream.destroy(err);
      })
      .pipe(transformStream, { end: true });

    return new NextResponse(transformStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="converted.mp3"',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Konversi gagal: " + error.message },
      { status: 500 }
    );
  }
}
