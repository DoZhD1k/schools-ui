import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Передаем все параметры в исходный API
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });

    const apiUrl = `http://admin.smartalmaty.kz/api/v1/institutions-monitoring/balance-enriched/?${params.toString()}`;

    console.log("Proxying request to:", apiUrl);

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Добавьте сюда заголовки авторизации если нужны
        // "Authorization": "Bearer your-token",
      },
    });

    if (!response.ok) {
      console.error("API error:", response.status, response.statusText);
      return NextResponse.json(
        { error: "Failed to fetch polygons data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log("Polygons data received:", data);

    // Создаем ответ с CORS заголовками
    const nextResponse = NextResponse.json(data);
    nextResponse.headers.set("Access-Control-Allow-Origin", "*");
    nextResponse.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    nextResponse.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );

    return nextResponse;
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
