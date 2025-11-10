import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const API_BASE_URL =
      process.env.NEXT_PUBLIC_AUTH_API_URL ||
      "https://admin.smartalmaty.kz/api/v1/institutions-monitoring";

    console.log("🧪 Testing connection to API:", API_BASE_URL);

    const testEndpoint = `${API_BASE_URL}/school-rating/login/`;

    // Тестируем OPTIONS запрос для проверки CORS
    const optionsResponse = await fetch(testEndpoint, {
      method: "OPTIONS",
      headers: {
        Origin:
          request.headers.get("origin") || "https://schools-ui.vercel.app",
      },
    });

    console.log("📡 OPTIONS response:", {
      status: optionsResponse.status,
      headers: Object.fromEntries(optionsResponse.headers.entries()),
    });

    // Тестируем POST запрос с неверными данными
    const postResponse = await fetch(testEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@test.com",
        password: "wrongpassword",
      }),
    });

    const responseText = await postResponse.text();
    console.log("📡 POST response:", {
      status: postResponse.status,
      statusText: postResponse.statusText,
      body: responseText,
      headers: Object.fromEntries(postResponse.headers.entries()),
    });

    return NextResponse.json({
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
        NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
        API_BASE_URL,
      },
      tests: {
        options: {
          status: optionsResponse.status,
          statusText: optionsResponse.statusText,
        },
        post: {
          status: postResponse.status,
          statusText: postResponse.statusText,
          body: responseText,
        },
      },
    });
  } catch (error) {
    console.error("❌ Test connection error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL_URL: process.env.VERCEL_URL,
          NEXT_PUBLIC_AUTH_API_URL: process.env.NEXT_PUBLIC_AUTH_API_URL,
        },
      },
      { status: 500 }
    );
  }
}
