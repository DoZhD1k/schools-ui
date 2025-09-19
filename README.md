# Schools UI - Интерактивная карта школ Алматы

Это [Next.js](https://nextjs.org) проект для отображения школ Алматы на интерактивной карте с подробной информацией и системой фильтрации.

## Возможности

- 🗺️ **Интерактивная карта** с данными о 392 школах Алматы
- 🔍 **Расширенная фильтрация** по типу, району, рейтингу и загруженности
- 📊 **Статистика в реальном времени** с визуализацией данных
- 🏫 **Подробная информация** о каждой школе в всплывающих окнах
- 🔐 **Админ-панель** для управления пользователями и ролями
- 🌐 **Мультиязычность** (русский, казахский, английский)

## Настройка проекта

### 1. Установка зависимостей

```bash
npm install
# или
yarn install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local` и настройте переменные:

```bash
cp .env.example .env.local
```

**Обязательные переменные:**

```env
# Токен Mapbox (получите на https://account.mapbox.com/)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_mapbox_token_here

# URL API для данных о школах
NEXT_PUBLIC_API_BASE_URL=https://admin.smartalmaty.kz/api/v1

# URL приложения
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Получение токена Mapbox

1. Зарегистрируйтесь на [mapbox.com](https://account.mapbox.com/)
2. Создайте новый токен доступа
3. Добавьте токен в файл `.env.local`

## Запуск проекта

```bash
npm run dev
# или
yarn dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Структура проекта

```tree
├── app/[lang]/(routes)/
│   ├── map/                 # Страница карты школ
│   └── admin/               # Админ-панель
├── components/
│   ├── map/                 # Компоненты карты
│   ├── admin/               # Компоненты админки
│   └── ui/                  # Базовые UI компоненты
├── hooks/
│   └── useSchoolsMap.ts     # Хук для управления картой
├── services/
│   └── schools-map.service.ts # Сервис для работы с API
├── types/
│   └── schools-map.ts       # TypeScript типы
└── dictionaries/            # Файлы локализации
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
