import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { validateToken } from "@/lib/auth-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Проверяем авторизацию (только админы могут обновлять features)
    const authHeader = request.headers.get("authorization");
    const validation = validateToken(authHeader);

    if (!validation.isValid || validation.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const featureId = parseInt(params.id);
    const { properties, geometry } = await request.json();

    // Читаем геоданные
    const geoDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "geo-data.json"
    );
    const geoData = JSON.parse(fs.readFileSync(geoDataPath, "utf8"));

    // Находим feature
    const featureIndex = geoData.findIndex(
      (f: { id: number }) => f.id === featureId
    );

    if (featureIndex === -1) {
      return NextResponse.json(
        { message: "Feature not found" },
        { status: 404 }
      );
    }

    // Обновляем feature
    if (properties) {
      geoData[featureIndex].properties = {
        ...geoData[featureIndex].properties,
        ...properties,
      };
    }

    if (geometry) {
      geoData[featureIndex].geometry = geometry;
    }

    geoData[featureIndex].updated_at = new Date().toISOString();

    // Сохраняем обновленные данные
    fs.writeFileSync(geoDataPath, JSON.stringify(geoData, null, 2));

    return NextResponse.json(geoData[featureIndex]);
  } catch (error) {
    console.error("Update feature error:", error);
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
    // Проверяем авторизацию (только админы могут удалять features)
    const authHeader = request.headers.get("authorization");
    const validation = validateToken(authHeader);

    if (!validation.isValid || validation.role !== "admin") {
      return NextResponse.json(
        { message: "Admin access required" },
        { status: 403 }
      );
    }

    const featureId = parseInt(params.id);

    // Читаем геоданные
    const geoDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "geo-data.json"
    );
    const geoData = JSON.parse(fs.readFileSync(geoDataPath, "utf8"));

    // Находим feature
    const featureIndex = geoData.findIndex(
      (f: { id: number }) => f.id === featureId
    );

    if (featureIndex === -1) {
      return NextResponse.json(
        { message: "Feature not found" },
        { status: 404 }
      );
    }

    // Удаляем feature
    geoData.splice(featureIndex, 1);

    // Сохраняем обновленные данные
    fs.writeFileSync(geoDataPath, JSON.stringify(geoData, null, 2));

    return NextResponse.json({ message: "Feature deleted successfully" });
  } catch (error) {
    console.error("Delete feature error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
