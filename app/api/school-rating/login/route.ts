/**
 * API Route для проксирования запросов авторизации
 * Решает проблему CORS при запросах к внешнему API
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  "http://admin.smartalmaty.kz/api/v1/institutions-monitoring";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log(
      "🔄 Proxying login request to:",
      `${API_BASE_URL}/school-rating/login/`
    );
    console.log("📝 Request body:", {
      email: body.email,
      password: "[HIDDEN]",
    });

    const response = await fetch(`${API_BASE_URL}/school-rating/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("📡 External API response:", {
      status: response.status,
      statusText: response.statusText,
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("❌ Login failed:", data);
      return NextResponse.json(data, { status: response.status });
    }

    console.log("✅ Login successful");
    return NextResponse.json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return NextResponse.json(
      { error: "Ошибка подключения к серверу" },
      { status: 500 }
    );
  }
}
