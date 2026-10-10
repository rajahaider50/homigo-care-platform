# HomiGo Care — عمل درآمد کا منصوبہ

## دائرۂ کار اور ترجیح

صارف کی واضح مرحلہ وار ہدایت کے مطابق کام کی ترتیب یہ ہے: پہلے native Android بنیاد، اس کے بعد Public Website، اور پھر الگ Admin web panel۔ فراہم کردہ Minimalist MVP kit میں public marketing website عام طور پر مؤخر ہے، لیکن صارف نے بعد کی واضح ہدایت میں Website کو الگ مرحلہ قرار دے کر منظور کیا؛ اس لیے یہاں یہ شامل ہے، اصل kit کو بدلے بغیر۔ اصل guide، PDF، tokens، لوگو اور icons ہی بصری اور عملی حوالہ ہیں۔ موجودہ تعیناتی صرف **غیر تجارتی demo/staging** ہے، طبی سروس یا emergency-dispatch نظام نہیں۔ حقیقی مریض/طبی ریکارڈ، فرضی دستیابی، مصنوعی booking، نامکمل تصدیق، یا fake dispatch/payment دعوے نہیں ہوں گے۔

## مصنوعات اور ٹیکنالوجی

- `apps/android`: Kotlin/Jetpack Compose کا patient app۔ Firebase email/password اور Google sign-in، verified-email gate اور recovery، password reset، کم سے کم patient profile، اور دیانت دار ابتدائی dashboard۔
- `apps/public-web`: React/Vite پر responsive Public Website، مختصر service overview، Firebase sign-up/sign-in، Google sign-in، verification/recovery/action route، اور password-reset action route۔
- `apps/admin-web`: الگ React/Vite Admin panel؛ صرف sign-in، کوئی public sign-up نہیں۔ کسی privileged Firestore query سے پہلے Firebase `admin` custom claim لازماً check ہوگا۔ ابتدائی Admin account کے لیے owner کا email درکار ہے۔
- `packages/design-system`: فراہم کردہ tokens، 107 اصل SVG icons، اصل لوگو فائلیں، اور Android launcher assets۔
- `firebase`: صرف موجودہ DEV project کی CLI context اور محدود Firestore rules۔ Firebase Hosting/Storage غیر ارادی طور پر فعال نہیں ہوں گے۔
- `tests/firestore`: Firestore Rules کے isolated Emulator tests؛ synthetic test identities صرف Emulator میں، shared Firebase میں کبھی seed نہیں ہوں گے۔

## ڈیٹا اور اجازتیں

M1 میں صرف کم سے کم `profiles/{uid}` دستاویز محفوظ ہوگی: `uid`، Firebase کی تصدیق شدہ email، display name، ناقابلِ اختیار client role `patient`، اور server timestamps۔ profile صرف email verification کے بعد بنے گی۔ کلائنٹ Admin یا Professional role نہیں دے سکتا۔ صارف صرف اسی UID والی profile پڑھ سکتا ہے؛ verified `admin` custom claim کو صرف rules میں صراحت سے منظور شدہ محدود read ملے گی۔ دیگر تمام Firestore collections default-deny رہیں گی جب تک ان کے اپنے phase-specific rules بن کر منظور نہ ہوں۔ موجودہ remote records delete نہیں ہوں گے؛ rule tightening پرانے clients کی رسائی روک سکتی ہے مگر data مٹائے گی نہیں۔

Email action code ایک بار استعمال ہونے والا حساس credential ہے: اسے log، analytics، storage یا دوبارہ استعمال نہیں کرنا۔ Screenshot کا پرانا code کبھی replay نہیں ہوگا۔ Website action route تازہ Firebase code کو verify/consume کرے گا اور success، expired اور invalid states واضح دکھائے گا۔ صرف email بھیجنا یا button دبانا verification نہیں سمجھا جائے گا؛ profile write سے پہلے Firebase Auth state تازہ ہوگی۔

## Website کا بصری رخ

