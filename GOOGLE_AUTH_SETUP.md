# 🔐 Google Auth Kurulum Rehberi

Uygulamanızda **"Google ile Giriş Yap"** özelliğini kullanabilmek için Google Cloud Console'da bir proje oluşturmalı ve **Client ID** ile **Client Secret** almalısınız.

Bu rehber sizi adım adım yönlendirecektir. (Tahmini süre: 5 dakika)

---

## Adım 1: Google Cloud Projesi Oluşturma

1.  [**Google Cloud Console**](https://console.cloud.google.com/) adresine gidin ve Google hesabınızla giriş yapın.
2.  Sol üst köşedeki **proje seçiciye** ("Select a project") tıklayın.
3.  **"New Project"** (Yeni Proje) butonuna tıklayın.
4.  **Project Name:** `Antigravity Auth` (veya istediğiniz bir isim) yazın.
5.  **Create** butonuna basın.

---

## Adım 2: OAuth Consent Screen (İzin Ekranı) Ayarlama

Kullanıcıların Google ile giriş yaparken göreceği onay ekranını yapılandırmalısınız.

1.  Sol menüden **"APIs & Services"** > **"OAuth consent screen"** seçeneğine gidin.
2.  **User Type:** **External** (Harici) seçin ve **Create** butonuna tıklayın.
3.  **App Information:**
    *   **App name:** `Antigravity`
    *   **User support email:** Kendi e-postanızı seçin.
    *   **Developer contact information:** Kendi e-postanızı yazın.
4.  Diğer alanları boş bırakabilirsiniz. En alttaki **"Save and Continue"** butonuna tıklayın.
5.  **(Opsiyonel)** "Scopes" sayfasında değişiklik yapmadan **"Save and Continue"** deyin.
6.  **(Opsiyonel)** "Test users" sayfasında değişiklik yapmadan **"Save and Continue"** deyin.
7.  Özet sayfasında **"Back to Dashboard"** butonuna tıklayın.

⚠️ **Önemli:** Uygulamanız "Testing" durumundayken sadece test kullanıcıları giriş yapabilir. Canlıya almadan önce **"Publish App"** butonuna tıklayarak "In production" moduna geçirmelisiniz (doğrulama gerektirebilir, ancak kişisel kullanım için "Testing" yeterlidir veya "External" seçip doğrulamayı bekleyebilirsiniz).

---

## Adım 3: Credentials (Kimlik Bilgileri) Oluşturma

Şimdi Supabase'e bağlamak için gereken anahtarları oluşturacağız.

1.  Sol menüden **"Credentials"** (Kimlik Bilgileri) sekmesine tıklayın.
2.  Üstteki **"+ CREATE CREDENTIALS"** butonuna tıklayın ve **"OAuth client ID"** seçeneğini seçin.
3.  **Application type:** **Web application** seçin.
4.  **Name:** `Supabase Login` (veya istediğiniz bir isim).
5.  **Authorized JavaScript origins:**
    *   Buraya uygulamanızın çalıştığı adresleri ekleyin:
    *   `http://localhost:3000`
    *   `https://ai-prompt-gilt.vercel.app` (Bu çok önemli!)
6.  **Authorized redirect URIs:** (Çok Önemli!)
    *   Buraya Supabase'den alacağınız "Callback URL"i eklemelisiniz.
    *   Supabase Panosu > Authentication > Providers > Google sayfasında en üstte **"Callback URL (for OAuth)"** yazar.
    *   Genellikle şuna benzer: `https://[proje-id].supabase.co/auth/v1/callback`
7.  **Create** butonuna tıklayın.

---

## Adım 4: Client ID ve Secret'ı Supabase'e Girme

Google size **Client ID** ve **Client Secret** verecek.

1.  [**Supabase Panosu**](https://supabase.com/dashboard) adresine gidin.
2.  Projenizi seçin.
3.  Sol menüden **Authentication** > **Providers** sekmesine tıklayın.
4.  **Google** sağlayıcısına tıklayın.
5.  **"Enabled"** anahtarını açın.
6.  **Client ID (for OAuth):** Google'dan aldığınız Client ID'yi yapıştırın.
7.  **Client Secret (for OAuth):** Google'dan aldığınız Client Secret'ı yapıştırın.
8.  **Save** butonuna tıklayın.

---

## Adım 5: Test Etme

Artık uygulamanızda "Google ile Giriş Yap" butonuna tıkladığınızda Google'ın giriş ekranı açılmalı ve başarılı girişten sonra uygulamanıza dönmelidir.
