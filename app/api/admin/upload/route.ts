import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    // Проверяем авторизацию (только админы могут загружать файлы)
    const authHeader = request.headers.get("authorization");
    const validation = requireAdmin(authHeader);

    if (!validation.isValid) {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as File;

    if (!name || !description || !file) {
      return NextResponse.json(
        { message: "Missing required fields: name, description, file" },
        { status: 400 }
      );
    }

    // Читаем существующие коллекции
    const collectionsPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "collections.json"
    );
    const collections = JSON.parse(fs.readFileSync(collectionsPath, "utf8"));

    // Создаем новую коллекцию (в реальном приложении здесь бы обрабатывался GeoJSON файл)
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

    // В реальном приложении здесь бы также добавлялись features из GeoJSON файла
    // В моке просто возвращаем сообщение об успехе
    return NextResponse.json(
      {
        message: "File uploaded successfully",
        collection: newCollection,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
