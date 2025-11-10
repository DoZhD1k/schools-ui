/**
 * Универсальный API прокси для School Rating API
 * Проксирует все запросы к внешнему API, решая проблему CORS
 */

import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL =
  "http://admin.smartalmaty.kz/api/v1/institutions-monitoring";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "PUT");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams.path, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join("/");
    const url = `${API_BASE_URL}/${path}`;

    // Получаем поисковые параметры из исходного запроса
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    console.log(`🔄 Proxying ${method} request to:`, fullUrl);

    // Подготавливаем заголовки
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Переносим Authorization header если есть
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    // Подготавливаем тело запроса для методов с телом
    let body: string | undefined;
    if (["POST", "PUT", "PATCH"].includes(method)) {
      try {
        const requestBody = await request.json();
        body = JSON.stringify(requestBody);
        console.log(
          "📝 Request body:",
          path.includes("login")
            ? { ...requestBody, password: "[HIDDEN]" }
            : requestBody
        );
      } catch {
        // Если нет тела запроса, это нормально для некоторых запросов
      }
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    console.log("📡 External API response:", {
      status: response.status,
      statusText: response.statusText,
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.log(`❌ ${method} ${path} failed:`, responseData);
      return NextResponse.json(responseData, { status: response.status });
    }

    console.log(`✅ ${method} ${path} successful`);
    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    return NextResponse.json(
      { error: "Ошибка подключения к серверу" },
      { status: 500 }
    );
  }
}
