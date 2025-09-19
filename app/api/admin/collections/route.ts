import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateToken } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    // Проверяем авторизацию
    const authHeader = request.headers.get("authorization");
    const validation = validateToken(authHeader);

    if (!validation.isValid) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Читаем моковые данные коллекций
    const collectionsPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "collections.json"
    );
    const collections = JSON.parse(fs.readFileSync(collectionsPath, "utf8"));

    return NextResponse.json(collections);
  } catch (error) {
    console.error("Collections error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию (только админы могут создавать коллекции)
    const authHeader = request.headers.get("authorization");
    const validation = validateToken(authHeader);

    if (!validation.isValid || validation.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const { name, description } = await request.json();

    // Читаем существующие коллекции
    const collectionsPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "collections.json"
    );
    const collections = JSON.parse(fs.readFileSync(collectionsPath, "utf8"));

    // Создаем новую коллекцию
    const newCollection = {
      id: Math.max(...collections.map((c: { id: number }) => c.id)) + 1,
      name,
      description,
      srid: 4326,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: validation.user?.id || 1,
    };

    collections.push(newCollection);

    // Сохраняем обновленные данные
    fs.writeFileSync(collectionsPath, JSON.stringify(collections, null, 2));

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error("Create collection error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
