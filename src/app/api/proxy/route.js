export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get("url");
  const title = searchParams.get("title");

  if (!mediaUrl) {
    return new Response("URL media diperlukan", { status: 400 });
  }

  try {
    const isInstagram =
      mediaUrl.includes("cdninstagram.com") ||
      mediaUrl.includes("instagram.com");
    const isFacebook =
      mediaUrl.includes("fbcdn.net") || mediaUrl.includes("facebook.com");
    const isInstagramVideo =
      mediaUrl.includes("cdninstagram.com/v/") ||
      mediaUrl.includes("fbcdn.net/v/t");

    const headers = {
      Referer: isInstagram
        ? "https://www.instagram.com/"
        : isFacebook
        ? "https://www.facebook.com/"
        : "https://www.google.com/",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "*/*",
      "Accept-Encoding": "identity",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      ...(isInstagramVideo && {
        "sec-fetch-dest": "video",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "cross-site",
      }),
      ...(req.headers.get("range") && { Range: req.headers.get("range") }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(mediaUrl, {
      headers,
      compress: false,
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 403 && isInstagram) {
        return new Response(
          "Media tidak dapat diakses. Kemungkinan akun bersifat private atau diproteksi.",
          {
            status: 403,
          }
        );
      }
      throw new Error(`Gagal mengambil media: ${res.status} ${res.statusText}`);
    }

    const contentType = res.headers.get("content-type") || "";

    const isVideo =
      contentType.startsWith("video/") ||
      mediaUrl.includes(".mp4") ||
      isInstagramVideo;
    const isImage =
      contentType.startsWith("image/") ||
      mediaUrl.includes(".jpg") ||
      mediaUrl.includes(".jpeg") ||
      mediaUrl.includes(".png");

    if (!isVideo && !isImage && !contentType.includes("octet-stream")) {
      return new Response("URL tidak menunjuk ke media yang valid", {
        status: 400,
      });
    }

    const contentLength = res.headers.get("content-length");
    const acceptRanges = res.headers.get("accept-ranges");

    let fileExtension = "mp4";
    if (isImage) {
      if (mediaUrl.includes(".png")) fileExtension = "png";
      else if (mediaUrl.includes(".jpeg")) fileExtension = "jpeg";
      else fileExtension = "jpg";
    } else if (isVideo) {
      fileExtension = "mp4";
    }

    const responseHeaders = {
      "Content-Type": contentType || (isVideo ? "video/mp4" : "image/jpeg"),
      "Accept-Ranges": acceptRanges || "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Cross-Origin-Resource-Policy": "cross-origin",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Accept, Accept-Encoding",
      "Content-Encoding": res.headers.get("content-encoding") || "identity",
      ...(contentLength && { "Content-Length": contentLength }),
      ...(title && {
        "Content-Disposition": `attachment; filename="${encodeURIComponent(
          title.replace(/[^a-z0-9]/gi, "_")
        )}.${fileExtension}"`,
      }),
      "X-Content-Type-Options": "nosniff",
    };

    if (req.headers.get("range")) {
      return new Response(res.body, {
        status: 206,
        headers: {
          ...responseHeaders,
          "Content-Range": res.headers.get("content-range"),
        },
      });
    }

    return new Response(res.body, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);

    let errorMessage = `Error: ${error.message}`;
    let statusCode = 500;

    if (error.name === "AbortError") {
      errorMessage = "Permintaan timeout: Server tidak merespons";
      statusCode = 504;
    }

    return new Response(errorMessage, { status: statusCode });
  }
}
