# 🌿 دليل النشر المتكامل لمنصة "إتقان" (Itqan Quran Platform)
**النطاق المخصص:** `itqan.gizawysystems.com`  
**الخادم:** DigitalOcean Droplet (Ubuntu 24.04 / 22.04)  
**قاعدة البيانات:** DigitalOcean Managed PostgreSQL Database  
**إدارة الـ DNS والحماية:** Cloudflare  

---

## 📌 الخطوة الأولى: الرفع إلى مستودع GitHub

قم بتشغيل الأوامر التالية على جهازك أو في بيئة العمل لرفع المشروع إلى مستودعك الخاص في GitHub:

```bash
# 1. تهيئة مستودع Git
git init

# 2. إضافة كافة الملفات
git add .

# 3. حفظ التعديلات (Commit)
git commit -m "feat: complete itqan quran platform with postgresql schema and deployment configs"

# 4. تغيير اسم الفرع للرئيسي
git branch -M main

# 5. ربط المستودع برابط GitHub الخاص بك (استبدل YOUR_USERNAME و YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/itqan-quran-platform.git

# 6. الرفع إلى GitHub
git push -u origin main
```

---

## 📌 الخطوة الثانية: ضبط الـ Subdomain في لوحة Cloudflare

1. افتح حسابك في **[Cloudflare Dashboard](https://dash.cloudflare.com)** واختر نطاقك: `gizawysystems.com`.
2. توجه إلى تبويب **DNS** ➔ **Records** ثم اضغط **Add record**.
3. قم بإدخال البيانات التالية:
   - **Type:** `A`
   - **Name:** `itqan` *(ليصبح النطاق: itqan.gizawysystems.com)*
   - **IPv4 address:** ضع عنوان IP الخاص بـ **DigitalOcean Droplet** (مثال: `159.65.xxx.xxx`).
   - **Proxy status:** مفعل 🟠 **Proxied** (للحصول على حماية DDoS وتسريع CDN وشهادة SSL مجانية).
   - **TTL:** `Auto`
4. اضغط **Save**.
5. من القائمة الجانبية في Cloudflare، اذهب إلى **SSL/TLS** وتأكد من ضبط وضع التشفير على:
   - **Full** أو **Full (strict)**.

---

## 📌 الخطوة الثالثة: ربط وتهيئة DigitalOcean Managed PostgreSQL

1. ادخل على لوحة تحكم **DigitalOcean** ➔ **Databases** ➔ قاعدة بيانات PostgreSQL الخاصة بك.
2. احصل على **Connection Parameters** أو **Connection String**:
   ```
   postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-xxxxx.b.db.ondigitalocean.com:25060/defaultdb?sslmode=require
   ```
3. لتشغيل السكربت وإنشاء الجداول الـ 7 والفهارس والبيانات الأولية، قم بتنفيذ الأمر التالي مباشرة من جهازك أو من الـ Droplet عبر `psql`:
   ```bash
   psql "postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-xxxxx.b.db.ondigitalocean.com:25060/defaultdb?sslmode=require" -f deploy/init_managed_db.sql
   ```
   *(أو يمكنك نسخ محتوى ملف `deploy/init_managed_db.sql` ولصقه مباشرة في أداة Query Console داخل DigitalOcean).*

---

## 📌 الخطوة الرابعة: تشغيل التطبيق على الـ Droplet (عبر Docker)

1. ادخل على الـ Droplet عبر SSH:
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. استنسخ المشروع من GitHub:
   ```bash
   git clone https://github.com/YOUR_USERNAME/itqan-quran-platform.git
   cd itqan-quran-platform
   ```

3. أنشئ ملف البيئة `.env` وضع فيه رابط قاعدة البيانات:
   ```bash
   echo 'DATABASE_URL="postgresql://doadmin:YOUR_PASSWORD@db-postgresql-fra1-xxxxx.b.db.ondigitalocean.com:25060/defaultdb?sslmode=require"' > .env
   echo 'PORT=3000' >> .env
   ```

4. تشغيل التطبيق في الخلفية بضغطة واحدة عبر Docker Compose:
   ```bash
   docker compose -f deploy/docker-compose.prod.yml up -d --build
   ```

---

## 📌 الخطوة الخامسة: إعداد Nginx على الـ Droplet

إذا كنت تستخدم Nginx كـ Reverse Proxy على الـ Droplet:
```bash
# 1. تثبيت Nginx
sudo apt update && sudo apt install -y nginx

# 2. نسخ ملف الإعدادات
sudo cp deploy/nginx.conf /etc/nginx/sites-available/itqan.gizawysystems.com

# 3. تفعيل الموقع وإعادة تشغيل Nginx
sudo ln -s /etc/nginx/sites-available/itqan.gizawysystems.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📌 الخطوة السادسة: الفحص والاختبار التلقائي (Testing)

قم بتشغيل سكربت الفحص الآلي المرفق للتحقق من سلامة كافة الواجهات وقاعدة البيانات:

```bash
chmod +x deploy/test_endpoints.sh
./deploy/test_endpoints.sh https://itqan.gizawysystems.com
```

### سيقوم السكربت باختبار:
1. ✅ **Healthcheck Endpoint:** التأكد من استجابة `https://itqan.gizawysystems.com/api/health`
2. ✅ **Web UI Delivery:** التأكد من تحميل واجهة الموبايل السريعة ومصادرها.
3. ✅ **Session Recording API:** التأكد من قبول وتسجيل جلسات التسميع والحضور `POST /api/v1/sessions`.
4. ✅ **SSL Encryption:** التحقق من سريان التشفير الآمن وحماية Cloudflare.
