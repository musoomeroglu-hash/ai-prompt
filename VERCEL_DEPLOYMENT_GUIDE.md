# 🚀 Vercel Deployment Rehberi

Bu rehber, Next.js uygulamanızı **Vercel** üzerinde nasıl canlıya alacağınızı (deploy edeceğinizi) adım adım anlatır.

## 1. Hazırlık

*   Projenizin **GitHub**'a yüklendiğinden emin olun.
*   Bir **[Vercel](https://vercel.com)** hesabınızın olması gerekir (GitHub ile giriş yapmanız önerilir).

## 2. Projeyi Vercel'e Bağlama

1.  **Vercel Dashboard**'a gidin: [vercel.com/dashboard](https://vercel.com/dashboard)
2.  **"Add New..."** butonuna tıklayın ve **"Project"**i seçin.
3.  **"Import Git Repository"** listesinden projenizi (`Antigravity` veya repo adınız neyse) bulun ve **"Import"** butonuna basın.

## 3. Proje Ayarları (Build & Output Settings)

Framework Preset otomatik olarak **Next.js** seçili olmalıdır.
*   **Root Directory:** Eğer proje `apps/web` klasöründeyse, **Edit** diyip `apps/web` seçin. Eğer ana dizindeyse olduğu gibi bırakın. (Bizim projemiz `apps/web` altındaysa bunu seçmelisiniz, ama şu anki yapıda root dizinde `package.json` varsa ve workspace ise Vercel bunu genelde otomatik tanır. Emin olmak için `apps/web` seçebilirsiniz).

> **Not:** Bu proje bir monorepo yapısındaysa (turbo/nx vb.), Root Directory ayarını `apps/web` olarak ayarlamanız gerekebilir.

## 4. Çevre Değişkenleri (Environment Variables)

En önemli adım budur. `.env.local` dosyanızdaki **TÜM** anahtarları Vercel'e eklemeniz gerekir.

1.  **Environment Variables** sekmesini açın.
2.  Aşağıdaki değişkenleri tek tek veya topluca (kopyala-yapıştır ile) ekleyin:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://yukejmmofhfreixucmfc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=... (env.local dosyanızdan alın)
SUPABASE_SERVICE_ROLE_KEY=... (env.local dosyanızdan alın)

# Gemini AI
GEMINI_API_KEY=... (env.local dosyanızdan alın)

# App URL (Canlıdaki Domaininiz)
NEXT_PUBLIC_APP_URL=https://proje-adiniz.vercel.app
```

> **İpucu:** `.env.local` dosyanızın içeriğini kopyalayıp, Vercel'deki ilk kutucuğa yapıştırırsanız otomatik olarak hepsini doldurur.

## 5. Deploy İşlemi

1.  Ayarları yaptıktan sonra **"Deploy"** butonuna basın.
2.  Vercel projeyi build etmeye başlayacaktır (yaklaşık 1-2 dakika sürer).
3.  Ekranda konfetiler patladığında işlem tamamdır! 🎉

## 6. Dağıtım Sonrası Ayarlar (ÇOK ÖNEMLİ)

Uygulama canlıya alındıktan sonra, **Authentication** servislerinin (Google, Apple, Supabase) yeni domaini tanıması gerekir.

### A. Supabase URL Ayarı
1.  Supabase Paneli > **Authentication** > **URL Configuration**.
2.  **Site URL** kısmını Vercel domaininiz yapın: `https://proje-adiniz.vercel.app`
3.  **Redirect URLs** kısmına şunları ekleyin:
    *   `https://proje-adiniz.vercel.app/**`
    *   `https://proje-adiniz.vercel.app/auth/callback`

### B. Google Cloud Console
1.  Google Cloud Console > **APIs & Services** > **Credentials**.
2.  OAuth 2.0 Client ID ayarlarınıza girin.
3.  **Authorized JavaScript origins** kısmına Vercel domaininizi ekleyin.
4.  **Authorized redirect URIs** kısmına şunu ekleyin:
    *   `https://<supabase-id>.supabase.co/auth/v1/callback` (Bu zaten ekli olmalı, değişmez).

### C. Apple Developer
*   Service ID ayarlarında **Web Domain** kısmına Vercel domaininizi de eklemeniz gerekebilir (virgülle ayrılmış olarak veya yeni bir konfigürasyon ile).

## 7. Sorun Giderme

*   **Build Hatası:** "Command not found" gibi hatalar alırsanız, **Build Command** ayarını kontrol edin. Genelde `npm run build` veya `next build` olmalıdır.
*   **500 Hatası:** Environment Variable eksik olabilir. Vercel loglarına bakarak hangi değişkenin eksik olduğunu bulun.
