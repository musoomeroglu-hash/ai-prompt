# 🍎 Apple Sign-In Kurulum Rehberi

Uygulamanızda **"Apple ile Giriş Yap"** özelliğini kullanabilmek için bir **Apple Developer Hesabı**'na (yıllık $99) ihtiyacınız vardır.

Bu rehber, Apple Developer Portal ve Supabase ayarlarını adım adım yapmanıza yardımcı olacaktır.

## 1. Apple Developer Portal Ayarları

Adres: [developer.apple.com/account](https://developer.apple.com/account)

### Adım 1: App ID Oluşturma
1.  **Certificates, Identifiers & Profiles** menüsüne gidin.
2.  Yan menüden **Identifiers**'ı seçin ve **(+)** butonuna basın.
3.  **App IDs**'i seçip *Continue* deyin.
4.  **Select a type** kısmında **App**'i seçip *Continue* deyin.
5.  **Description:** Uygulamanızın adını yazın (örn: `Antigravity Web`).
6.  **Bundle ID:** `Explicit` seçin ve benzersiz bir ID girin (örn: `com.antigravity.web`).
7.  Aşağıdaki **Capabilities** listesinden **Sign In with Apple**'ı bulup tikleyin ✅.
8.  *Continue* ve *Register* diyerek tamamlayın.

### Adım 2: Service ID Oluşturma
Supabase ile iletişim kurmak için bir Service ID gereklidir.

1.  Tekrar **Identifiers** sayfasına gelin.
2.  Sağ üstteki **(+)** butonuna basın.
3.  Bu sefer **Service IDs**'i seçip *Continue* deyin.
4.  **Description:** `Antigravity Web Auth` gibi bir isim verin.
5.  **Identifier:** `com.antigravity.web.service` gibi bir ID girin.
6.  *Continue* ve *Register* deyin.
7.  Oluşturduğunuz Service ID'ye listeden tıklayın.
8.  **Sign In with Apple** kutucuğunu işaretleyin ve yanındaki **Configure** butonuna basın.
9.  **Primary App ID:** Az önce oluşturduğunuz App ID'yi seçin.
10. **Web Domain:** Uygulamanızın domaini (localhost kabul edilmez, production domain gerekir veya ngrok kullanılabilir).
11. **Return URLs:** Supabase'den alacağınız `Callback URL`'i buraya yapıştırın.
    *   *Örnek:* `https://<supabase-id>.supabase.co/auth/v1/callback`
12. *Save* -> *Continue* -> *Save* diyerek kaydedin.

### Adım 3: Private Key Oluşturma
Authorization işlemleri için bir anahtar dosyası gereklidir.

1.  Sol menüden **Keys** sekmesine gidin.
2.  **(+)** butonuna basın.
3.  **Key Name:** `Supabase Auth Key` yazın.
4.  **Sign In with Apple** seçeneğini işaretleyin.
5.  *Configure* butonuna basıp **Primary App ID**'yi seçin.
6.  *Save* -> *Continue* -> *Register* deyin.
7.  **Download** butonuna basarak `.p8` uzantılı dosyayı indirin.
    *   ⚠️ **DİKKAT:** Bu dosyayı sadece bir kez indirebilirsiniz, kaybetmeyin!
8.  Ayrıca bu sayfadaki **Key ID**'yi bir yere not edin.

---

## 2. Supabase Ayarları

Adres: [supabase.com/dashboard](https://supabase.com/dashboard)

1.  Projenize gidin ve sol menüden **Authentication** -> **Providers** sekmesini açın.
2.  **Apple** sağlayıcısını bulun ve açın.
3.  **Enabled** anahtarını açın.
4.  Gerekli bilgileri girin:
    *   **Services ID:** (Adım 2'de oluşturduğunuz ID, örn: `com.antigravity.web.service`)
    *   **Secret Key (p8):** İndirdiğiniz `.p8` dosyasını bir metin düzenleyici ile açıp, içindeki TÜM metni kopyalayın ve buraya yapıştırın.
    *   **Key ID:** (Adım 3'teki Key ID - 10 karakterli kod)
    *   **Team ID:** Apple Developer hesabınızın sağ üst köşesinde yazar (veya Membership sayfasında).
5.  **Save** diyerek kaydedin.

## 3. Önemli Notlar

*   **Localhost Testi:** Apple Sign-In güvenlik nedeniyle `localhost` adresine dönüş yapmayı reddedebilir. Bu yüzden test ederken yerel bir domain (hosts dosyası ile) veya production URL kullanmanız gerekebilir.
*   **Email Relay:** Kullanıcılar "E-postamı Gizle" seçeneğini kullanırsa, Apple size `@privaterelay.appleid.com` uzantılı rastgele bir mail verir. Bu durumda gerçek maile ulaşamazsınız.

🎉 Tebrikler! Artık uygulamanızda Apple ile giriş yapabilirsiniz.
