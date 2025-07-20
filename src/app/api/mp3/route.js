import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req) {
  const { videoUrl, title } = await req.json();

  if (!videoUrl) {
    return NextResponse.json(
      { error: "URL video diperlukan" },
      { status: 400 }
    );
  }

  const tempDir = path.join(process.cwd(), "temp");
  const inputFile = path.join(tempDir, "input.mp4");
  const outputFile = path.join(tempDir, "output.mp3");
  const safeTitle = (title || "audio").replace(/[^a-z0-9]/gi, "_");

  try {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const response = await fetch(videoUrl);
    if (!response.ok) throw new Error("Failed to download video");

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(inputFile, Buffer.from(buffer));

    await execAsync(
      `ffmpeg -i "${inputFile}" -vn -acodec libmp3lame -ab 128k -ar 44100 -y "${outputFile}"`
    );

    const audioBuffer = fs.readFileSync(outputFile);

    fs.unlinkSync(inputFile);
    fs.unlinkSync(outputFile);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${safeTitle}.mp3"`,
      },
    });
  } catch (error) {
    console.error("Audio extraction error:", error);

    try {
      if (fs.existsSync(inputFile)) fs.unlinkSync(inputFile);
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    return NextResponse.json(
      { error: `Gagal mengkonversi audio: ${error.message}` },
      { status: 500 }
    );
  }
}
