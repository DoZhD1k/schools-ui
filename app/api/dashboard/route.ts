import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.DATAPOLIS_API_URL;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Простая проверка токена на существование
    if (!token) {
      return NextResponse.json(
        { message: "Token not provided" },
        { status: 401 }
      );
    }

    // Получаем статистику с бэкенда
    const response = await fetch(`${API_URL}/api/dashboard/stats`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard stats");
    }

    const stats = await response.json();

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
