# 🌊 Flare — Веб-сервис по продаже цифровых товаров

Дипломный проект по разработке современной e-commerce платформы для дистрибуции цифровых товаров (игр, игровых подписок, внутриигровой валюты, донатов и сопутствующих услуг), разработанный специально по заказу **ООО «Студия Олега Чулакова»**.

---

## 📌 Описание проекта

**Flare** — это масштабируемый веб-сервис с высокой производительностью, ориентированный на геймеров и любителей цифрового контента. Проект предоставляет пользователям возможность беспрепятственно приобретать ключи активации, оформлять подписки, пополнять балансы игровых платформ (таких как Steam, PlayStation Store, Xbox Live) и совершать донаты напрямую.

### Ключевой функционал:
*   **Каталог цифровых товаров:** Игры (Steam, Epic Games, GOG), подписки (PS Plus, Xbox Game Pass, Spotify) и внутриигровая валюта с фильтрацией по лаунчерам и жанрам.
*   **Личный кабинет и кошелек:** Просмотр истории заказов, управление балансом и купленными товарами.
*   **Интеграция платежной системы:** Безопасные онлайн-платежи через сервис Stripe с поддержкой подписок и мгновенным подтверждением через вебхуки.
*   **Авторизация и безопасность:** Гибкая система аутентификации с использованием NextAuth и Supabase.
*   **Панель администратора:** Полнофункциональный интерфейс для управления товарами, заказами, промокодами и пользователями.

---

## 🛠 Технологический стек

Проект реализован с использованием передовых технологий веб-разработки:

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=reacthookform&logoColor=white)](https://react-hook-form.com/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![NextAuth.js](https://img.shields.io/badge/NextAuth.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://next-auth.js.org/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)

---

## 📐 Архитектура: Feature-Sliced Design (FSD)

Проект спроектирован по методологии **Feature-Sliced Design**, что гарантирует строгую иерархию зависимостей, изоляцию модулей и масштабируемость кодовой базы.

```mermaid
graph TD
    App[app] --> Views[views]
    Views --> Widgets[widgets]
    Widgets --> Features[features]
    Features --> Entities[entities]
    Entities --> Shared[shared]
    
    style App fill:#f9f,stroke:#333,stroke-width:2px
    style Views fill:#bbf,stroke:#333,stroke-width:2px
    style Widgets fill:#dfd,stroke:#333,stroke-width:2px
    style Features fill:#fdd,stroke:#333,stroke-width:2px
    style Entities fill:#ffd,stroke:#333,stroke-width:2px
    style Shared fill:#ddd,stroke:#333,stroke-width:2px
```

### Разделение по слоям в структуре `src/`:

1.  **`app/`** — инициализация приложения, глобальные стили, сервис-провайдеры (QueryClientProvider, NextAuthProvider) и корневые роуты Next.js.
2.  **`views/`** — страницы приложения. Представляют собой композицию виджетов.
    *   *Примеры:* `home`, `games`, `subscriptions`, `profile`, `wallets`, `admin`, `steam-topup`, `faq`.
3.  **`widgets/`** — крупные самостоятельные блоки страниц (шапка, подвал, сайдбары).
    *   *Примеры:* `Header`, `Footer`, `NavigationBar`, `AdminHeader`, `AdminSidebar`.
4.  **`features/`** — интерактивные пользовательские действия, приносящие бизнес-ценность.
    *   *Примеры:* `auth` (регистрация и авторизация), `Payment` (оплата заказа), `Search` (поиск товаров).
5.  **`entities/`** — бизнес-сущности и модели данных. Содержат базовые компоненты UI, типы данных и методы API для работы с сущностью.
    *   *Примеры:* `game`, `product`, `order`, `user`, `wallet`, `promocode`, `service`, `admin`.
6.  **`shared/`** — переиспользуемый инфраструктурный код без привязки к бизнес-логике.
    *   *Содержимое:* Компоненты пользовательского интерфейса (кнопки, инпуты, модалки), общие хелперы, типы данных (`type-guards`), API-клиенты.

*Примечание: Импорты строго подчиняются правилу восходящего направления (модуль может импортировать только то, что находится ниже по списку).*

---

## 🚀 Быстрый старт

Для запуска проекта локально выполните следующие шаги:

### 1. Клонирование репозитория
```bash
git clone <URL_ВАШЕГО_РЕПОЗИТОРИЯ>
cd flare
```

### 2. Установка зависимостей
Проект поддерживает работу с менеджерами пакетов `npm` и `bun`. Для установки введите:
```bash
npm install
# или с использованием bun (рекомендуется)
bun install
```

### 3. Настройка переменных окружения
Создайте файл `.env` в корневом каталоге проекта на основе шаблона и заполните необходимые ключи:
```bash
cp .env.example .env
```

Подробное описание параметров конфигурации приведено в разделе **Переменные окружения**.

### 4. Генерация Prisma-клиента и применение миграций БД
Сгенерируйте клиент Prisma и примените схему базы данных PostgreSQL:
```bash
npx prisma generate
npx prisma db push
```

### 5. Запуск сервера разработки
```bash
npm run dev
# или с использованием bun
bun dev
```

Приложение будет доступно по адресу: [http://localhost:3000](http://localhost:3000).

---

## 🔑 Переменные окружения (`.env`)

Для корректной работы всех модулей платформы (базы данных, аутентификации и платежей) требуется настроить следующие ключи в файле `.env`:

### База данных (PostgreSQL / Prisma)
*   `DATABASE_URL`: Строка подключения к PostgreSQL с поддержкой пула соединений (Connection Pooling). Необходима для работы приложения в режиме реального времени.
*   `DIRECT_URL`: Прямая строка подключения к базе данных PostgreSQL (в обход пула). Необходима Prisma для выполнения миграций.

### Интеграция Supabase
*   `NEXT_PUBLIC_SUPABASE_URL`: Публичный URL-адрес вашего проекта Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Публичный анонимный API-ключ для инициализации клиента Supabase на стороне фронтенда.
*   `SUPABASE_SERVICE_ROLE_KEY`: Сервисный секретный ключ (Service Role API key) для бэкенда, позволяющий обходить политики RLS (Row Level Security) при административных действиях.

### Аутентификация (NextAuth)
*   `NEXTAUTH_URL`: Канонический базовый URL приложения (для локальной разработки: `http://localhost:3000`).
*   `NEXTAUTH_SECRET`: Секретная случайная строка, используемая NextAuth для шифрования JWT-токенов и сессий пользователей.

### Интеграция Stripe
*   `STRIPE_SECRET_KEY`: Приватный ключ API Stripe для выполнения запросов создания платежных сессий с сервера.
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Публичный ключ Stripe для рендеринга платежной формы на клиенте.
*   `STRIPE_WEBHOOK_SECRET`: Секрет подписи вебхуков Stripe для безопасной проверки статуса прохождения платежей.

---

## 🧪 Тестирование и проверка кода

В проекте настроена среда тестирования с использованием Jest:

*   **Запуск тестов:** `npm run test` (или `bun test`)
*   **Запуск тестов в режиме отслеживания изменений:** `npm run test:watch`
*   **Генерация отчета о покрытии тестами:** `npm run test:coverage`
*   **Проверка кода линтером:** `npm run lint`
