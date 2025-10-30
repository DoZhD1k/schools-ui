import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Читаем моковые данные пользователей
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Находим пользователя по email
    const user = authData.users.find(
      (u: {
        username: string;
        password: string;
        isActive: boolean;
        id: number;
        role: string;
        email: string;
      }) => u.email === email && u.password === password && u.isActive
    );

    if (!user) {
      return NextResponse.json(
        { error: "Неверные учетные данные" }, // Формат согласно API документации
        { status: 401 }
      );
    }

    // Получаем токены для пользователя
    const tokens = authData.tokens[user.username];

    if (!tokens) {
      return NextResponse.json(
        { error: "Authentication tokens not found" },
        { status: 500 }
      );
    }

    // Сохраняем роль пользователя в localStorage будет сделано на клиенте
    // Создаем ответ в формате согласно API документации
    const response = NextResponse.json({
      token: tokens.access_token, // Возвращаем простой токен, не JWT
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
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
