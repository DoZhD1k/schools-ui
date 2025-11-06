# Настройка авторизации в проекте

## Обзор изменений

Токен авторизации теперь автоматически добавляется во все API запросы через axios interceptors.

## Как это работает

### 1. Автоматическое добавление токена

В файле `lib/axios.ts` настроен request interceptor, который:

- Автоматически добавляет токен из localStorage в заголовок `Authorization` для всех запросов
- Использует формат `Token <токен>` согласно API документации

```typescript
// Автоматически добавляем токен из localStorage если он не установлен в headers
if (typeof window !== "undefined" && !config.headers.Authorization) {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
}
```

### 2. Обновленные сервисы

Следующие сервисы обновлены для использования настроенного axios instance:

- `services/admin-api.service.ts` - убраны ручные заголовки авторизации
- `services/real-api.service.ts` - переведен с fetch на axios
- `services/user-management.service.ts` - уже использовал правильную настройку

### 3. Сервисы, которые остались на fetch

Некоторые сервисы остались на fetch по следующим причинам:

- `services/auth.service.ts` - для начальной авторизации (токен еще не получен)
- `services/school-rating-api.service.ts` - использует Next.js API routes (`/api/*`)

## Использование в новых сервисах

### Для внешних API (защищенных)

```typescript
import { api } from "@/lib/axios";

class MyApiService {
  async getData() {
    // Токен добавится автоматически
    const response = await api.get("/api/v1/data/");
    return response.data;
  }

  async postData(data: any) {
    // Токен добавится автоматически
    const response = await api.post("/api/v1/data/", data);
    return response.data;
  }
}
```

### Для Next.js API routes

```typescript
class LocalApiService {
  async getData() {
    // Используем fetch с ручным добавлением токена
    const token = localStorage.getItem("accessToken");
    const response = await fetch("/api/local-endpoint", {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.json();
  }
}
```

## Обработка ошибок

Настроен response interceptor для автоматической обработки 401 ошибок:

- Автоматически пытается обновить токен
- При неудаче перенаправляет на страницу входа

## Важные моменты

1. **Токен хранится в localStorage** под ключом `accessToken`
2. **Формат токена**: `Token <значение>` (не Bearer)
3. **Автоматическое обновление токена** через `/api/refresh-token`
4. **Защита от циклических запросов** при обновлении токена

## Тестирование

Для проверки работы авторизации:

1. Войдите в систему через страницу авторизации
2. Проверьте, что токен сохранился в localStorage
3. Выполните любой API запрос через dev tools - заголовок Authorization должен добавиться автоматически
4. При истечении токена должно произойти автоматическое обновление

## Поддержка

При возникновении проблем с авторизацией проверьте:

- Наличие токена в localStorage
- Формат токена в заголовках запросов
- Корректность базового URL API
- Логи в консоли браузера для ошибок interceptors