- **Design movement:** اصل PDF کے مطابق پُرسکون healthcare minimalism، ہلکی editorial ترتیب؛ عام marketplace template نہیں۔
- **بنیادی اصول:** (1) آرائش سے پہلے اعتماد، (2) ہر view پر ایک واضح اگلا قدم، (3) privacy کی صاف وضاحت، (4) دستیابی اور progress کے بارے میں سچائی۔
- **رنگوں کی منطق:** اصل teal `#1B6B63` اور dark teal `#0D4A44` اعتماد/رہنمائی کے لیے؛ سفید اور `#F5F5F5` پُرسکون سطحوں کے لیے؛ orange `#F5823A` صرف محدود ثانوی accent؛ red صرف حقیقی SOS/emergency context میں۔ کوئی نیا brand رنگ شامل نہیں ہوگا۔
- **صفحاتی ساخت:** نمایاں مگر غیر متوازن editorial hero، مختصر عمودی service explanations، اور چھوٹے فون پر ایک قابلِ مطالعہ کالم؛ ایک جیسے centered cards کی دیوار نہیں۔
- **مخصوص شناخت:** اصل HomiGo lockup/mark، اصل SVG icon strokes کو token colors میں دکھانا، اور ہلکی teal shadows کے ساتھ کشادہ، نرم گول سطحیں۔
- **تعامل:** Firebase auth کے حقیقی flows، واضح loading/empty/error/success حالتیں؛ آئندہ services معلومات کے طور پر دکھائی جائیں گی، فعال booking یا فرضی availability کے طور پر نہیں۔
- **حرکت:** عام انتقال 160–220ms کے مختصر opacity/translate اثرات تک؛ critical status صرف animation سے ظاہر نہیں ہوگا؛ `prefers-reduced-motion` لازمی ہے؛ pulse صرف حقیقی implemented SOS action کے لیے۔
- **ٹائپوگرافی:** اصل token میں درج Plus Jakarta Sans Latin stack؛ RTL متن کے لیے Noto Naskh Arabic/Noto Nastaliq Urdu fallback۔ لوگو/wordmark کو دوبارہ draw یا distort نہیں کرنا۔
- **برانڈ:** بنیادی مقصد مریض/خاندان کو گھر پر care کے آغاز کے لیے privacy-minded راستہ دینا ہے؛ شخصیت پُرسکون، بااحترام، قابلِ اعتماد۔ مثالیں: “اپنے اکاؤنٹ میں محفوظ طریقے سے داخل ہوں۔” اور “اس مرحلے میں services کی معلومات دستیاب ہیں؛ booking ابھی فعال نہیں۔”
- **لوگو اور نمایاں رنگ:** supplied logo files بعینہٖ استعمال ہوں گی؛ signature brand color اصل primary teal `#1B6B63` ہے۔

## M1 کی ترتیب اور hosting

1. **Android بنیاد:** fresh repository میں Kotlin/Compose auth/profile code، اصل assets، اور unit-test source موجود ہیں۔ CI run `38055108814` میں Android SDK setup، lint، unit tests اور `assembleDebug` کامیاب ہوئے، مگر workflow نے APK artifact محفوظ نہیں کیا۔ CI runner کا default debug key Firebase میں رجسٹرڈ development key نہیں، اس لیے حقیقی Google sign-in ثابت نہیں۔ نیا workflow config metadata کی خاموش validation اور private 7-day APK artifact upload شامل کرتا ہے؛ device-side Firebase test ابھی باقی ہے۔
2. **Public Website:** responsive public view اور Firebase auth/action routes بنیں گے؛ Vercel Hobby پر صرف user-approved non-commercial demo/staging نشر ہوگا۔ اسے commercial production نہیں کہا جائے گا۔
3. **Admin panel:** الگ، sign-in-only، no-sign-up واجہ؛ valid custom claim کے بغیر کوئی privileged query نہیں۔ Admin email/claim نہ ہونے تک حقیقی Admin sign-in روکا رہے گا۔
4. Firestore rules کو Firebase validator اور isolated Emulator tests سے جانچنا ہے۔ shared DEV project میں rules deploy کرنے سے پہلے exact payload اور پرانے collections پر اثر دکھا کر الگ واضح منظوری لینا لازم ہے۔
5. صرف intended source، secrets کے بغیر، private GitHub `fresh-rebuild` branch پر جائے گا۔ Public اور Admin کے الگ Vercel projects ہوں گے۔ اصل URLs اسی وقت رپورٹ ہوں گے جب deployment verify ہو جائے۔

## بعد کے منظوری یافتہ مراحل

**M2:** منظور شدہ Doctor/Nurse discovery، حقیقی booking requests، patient/professional/Admin میں مشترک status؛ WhatsApp OTP صرف user کے sanitized Java API sample/config ملنے کے بعد۔ **M3:** محدود Health Passport grants، محفوظ PIN handling، حقیقی persisted SOS (dispatch کا دعویٰ نہیں)، اور دستی payment proof review مع جدا permissions/audit۔ **M4:** security/integration hardening، repeatable CI، signed-release ہدایات، آخری acceptance، backups اور دیانت دار production-readiness حدود۔ ہر 25% milestone کے بعد owner acceptance تک رکنا ہے۔
