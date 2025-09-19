import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Читаем моковые данные пользователей
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Находим пользователя
    const user = authData.users.find(
      (u: {
        username: string;
        password: string;
        isActive: boolean;
        id: number;
        role: string;
        email: string;
      }) => u.username === username && u.password === password && u.isActive
    );

    if (!user) {
      return NextResponse.json(
        { message: "Invalid credentials or user is inactive" },
        { status: 401 }
      );
    }

    // Получаем токены для пользователя
    const tokens = authData.tokens[username];

    if (!tokens) {
      return NextResponse.json(
        { message: "Authentication tokens not found" },
        { status: 500 }
      );
    }

    // Создаем ответ с токенами
    const response = NextResponse.json({
      token: tokens.access_token,
      expires_in: tokens.expires_in,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email,
      },
    });

    // Устанавливаем refresh token в httpOnly cookie
    response.cookies.set("refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 дней
    });

    return response;
  } catch (error) {
    console.error("Sign in error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
