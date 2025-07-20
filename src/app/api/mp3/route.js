import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { videoUrl, title } = await req.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: "URL video diperlukan" },
        { status: 400 }
      );
    }

    const videoResponse = await fetch(videoUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "*/*",
        "Accept-Encoding": "identity",
      },
    });

    if (!videoResponse.ok) {
      throw new Error("Gagal mengunduh video");
    }

    const videoBuffer = await videoResponse.arrayBuffer();

    const base64Video = Buffer.from(videoBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      videoData: base64Video,
      title: title || "audio",
      mimeType: videoResponse.headers.get("content-type") || "video/mp4",
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return NextResponse.json(
      { error: `Gagal konversi: ${error.message}` },
      { status: 500 }
    );
  }
}
