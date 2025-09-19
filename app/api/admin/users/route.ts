import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию (только админы могут видеть пользователей)
    const authHeader = request.headers.get("authorization");
    const validation = requireAdmin(authHeader);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    // Читаем моковые данные пользователей
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Возвращаем пользователей без паролей
    const users = authData.users.map(
      (user: {
        id: number;
        username: string;
        email: string;
        role: string;
        isActive: boolean;
      }) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      })
    );

    return NextResponse.json(users);
  } catch (error) {
    console.error("Users error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию (только админы могут создавать пользователей)
    const authHeader = request.headers.get("authorization");
    const validation = requireAdmin(authHeader);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const { username, email, password, role } = await request.json();

    // Читаем существующие данные
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Проверяем, не существует ли уже пользователь с таким именем
    const existingUser = authData.users.find(
      (u: { username: string }) => u.username === username
    );
    if (existingUser) {
      return NextResponse.json(
        { message: "User with this username already exists" },
        { status: 409 }
      );
    }

    // Создаем нового пользователя
    const newUser = {
      id: Math.max(...authData.users.map((u: { id: number }) => u.id)) + 1,
      username,
      email,
      password, // В реальном приложении нужно хэшировать
      role,
      isActive: true,
    };

    authData.users.push(newUser);

    // Создаем токены для нового пользователя
    authData.tokens[username] = {
      access_token: `mock_${username}_token_${Date.now()}`,
      refresh_token: `mock_${username}_refresh_${Date.now()}`,
      expires_in: 3600,
      role,
    };

    // Сохраняем обновленные данные
    fs.writeFileSync(authDataPath, JSON.stringify(authData, null, 2));

    // Возвращаем пользователя без пароля
    return NextResponse.json(
      {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
