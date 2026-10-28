# راهنمای توسعهٔ فرانت‌اند

مرجع مشترک ساخت فیچرها: [راهنمای توسعهٔ فیچر](feature-development.md).

- [ساختار فایل‌ها و جریان واقعی Auth](../src/features/auth/docs/README.md)
- [گزارش بررسی و محدودیت‌های Auth](../src/features/auth/docs/review.md)
- [سند معماری قبلی پروژه](frontend-architecture.md)

راهنمای توسعه الگوی نوشتن فیچر جدید است؛ مستندات Auth شرح کد همان برنچ و نسخهٔ بررسی‌شده‌اند. برای وضعیت فعلی هر فیچر، کد و مستند همان فیچر را نیز بررسی کنید.

## دسترسی مستقل از برنچ کاری

مرجع آنلاین، برنچ اختصاصی `docs/feature-guide` است:

[راهنمای مشترک در GitHub](https://github.com/nima-toghraee/iranmobix/blob/docs/feature-guide/docs/feature-development.md)

در محیط فعلی، worktree مستندات داخل `.project-docs` قرار دارد. این پوشه checkout جداگانه‌ای از برنچ مستندات است؛ تغییر برنچ اصلی پروژه محتوای آن را تغییر نمی‌دهد. sparse checkout فقط مسیرهای مستندات را دریافت می‌کند تا نسخهٔ دوم فایل‌های اجرایی وارد پروژه نشود.

مسیر همیشگی راهنما در این محیط:

```text
.project-docs/docs/feature-development.md
```

این پوشه با قاعدهٔ محلی `/.project-docs/` در `.git/info/exclude` از stage شدن تصادفی در برنچ‌های کاری کنار گذاشته شده است. خود فایل‌های مستند همچنان در Git و GitHub نسخه‌بندی می‌شوند؛ فقط پوشهٔ checkout دوم وارد commit برنچ اصلی نمی‌شود.

### راه‌اندازی در clone تازه

دستورهای زیر را از ریشهٔ مخزن و فقط وقتی برنچ محلی و پوشهٔ .project-docs هنوز وجود ندارند اجرا کنید:

```powershell
git fetch origin docs/feature-guide
Add-Content -LiteralPath (git rev-parse --git-path info/exclude) -Value '/.project-docs/'
git worktree add --no-checkout -b docs/feature-guide .project-docs origin/docs/feature-guide
git -C .project-docs sparse-checkout set --no-cone '/docs/' '/src/features/auth/docs/'
git -C .project-docs checkout
```

اگر برنچ محلی از قبل وجود دارد، در فرمان worktree از `git worktree add --no-checkout .project-docs docs/feature-guide` استفاده کنید. اگر پوشه از قبل موجود است، ابتدا `git worktree list` را بررسی کنید؛ فایل‌های آن را پاک یا overwrite نکنید.

### دریافت آخرین نسخه

از هر برنچ کاری، وقتی worktree مستندات تغییر ذخیره‌نشده ندارد:

```bash
git -C .project-docs pull --ff-only
```

### اصلاح راهنمای مشترک

راهنمای عمومی را در `.project-docs/docs/feature-development.md` اصلاح کنید و تغییرات همان worktree را روی `docs/feature-guide` کامیت و پوش کنید. تغییر فایل مستند در برنچ کاری به‌طور خودکار به برنچ مستندات منتقل نمی‌شود.

```bash
git -C .project-docs status
git -C .project-docs add -- docs/feature-development.md
git -C .project-docs commit -m "docs: update feature development guide"
git -C .project-docs push origin docs/feature-guide
```

اگر بخواهید نسخهٔ جدید راهنما در فایل‌های یک برنچ کاری هم باشد، کامیت صرفاً مستنداتی مربوط را به همان برنچ منتقل کنید. برای استفادهٔ روزمره، پوشهٔ ثابت یا لینک GitHub کافی است؛ نیازی به مرج کد فیچرهای دیگر ندارید.
