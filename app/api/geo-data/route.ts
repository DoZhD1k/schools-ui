import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Простая функция для проверки токена
function validateToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }

  const token = authHeader.substring(7);

  // Читаем моковые данные для проверки токена
  try {
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Проверяем, существует ли такой токен
    for (const tokens of Object.values(authData.tokens)) {
      const tokenData = tokens as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        role: string;
      };
      if (tokenData.access_token === token) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get("authorization");

    if (!validateToken(authHeader)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Читаем моковые геоданные
    const geoDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "geo-data.json"
    );
    const geoData = JSON.parse(fs.readFileSync(geoDataPath, "utf8"));

    // Возвращаем данные в том же формате, что ожидает клиент
    return NextResponse.json(geoData);
  } catch (error) {
    console.error("Geo data error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
