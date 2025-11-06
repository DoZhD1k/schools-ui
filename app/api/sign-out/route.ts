import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из заголовка
    const authHeader = request.headers.get("authorization");
    let token = null;

    if (authHeader && authHeader.startsWith("Token ")) {
      token = authHeader.substring(6);
    }

    if (token) {
      // Уведомляем сервер о выходе (если есть такой endpoint)
      await authService.logout(token);
    }

    // Создаем ответ и очищаем cookies
    const response = NextResponse.json({ message: "Successfully logged out" });

    // Удаляем auth cookie
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Удаляем cookie
    });

    // Также удаляем старый refresh_token cookie на всякий случай
    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("❌ Sign out error:", error);
    return NextResponse.json(
      { message: "Logout completed" }, // Возвращаем успех даже при ошибке
      { status: 200 }
    );
  }
}
