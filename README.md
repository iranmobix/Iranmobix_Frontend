> راهنمای توسعه: [ساخت فیچر و دسترسی به مستندات از همهٔ برنچ‌ها](docs/README.md)

<div dir="rtl">

# ایران موبیکس — فرانت‌اند

پلتفرم یکپارچه واردات از چین و امارات. ایران موبیکس خدمات حمل‌ونقل، ترخیص گمرکی، حواله ارزی و ثبت سفارش را در یک رابط کاربری فارسی و RTL ارائه می‌دهد.

## تکنولوژی‌های مورد استفاده

| حوزه        | ابزار                    |
| ----------- | ------------------------ |
| فریم‌ورک    | Next.js 16 (App Router)  |
| استایلینگ   | Tailwind CSS 4           |
| کامپوننت    | ShadCN UI                |
| مدیریت حالت | Zustand                  |
| فرم         | React Hook Form + Zod    |
| فونت        | Vazirmatn / Readex Pro   |
| آیکون       | Lucide React + Remixicon |
| انیمیشن     | anime.js v4              |
| تم          | next-themes              |
| زبان        | TypeScript               |
| زیرساخت     | Docker                   |

## پیش‌نیازها

- Node.js نسخه ۱۸ یا بالاتر
- npm / yarn / pnpm / bun

## نصب

```bash
git clone https://github.com/your-org/iranmobix_frontend.git
cd iranmobix_frontend
npm install
```

## اجرا

```bash
# محیط توسعه
npm run dev

# بیلد پروداکشن
npm run build
npm start

# لینت
npm run lint
```

پس از اجرا، پروژه روی [http://localhost:3000](http://localhost:3000) در دسترس است.

## ساختار پروژه

```
src/
├── app/            # فقط layout و page — بدون منطق
├── features/       # منطق هر بخش (auth, orders, tracking, ...)
├── components/     # کامپوننت‌های مشترک (layout, shared)
├── store/          # Zustand global stores
├── hooks/          # Custom hooks مشترک
├── lib/            # API client و utilities
└── types/          # TypeScript types مشترک
```

</div>

---

# IranMobix — Frontend

A unified import platform from China and UAE. IranMobix provides freight, customs clearance, currency remittance, and order management services through a Persian (Farsi) RTL interface.

## Tech Stack

| Area           | Tool                     |
| -------------- | ------------------------ |
| Framework      | Next.js 16 (App Router)  |
| Styling        | Tailwind CSS 4           |
| Components     | ShadCN UI                |
| State          | Zustand                  |
| Forms          | React Hook Form + Zod    |
| Fonts          | Vazirmatn / Readex Pro   |
| Icons          | Lucide React + Remixicon |
| Animation      | anime.js v4              |
| Theming        | next-themes              |
| Language       | TypeScript               |
| Infrastructure | Docker                   |

## Prerequisites

- Node.js 18 or higher
- npm / yarn / pnpm / bun

## Installation

```bash
git clone https://github.com/your-org/iranmobix_frontend.git
cd iranmobix_frontend
npm install
```

## Running

```bash
# Development server
npm run dev

# Production build
npm run build
npm start

# Lint
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/            # Layouts and pages only — no business logic
├── features/       # Feature-scoped modules (auth, orders, tracking, ...)
├── components/     # Shared components (layout, shared UI)
├── store/          # Zustand global stores
├── hooks/          # Shared custom hooks
├── lib/            # API base client and utilities
└── types/          # Shared TypeScript types
```
