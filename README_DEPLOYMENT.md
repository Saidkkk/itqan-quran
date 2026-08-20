# 🌿 دليل النشر المتكامل لمنصة "إتقان" (Itqan Quran Platform)
**النطاق المخصص:** `itqan.katatibi.com`  
**الخادم:** DigitalOcean Droplet (Ubuntu 24.04 / 22.04)  
**قاعدة البيانات:** DigitalOcean Managed PostgreSQL Database (Schema: `itqan`)  
**إدارة الـ DNS والحماية:** Cloudflare  

---

## 📌 الخطوة الأولى: رفع التعديلات إلى GitHub

قم بتشغيل الأوامر التالية على جهازك بعد تنزيل الكود:

```bash
cd ~/projects/itqan_quran

git add .
git commit -m "feat: configure itqan.katatibi.com domain and postgres connection"
git push origin main
```

---

## 📌 الخطوة الثانية: ضبط الـ Subdomain في Cloudflare لنطاق `katatibi.com`

1. افتح حسابك في **[Cloudflare Dashboard](https://dash.cloudflare.com)** واختر نطاقك: `katatibi.com`.
2. توجه إلى تبويب **DNS** ➔ **Records** ثم اضغط **Add record**.
3. قم بإدخال البيانات التالية:
   - **Type:** `A`
   - **Name:** `itqan` *(ليصبح النطاق: itqan.katatibi.com)*
   - **IPv4 address:** ضع عنوان IP الخاص بسيرفرك في DigitalOcean Droplet.
   - **Proxy status:** مفعل 🟠 **Proxied** (حماية DDoS وشهادة SSL وتسريع التصفح).
   - **TTL:** `Auto`
4. اضغط **Save**.
5. تأكد من تفعيل وضع التشفير في تبويب **SSL/TLS** على: **Full** أو **Full (strict)**.

---

## 📌 الخطوة الثالثة: تشغيل التطبيق على الـ Droplet

1. ادخل على الـ Droplet عبر SSH:
   ```bash
   ssh root@YOUR_DROPLET_IP
   ```

2. استنسخ المشروع (أو اسحب التحديثات إذا كان مستنسخاً مسبقاً):
   ```bash
   git clone https://github.com/saidkkk/itqan-quran.git
   cd itqan-quran
   # إذا كان موجوداً مسبقاً: git pull origin main
   ```

3. أنشئ ملف البيئة `.env` بالمتغيرات المفككة:
   ```bash
   cat << 'EOF' > .env
   PORT=3000
   DB_HOST=db-postgresql-fra1-xxxxx.b.db.ondigitalocean.com
   DB_PORT=25060
   DB_USER=doadmin
   DB_PASSWORD=YOUR_ACTUAL_PASSWORD_WITH_@
   DB_NAME=defaultdb
   DB_SSL=true
   DB_SCHEMA=itqan
   EOF
   ```

4. بناء وتشغيل الحاوية في الخلفية:
   ```bash
   docker compose -f deploy/docker-compose.prod.yml up -d --build
   ```

---

## 📌 الخطوة الرابعة: إعداد Nginx على الـ Droplet

```bash
# 1. نسخ ملف الإعدادات المحدث
sudo cp deploy/nginx.conf /etc/nginx/sites-available/itqan.katatibi.com

# 2. تفعيل الموقع وإعادة تشغيل Nginx
sudo ln -s /etc/nginx/sites-available/itqan.katatibi.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 📌 الخطوة الخامسة: الفحص الآلي بعد النشر

```bash
chmod +x deploy/test_endpoints.sh
./deploy/test_endpoints.sh https://itqan.katatibi.com
```
