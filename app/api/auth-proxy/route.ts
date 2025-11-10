import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(
      "https://admin.smartalmaty.kz/api/v1/institutions-monitoring/school-rating/login/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Schools-UI-Vercel-Proxy/1.0",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.text();

    console.log("🔄 Proxy response:", {
      status: response.status,
      statusText: response.statusText,
      body: data,
    });

    // Возвращаем ответ как есть
    return new NextResponse(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return NextResponse.json(
      {
        error:
          "Proxy error: " +
          (error instanceof Error ? error.message : "Unknown"),
      },
      { status: 500 }
    );
  }
}
