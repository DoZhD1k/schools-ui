import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log("🔐 Sign-in attempt for:", email);

    // Используем реальный API для авторизации
    const result = await authService.login({ email, password });

    if (!result.success) {
      console.error("❌ Authentication failed:", result.error);
      return NextResponse.json(
        { error: result.error || "Неверные учетные данные" },
        { status: 401 }
      );
    }

    console.log(
      "✅ Authentication successful for user:",
      result.data!.user.email
    );

    // Создаем ответ с токеном
    const response = NextResponse.json({
      token: result.data!.token,
      user: result.data!.user,
    });

    // Сохраняем токен в httpOnly cookie для дополнительной безопасности
    response.cookies.set("auth_token", result.data!.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 часа
    });

    return response;
  } catch (error) {
    console.error("❌ Sign in error:", error);
    return NextResponse.json(
      { error: "Ошибка сервера. Попробуйте позже." },
      { status: 500 }
    );
  }
}
