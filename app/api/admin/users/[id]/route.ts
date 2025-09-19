import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем авторизацию (только админы могут управлять пользователями)
    const authHeader = request.headers.get("authorization");
    const validation = requireAdmin(authHeader);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const userId = parseInt(params.id);
    const { action } = await request.json(); // "activate" или "deactivate"

    // Читаем данные пользователей
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Находим пользователя
    const userIndex = authData.users.findIndex(
      (u: { id: number }) => u.id === userId
    );

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Обновляем статус пользователя
    if (action === "activate") {
      authData.users[userIndex].isActive = true;
    } else if (action === "deactivate") {
      authData.users[userIndex].isActive = false;
    } else {
      return NextResponse.json(
        { message: 'Invalid action. Use "activate" or "deactivate"' },
        { status: 400 }
      );
    }

    // Сохраняем обновленные данные
    fs.writeFileSync(authDataPath, JSON.stringify(authData, null, 2));

    // Возвращаем обновленного пользователя без пароля
    const updatedUser = authData.users[userIndex];
    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      isActive: updatedUser.isActive,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем авторизацию (только админы могут удалять пользователей)
    const authHeader = request.headers.get("authorization");
    const validation = requireAdmin(authHeader);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const userId = parseInt(params.id);

    // Читаем данные пользователей
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Находим пользователя
    const userIndex = authData.users.findIndex(
      (u: { id: number }) => u.id === userId
    );

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Получаем имя пользователя для удаления токенов
    const username = authData.users[userIndex].username;

    // Удаляем пользователя и его токены
    authData.users.splice(userIndex, 1);
    delete authData.tokens[username];

    // Сохраняем обновленные данные
    fs.writeFileSync(authDataPath, JSON.stringify(authData, null, 2));

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
