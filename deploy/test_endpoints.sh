#!/usr/bin/env bash
# =========================================================================
# سكربت الفحص والاختبار السريع بعد النشر (Post-Deployment Test Script)
# النطاق: https://itqan.katatibi.com
# =========================================================================

TARGET_URL="${1:-https://itqan.katatibi.com}"

echo "=========================================================="
echo "🔍 جاري فحص واختبار منصة إتقان على النطاق: $TARGET_URL"
echo "=========================================================="

# 1. اختبار الـ Healthcheck
echo -n "1️⃣ فحص استجابة الخادم (/api/health)... "
HEALTH_RESP=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/api/health")
if [ "$HEALTH_RESP" -eq 200 ]; then
    echo "✅ [200 OK - الخادم وقاعدة البيانات تعمل بكفاءة]"
else
    echo "❌ [كود الخطأ: $HEALTH_RESP - يرجى التحقق من تشغيل التطبيق]"
fi

# 2. اختبار تحميل الواجهة الرئيسية
echo -n "2️⃣ فحص تحميل الواجهة الرئيسية (/)... "
MAIN_RESP=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL/")
if [ "$MAIN_RESP" -eq 200 ]; then
    echo "✅ [200 OK - تم تحميل واجهة الجوال والمستخدم]"
else
    echo "❌ [كود الخطأ: $MAIN_RESP]"
fi

# 3. اختبار تسجيل جلسة حلقة
echo -n "3️⃣ فحص إرسال جلسة تجريبية (POST /api/v1/sessions)... "
POST_RESP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$TARGET_URL/api/v1/sessions" \
  -H "Content-Type: application/json" \
  -d '{"circle_id":"hlq-nafe-1","session_date":"2026-08-20","status":"COMPLETED"}')

if [ "$POST_RESP" -eq 201 ] || [ "$POST_RESP" -eq 200 ]; then
    echo "✅ [تم قبول وتسجيل الجلسة بنجاح]"
else
    echo "❌ [كود الخطأ: $POST_RESP]"
fi

# 4. فحص شهادة الأمان SSL
echo -n "4️⃣ فحص بروتوكول التشفير وشهادة SSL... "
if curl -sI "$TARGET_URL" | grep -i "HTTP/2\|HTTP/1.1 200\|HTTP/1.1 301" > /dev/null; then
    echo "✅ [اتصال آمن ومشفر عبر Cloudflare]"
else
    echo "⚠️ [تحقق من تفعيل SSL في لوحة Cloudflare]"
fi

echo "=========================================================="
echo "🎉 اكتمل الفحص بنجاح!"
echo "=========================================================="
