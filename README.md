# اطلاع‌رسان خاموشی برق

[![Docker Publish](https://github.com/yjavaherian/blackouts/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/yjavaherian/blackouts/actions/workflows/docker-publish.yml)

یک برنامه وب ساده و خودمیزبان برای نظارت بر خاموشی‌های برنامه‌ریزی شده برق در هر نقطه از ایران، با استفاده از داده‌های سرویس رسمی "برق‌من". این ابزار به شما کمک می‌کند تا با ارائه رابطی تمیز، سریع و کاربرپسند برای مشاهده قطعی‌های برنامه‌ریزی شده برق، همیشه مطلع باشید.

![Screenshot](screenshot.png)

## ویژگی‌ها

- **پشتیبانی از چندین مکان:** پیگیری خاموشی‌های برنامه‌ریزی شده برای چندین مکان (مثل خانه، محل کار) در یک مکان.
- **به‌روزرسانی خودکار داده:** داده‌های خاموشی هر ۲۴ ساعت به‌طور خودکار به‌روزرسانی می‌شود تا همیشه جدیدترین اطلاعات را داشته باشید.
- **به‌روزرسانی دستی:** گزینه به‌روزرسانی دستی برای دریافت جدیدترین داده‌ها در صورت نیاز موجود است.
- **رابط کاربری تمیز و واکنش‌گرا:** رابطی مدرن و سازگار با موبایل که با SvelteKit و Tailwind CSS ساخته شده است.
- **استقرار آسان:** کل برنامه را به عنوان یک کانتینر Docker واحد مستقر کنید.
- **متن‌باز:** پروژه کاملاً متن‌باز است و آماده مشارکت جامعه است.

## شروع: استقرار با Docker

ساده‌ترین راه برای اجرای این برنامه استفاده از تصاویر Docker از پیش ساخته شده از GitHub Container Registry است.

### پیش‌نیازها

- [Docker](https://docs.docker.com/get-docker/) و [Docker Compose](https://docs.docker.com/compose/install/) روی سرور شما نصب شده باشد.

### ۱. ایجاد فایل `compose.yml`

فایلی به نام `compose.yml` با محتوای زیر ایجاد کنید.

```yml
services:
  app:
    image: ghcr.io/yjavaherian/blackouts:main
    ports:
      - '127.0.0.1:3000:3000'
    volumes:
      - data:/app/data
    environment:
      - AUTH_TOKEN="your_actual_auth_token_here" # آن را با بررسی ترافیک شبکه در https://bargheman.com/profile/blackout/my-blackouts دریافت کنید
      - DATABASE_URL=/app/data/sqlite.db
      - ORIGIN=http://localhost:3000
    restart: unless-stopped

volumes:
  data:
```

### ۲. اجرای برنامه

برنامه را با استفاده از Docker Compose شروع کنید:

```bash
docker compose up -d
```

اطلاع‌رسان خاموشی شخصی شما اکنون در حال اجرا است و در `http://localhost:3000` قابل دسترسی است.

## توسعه محلی

علاقه‌مند به مشارکت هستید؟ اینجا نحوه اجرای پروژه روی ماشین محلی شما آمده است.

### پیش‌نیازها

- [Node.js](https://nodejs.org/) (نسخه ۲۲ یا جدیدتر)
- [pnpm](https://pnpm.io/installation)

### ۱. کلون کردن مخزن

```bash
git clone https://github.com/yjavaherian/blackouts.git
cd blackouts
```

### ۲. نصب وابستگی‌ها

```bash
pnpm install
```

### ۳. تنظیم متغیرهای محیطی

فایل محیطی نمونه را کپی کنید:

```bash
cp .env.example .env
```

حالا فایل `.env` را ویرایش کنید و `AUTH_TOKEN` خود را اضافه کنید.

### ۴. اجرای سرور توسعه

پایگاه داده هنگام اولین اجرای برنامه به‌طور خودکار ایجاد و پیکربندی می‌شود.

```bash
pnpm dev
```

برنامه در `http://localhost:5173` قابل دسترسی خواهد بود.

## LICENSE

این پروژه تحت مجوز MIT مجوز دارد. برای جزئیات به فایل [LICENSE](LICENSE) مراجعه کنید.
