import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ z: string; x: string; y: string }> }
) {
  const { z, x, y } = await params;
  const tileUrl = `https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x=${x}&y=${y}&z=${z}&lang=ru_RU`;

  try {
    const response = await fetch(tileUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TileProxy/1.0)",
        Referer: "https://yandex.ru/maps/",
      },
    });

    if (!response.ok) {
      return new NextResponse(null, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
