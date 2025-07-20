import { NextResponse } from "next/server";

export async function POST(req) {
  const { url } = await req.json();

  try {
    const fbRegex = /^(https?:\/\/)?(www\.|m\.|mobile\.)?facebook\.com\/.*/i;
    if (!fbRegex.test(url)) {
      return NextResponse.json(
        {
          error: "URL Facebook tidak valid",
        },
        { status: 400 }
      );
    }

    let normalizedUrl = url;
    if (!url.startsWith("http")) {
      normalizedUrl = "https://" + url;
    }

    normalizedUrl = normalizedUrl.replace(
      /m\.facebook\.com|mobile\.facebook\.com/g,
      "www.facebook.com"
    );

    const guessResolution = (str) => {
      str = str.toLowerCase();
      if (str.includes("4k") || str.includes("2160")) return "4K";
      if (str.includes("2k") || str.includes("1440")) return "1440p";
      if (str.includes("1080")) return "1080p";
      if (str.includes("720") || str.includes("hd")) return "720p";
      if (str.includes("480") || str.includes("sd")) return "480p";
      if (str.includes("360")) return "360p";
      return "Unknown";
    };

    const sortQualities = (qualities) => {
      const qualityOrder = {
        "4K": 4000,
        "2160p": 2160,
        "1440p": 1440,
        "1080p": 1080,
        "720p": 720,
        hd: 720,
        "480p": 480,
        "360p": 360,
        sd: 480,
        low: 240,
        Unknown: 0,
      };

      return qualities.sort((a, b) => {
        const aRes = qualityOrder[a.quality] || 0;
        const bRes = qualityOrder[b.quality] || 0;
        return bRes - aRes;
      });
    };

    try {
      const y2mateResponse = await fetch(
        "https://www.y2mate.com/mates/analyzeV2/ajax",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept: "*/*",
            "X-Requested-With": "XMLHttpRequest",
            Origin: "https://www.y2mate.com",
            Referer: "https://www.y2mate.com/facebook-downloader",
          },
          body: new URLSearchParams({
            k_query: normalizedUrl,
            k_page: "facebook",
            hl: "en",
            q_auto: "0",
          }),
        }
      );

      if (y2mateResponse.ok) {
        const y2mateData = await y2mateResponse.json();
        if (
          y2mateData.status === "ok" &&
          y2mateData.links &&
          y2mateData.links.mp4
        ) {
          const qualities = [];
          for (const [qualityLabel, data] of Object.entries(
            y2mateData.links.mp4
          )) {
            if (data.url) {
              qualities.push({
                quality: qualityLabel,
                url: data.url,
              });
            }
          }

          if (qualities.length > 0) {
            const sortedQualities = sortQualities(qualities);
            const highestQuality = sortedQualities[0];
            return NextResponse.json({
              title: y2mateData.title || "Facebook Video",
              thumbnail: y2mateData.a || null,
              url: highestQuality.url,
            });
          }
        }
      }
    } catch (e) {}

    try {
      const saveFromResponse = await fetch(
        "https://savefrom.net/savefrom.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "X-Requested-With": "XMLHttpRequest",
            Accept: "*/*",
          },
          body: new URLSearchParams({
            sf_url: normalizedUrl,
            sf_submit: "",
            new: "2",
          }),
        }
      );

      if (saveFromResponse.ok) {
        const html = await saveFromResponse.text();
        const linkMatches = html.match(/href="([^"]*\.mp4[^"]*)"/g);
        if (linkMatches && linkMatches.length > 0) {
          const videoUrls = linkMatches.map(
            (match) => match.match(/href="([^"]*)"/)[1]
          );

          const qualities = [];
          for (const url of videoUrls) {
            const quality = guessResolution(url);
            qualities.push({ quality, url });
          }

          if (qualities.length > 0) {
            const sortedQualities = sortQualities(qualities);
            const highestQuality = sortedQualities[0];
            const titleMatch = html.match(
              /<div class="info-box"[^>]*>.*?<b>([^<]+)<\/b>/s
            );
            return NextResponse.json({
              title: titleMatch ? titleMatch[1].trim() : "Facebook Video",
              thumbnail: null,
              url: highestQuality.url,
            });
          }
        }
      }
    } catch (e) {}

    try {
      const getFvidResponse = await fetch(
        "https://www.getfvid.com/downloader",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            Origin: "https://www.getfvid.com",
            Referer: "https://www.getfvid.com/",
          },
          body: new URLSearchParams({
            url: normalizedUrl,
          }),
        }
      );

      if (getFvidResponse.ok) {
        const html = await getFvidResponse.text();
        const titleMatch = html.match(
          /<h5 class="card-title"[^>]*>([^<]+)<\/h5>/
        );

        const downloadButtons = html.match(
          /<a href="([^"]*)"[^>]*class="[^"]*btn-download[^"]*"[^>]*>([^<]*)<\/a>/g
        );
        const qualities = [];

        if (downloadButtons) {
          for (const button of downloadButtons) {
            const urlMatch = button.match(/href="([^"]*)"/);
            const textMatch = button.match(/>([^<]*)</);

            if (urlMatch && textMatch) {
              const quality = guessResolution(textMatch[1]);
              qualities.push({
                quality,
                url: urlMatch[1],
              });
            }
          }
        }

        if (qualities.length > 0) {
          const sortedQualities = sortQualities(qualities);
          const highestQuality = sortedQualities[0];
          return NextResponse.json({
            title: titleMatch ? titleMatch[1].trim() : "Facebook Video",
            thumbnail: null,
            url: highestQuality.url,
          });
        }
      }
    } catch (e) {}

    try {
      const response = await fetch(normalizedUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
          "Accept-Encoding": "gzip, deflate, br",
          DNT: "1",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
      });

      if (response.ok) {
        const html = await response.text();
        const videoPatterns = [
          /"playable_url_quality_hd":"([^"]+)"/,
          /"browser_native_hd_url":"([^"]+)"/,
          /hd_src_no_ratelimit:"([^"]+)"/,
          /"hd_src":"([^"]+)"/,
          /"playable_url":"([^"]+)"/,
          /"browser_native_sd_url":"([^"]+)"/,
          /sd_src_no_ratelimit:"([^"]+)"/,
          /"sd_src":"([^"]+)"/,
          /"src":"([^"]*\.mp4[^"]*)"/g,
          /src:"([^"]*\.mp4[^"]*)"/g,
        ];

        const qualities = [];

        for (const pattern of videoPatterns) {
          const matches = html.matchAll(
            new RegExp(pattern.source, pattern.flags || "g")
          );
          for (const match of matches) {
            if (match && match[1]) {
              const cleanUrl = match[1]
                .replace(/\\\//g, "/")
                .replace(/\\u0026/g, "&")
                .replace(/\\u003d/g, "=")
                .replace(/\\"/g, '"')
                .replace(/\\&/g, "&");

              if (cleanUrl.includes(".mp4") || cleanUrl.includes("video")) {
                const quality = guessResolution(cleanUrl);
                qualities.push({
                  quality,
                  url: cleanUrl,
                });
              }
            }
          }
        }

        const uniqueQualities = qualities.filter(
          (obj, index, self) =>
            index === self.findIndex((t) => t.url === obj.url)
        );

        if (uniqueQualities.length > 0) {
          const sortedQualities = sortQualities(uniqueQualities);
          const highestQuality = sortedQualities[0];

          const titleMatches = [
            html.match(/<title[^>]*>([^<]+)<\/title>/i),
            html.match(/"video_title":"([^"]+)"/),
            html.match(/"name":"([^"]+)"/),
            html.match(/data-ft="([^"]*)"[^>]*>([^<]+)</i),
          ];

          let title = "Facebook Video";
          for (const titleMatch of titleMatches) {
            if (titleMatch && titleMatch[1]) {
              title = titleMatch[1]
                .replace(/\\u0026/g, "&")
                .replace(/\\"/g, '"')
                .replace(/ \| Facebook/, "")
                .trim();
              break;
            }
          }

          return NextResponse.json({
            title: title,
            thumbnail: null,
            url: highestQuality.url,
          });
        }
      }
    } catch (e) {}

    return NextResponse.json(
      {
        error:
          "Video tidak dapat diunduh. Kemungkinan penyebab:\n" +
          "• Video bersifat private\n" +
          "• URL tidak valid atau sudah kadaluwarsa\n" +
          "• Video telah dihapus\n" +
          "• Coba gunakan URL yang berbeda atau pastikan video bersifat publik",
      },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: `Kesalahan server: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
