import fs from "fs";
import path from "path";

export interface TokenValidationResult {
  isValid: boolean;
  user?: {
    id: number;
    username: string;
    role: string;
    email: string;
  };
  role?: string;
}

export function validateToken(
  authHeader: string | null
): TokenValidationResult {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { isValid: false };
  }

  const token = authHeader.substring(7);

  try {
    const authDataPath = path.join(
      process.cwd(),
      "sample",
      "mock",
      "auth.json"
    );
    const authData = JSON.parse(fs.readFileSync(authDataPath, "utf8"));

    // Проверяем, существует ли такой токен и получаем пользователя
    for (const [username, tokens] of Object.entries(authData.tokens)) {
      const tokenData = tokens as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
        role: string;
      };
      if (tokenData.access_token === token) {
        // Находим пользователя
        const user = authData.users.find(
          (u: {
            username: string;
            isActive: boolean;
            id: number;
            role: string;
            email: string;
          }) => u.username === username && u.isActive
        );

        if (user) {
          return {
            isValid: true,
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
              email: user.email,
            },
            role: user.role,
          };
        }
      }
    }

    return { isValid: false };
  } catch (error) {
    console.error("Token validation error:", error);
    return { isValid: false };
  }
}

export function requireAdmin(authHeader: string | null): TokenValidationResult {
  const validation = validateToken(authHeader);

  if (!validation.isValid || validation.role !== "admin") {
    return { isValid: false };
  }

  return validation;
}
