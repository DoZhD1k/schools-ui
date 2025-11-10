import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    // Получаем токен из cookies или из заголовка Authorization
    let token = request.cookies.get("auth_token")?.value;

    if (!token) {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Token ")) {
        token = authHeader.substring(6);
      }
    }

    if (!token) {
      return NextResponse.json({ message: "Токен не найден" }, { status: 401 });
    }

    console.log("🔄 Verifying token...");

    // Проверяем действительность токена через реальный API
    const result = await authService.verifyToken(token);

    if (!result.success) {
      console.error("❌ Token verification failed:", result.error);
      return NextResponse.json(
        { message: result.error || "Токен недействителен" },
        { status: 401 }
      );
    }

    console.log("✅ Token is valid for user:", result.data!.email);

    // Возвращаем существующий токен и данные пользователя
    // В реальном API обычно токены имеют длительный срок действия
    // или есть отдельный механизм refresh tokens
    return NextResponse.json({
      access_token: token,
      user: result.data,
      expires_in: 24 * 60 * 60, // 24 часа в секундах
    });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    return NextResponse.json({ message: "Ошибка сервера" }, { status: 500 });
  }
}
