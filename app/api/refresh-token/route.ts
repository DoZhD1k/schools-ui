import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    // Получаем refresh token из cookies
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token found" },
        { status: 401 }
      );
    }

    // Читаем моковые данные
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Находим пользователя по refresh token
    let userTokens: {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      role: string;
    } | null = null;
    let username = null;

    for (const [user, tokens] of Object.entries(authData.tokens)) {
      const tokenData = tokens as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        role: string;
      };
      if (tokenData.refresh_token === refreshToken) {
        userTokens = tokenData;
        username = user;
        break;
      }
    }

    if (!userTokens || !username) {
      return NextResponse.json(
        { message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Проверяем, что пользователь активен
    const user = authData.users.find(
      (u: { username: string; isActive: boolean }) =>
        u.username === username && u.isActive
    );

    if (!user) {
      return NextResponse.json(
        { message: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Возвращаем новый access token
    return NextResponse.json({
      access_token: userTokens.access_token,
      expires_in: userTokens.expires_in,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
