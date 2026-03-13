# MotorBay

Очищенная версия проекта без `.next`, `node_modules` и реальных секретов.

## Запуск

1. Скопируйте `.env.example` в `.env`
2. Заполните `DATABASE_URL` и `AUTH_SECRET`
3. Выполните:
   - `npm install`
   - `npx prisma generate`
   - `npx prisma migrate dev`
   - `npm run dev`

## Что очищено

- удалены `.next`, `node_modules`, реальный `.env`
- убраны дублирующиеся страницы и старые обработчики
- унифицированы login/register/admin маршруты
- исправлена работа auth и Prisma под `passwordHash`


## Быстрый запуск

1. Скопируй `.env.example` в `.env`
2. Заполни `DATABASE_URL`
3. Выполни:

```bash
npm install
npx prisma generate
npm run dev
```

Если не указать `AUTH_SECRET`, в режиме разработки будет использован временный secret, чтобы проект не падал сразу. Но для нормальной работы лучше всё равно добавить свой `AUTH_SECRET` в `.env`.
