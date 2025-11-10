# Исправление проблем с авторизацией API

## Проблема

Некоторые API запросы возвращали 403 ошибки на страницах рейтинга школ, организаций и карты, потому что не все сервисы передавали токен авторизации.

## Исправления

### Переведены на axios с автоматическим токеном:

1. **`services/schools-map.service.ts`**

   - ✅ Переведен с `fetch` на `api` (axios)
   - ✅ Автоматическое добавление токена через interceptor
   - 🎯 Используется на карте школ

2. **`services/district-polygons.service.ts`**

   - ✅ Переведен с `fetch` на `api` (axios)
   - ✅ Автоматическое добавление токена через interceptor
   - 🎯 Используется для отображения районов на карте

3. **`services/dashboard.service.ts`**

   - ✅ Переведен с `fetch` на `api` (axios)
   - ✅ Автоматическое добавление токена через interceptor
   - 🎯 Используется на дашборде

4. **`services/balance-enriched.service.ts`**

   - ✅ Переведен с `fetch` на `api` (axios)
   - ✅ Автоматическое добавление токена через interceptor
   - 🎯 Используется для данных о районах

5. **`components/schools/rating/schools-table.tsx`**
   - ✅ Переведен с `fetch` на `api` (axios)
   - ✅ Автоматическое добавление токена через interceptor
   - 🎯 Используется в таблице рейтинга школ

### Обновлены для ручного добавления токена:

6. **`services/polygons.service.ts`**
   - ✅ Добавлено ручное получение токена из localStorage
   - 🎯 Используется Next.js API route (`/api/v1/...`)

### Уже были правильно настроены:

- `services/admin-api.service.ts` ✅
- `services/real-api.service.ts` ✅
- `services/user-management.service.ts` ✅
- `services/users.service.ts` ✅ (использует токен в параметрах)
- `services/features.service.ts` ✅ (использует токен в параметрах)
- `services/collections.service.ts` ✅ (использует токен в параметрах)

### Правильно остались на fetch:

- `services/auth.service.ts` ✅ (для начальной авторизации)
- `services/school-rating-api.service.ts` ✅ (Next.js API routes)

## Результат

Теперь все внешние API запросы к `https://admin.smartalmaty.kz/api/v1/institutions-monitoring/` автоматически включают токен авторизации в формате `Token <значение>`.

### Проверка

Для проверки того, что токен передается:

1. Откройте DevTools → Network
2. Перейдите на страницу карты или рейтинга школ
3. Найдите запросы к `admin.smartalmaty.kz`
4. Проверьте заголовок `Authorization: Token <ваш_токен>`

### Если все еще получаете 403:

1. Проверьте, что токен существует в localStorage (`accessToken`)
2. Убедитесь, что токен действителен (не истек)
3. Проверьте, что пользователь имеет права доступа к конкретному endpoint'у
4. Проверьте консоль браузера на наличие ошибок

## Технические детали

- Все прямые `fetch` вызовы к external API заменены на `api` (настроенный axios instance)
- Next.js API routes остались на `fetch` с ручным добавлением токена
- Токен добавляется автоматически через request interceptor в `lib/axios.ts`
