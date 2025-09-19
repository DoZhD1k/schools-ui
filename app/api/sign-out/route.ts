import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Очищаем refresh token cookie
    const response = NextResponse.json({ message: "Signed out successfully" });

    response.cookies.set("refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // Удаляем cookie
    });

    return response;
  } catch (error) {
    console.error("Sign out error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
