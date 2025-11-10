# 🚀 Деплой проекта Schools UI

## 📋 Переменные окружения для Vercel

Для корректной работы на продакшене необходимо настроить следующие переменные окружения в панели Vercel:

### 🔧 Обязательные переменные

```bash
# API URLs
NEXT_PUBLIC_SCHOOL_RATING_API_URL=https://admin.smartalmaty.kz/api/v1/institutions-monitoring
NEXT_PUBLIC_AUTH_API_URL=https://admin.smartalmaty.kz/api/v1/institutions-monitoring
NEXT_PUBLIC_API_URL=https://admin.smartalmaty.kz
NEXT_PUBLIC_POLYGONS_API_URL=https://admin.smartalmaty.kz

# Mapbox Token
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

### 🎭 Режимы авторизации

#### Для production с реальным API:

```bash
NEXT_PUBLIC_USE_MOCK_AUTH=false
NEXT_PUBLIC_FORCE_MOCK_AUTH=false
```

#### Для staging/demo с mock авторизацией:

```bash
NEXT_PUBLIC_USE_MOCK_AUTH=true
NEXT_PUBLIC_FORCE_MOCK_AUTH=true
```

## 🔐 Тестовые учетные данные

Если используется mock режим, доступны следующие аккаунты:

| Email               | Password      | Роль          |
| ------------------- | ------------- | ------------- |
| `admin@test.com`    | `admin123456` | Администратор |
| `admin@test.com`    | `password123` | Администратор |
| `school_a@test.com` | `user123`     | Пользователь  |

## ⚡ Быстрое решение проблем

### Проблема: 401 Unauthorized на проде

**Решение**: Установите `NEXT_PUBLIC_FORCE_MOCK_AUTH=true` в Vercel

### Проблема: Долгие timeouts (40+ секунд)

**Причина**: Реальный API недоступен или медленный  
**Решение**:

1. Проверьте доступность `admin.smartalmaty.kz`
2. Или включите mock режим

### Проблема: Ошибки сборки

**Проверьте**:

- Все переменные окружения установлены
- Mapbox токен валидный
- API URL корректные

## 📝 Как настроить в Vercel

1. Откройте проект в Vercel Dashboard
2. Перейдите в `Settings` → `Environment Variables`
3. Добавьте все переменные выше
4. Сделайте redeploy

## 🚨 Важные моменты

- **Mock режим** автоматически включается для `@test.com` аккаунтов
- **Timeout** для API запросов установлен в 10 секунд
- При недоступности реального API происходит fallback на mock для тестовых аккаунтов
- В production использовать только реальные учетные данные API

## 🛠 Разработка

Для локальной разработки создайте `.env.local`:

```bash
# Копируйте переменные из файла выше
NEXT_PUBLIC_USE_MOCK_AUTH=false
# Остальные переменные...
```

---

✨ После настройки переменных окружения приложение должно работать стабильно как в dev, так и в production режиме.
