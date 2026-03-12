// If you're using a public token for development (not recommended for production)
export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

// Other constants
export const DEFAULT_CENTER = [37.6173, 55.7558]; // Default map center (Moscow)
export const DEFAULT_ZOOM = 10; // Default zoom level

// Base path для продакшена
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/module-school-ranking";

// Утилита для получения basePath на клиенте
export const getBasePath = (): string => {
  if (typeof window === "undefined") {
    return BASE_PATH;
  }
  
  // Проверяем, есть ли basePath в пути
  const pathname = window.location.pathname;
  if (pathname.startsWith(BASE_PATH)) {
    return BASE_PATH;
  }
  
  return "";
};

// Утилита для извлечения локали из пути
export const getLocaleFromPath = (pathname: string): string => {
  const basePath = getBasePath();
  const pathWithoutBase = basePath ? pathname.replace(basePath, "") : pathname;
  const segments = pathWithoutBase.split("/").filter(Boolean);
  return segments[0] || "ru";
};

// Утилита для формирования пути с учетом basePath
export const buildPath = (path: string): string => {
  const basePath = getBasePath();
  // Убираем ведущий слэш если есть
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return basePath ? `${basePath}${cleanPath}` : cleanPath;
};
