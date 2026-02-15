<p align="center">
  <img src="apps/web/public/favicon.ico" width="80" alt="Antigravity Logo" />
</p>

<h1 align="center">🚀 Antigravity — AI Prompt App</h1>

<p align="center">
  <strong>Yapay zeka prompt'larınızı optimize eden, geliştiren ve mükemmelleştiren akıllı uygulama.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4-purple?logo=openai" alt="OpenAI" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-cyan?logo=tailwindcss" alt="Tailwind" />
</p>

---

## 📖 Proje Hakkında

**Antigravity**, kullanıcıların herhangi bir AI platformu (ChatGPT, Gemini, Claude, Copilot vb.) için optimize edilmiş prompt'lar üretmesini sağlayan tam kapsamlı bir web uygulamasıdır.

Kullanıcı isteğini yazar, hedef AI'ı seçer ve uygulama **5 farklı varyasyonda** profesyonel prompt üretir:

| Varyasyon | Açıklama |
|-----------|----------|
| 🎯 **Short & Punchy** | Kısa, öz ve etkili |
| 📝 **Detailed** | Bağlam zengini, kapsamlı |
| 🎨 **Creative** | Yaratıcı, sıra dışı yaklaşım |
| 💼 **Professional** | Kurumsal, resmi ton |
| ⚙️ **Technical** | Teknik, yapılandırılmış |

---

## ✨ Özellikler

### 🌐 Web Uygulaması
- **WebGL Shader Arka Plan** — Kozmik, animasyonlu arka plan efekti
- **10 AI Platform Desteği** — ChatGPT, Gemini, Claude, Copilot, Perplexity, Midjourney, DALL-E, Stable Diffusion, Llama, Mistral
- **Kategori Sistemi** — Kodlama, Yazı, Pazarlama, Eğitim, Analiz, Prompt İyileştirme
- **Dark/Light Tema** — Otomatik tema geçişi (localStorage destekli)
- **Kinetic Dots Loader** — Animasyonlu yükleme göstergesi
- **Text Shimmer Efekti** — Gradient animasyonlu metin
- **Geçmiş Sidebar** — Son 20 prompt üretimini görüntüleme
- **Kopyalama** — Tek tıkla prompt kopyalama

### 🔐 Kimlik Doğrulama & Abonelik
- **Supabase Auth** — Magic link ile e-posta doğrulaması
- **7 Farklı Plan** — Ücretsiz, Başlangıç, Pro, Sınırsız, Dev Starter, Dev Pro, Enterprise
- **Kota Sistemi** — Aylık/günlük prompt limitleri
- **7 Gün Ücretsiz Deneme** — Tüm yeni kullanıcılara

### 🧩 Chrome Uzantısı
- **Metin Seçimi** — Herhangi bir web sitesinde metin seç → prompt üret
- **AI Platform Entegrasyonu** — ChatGPT, Claude, Gemini sayfalarında doğrudan kullanım
- **Floating Buton** — Metin seçince otomatik görünen akıllı buton

---

## 🏗️ Mimari

```
antigravity/
├── apps/
│   ├── web/                    # Next.js 16 Web Uygulaması
│   │   ├── src/
│   │   │   ├── app/            # Sayfalar (App Router)
│   │   │   │   ├── page.tsx           # Ana sayfa
│   │   │   │   ├── pricing/           # Fiyatlandırma
│   │   │   │   ├── account/           # Hesap yönetimi
│   │   │   │   ├── api/               # API Route'ları
│   │   │   │   │   ├── generate/      # Prompt üretimi (OpenAI)
│   │   │   │   │   ├── subscription/  # Abonelik yönetimi
│   │   │   │   │   └── usage/         # Kullanım istatistikleri
│   │   │   │   └── auth/callback/     # Auth callback
│   │   │   ├── components/
│   │   │   │   ├── ui/                # UI Bileşenleri
│   │   │   │   │   ├── shader-background.tsx  # WebGL2 arka plan
│   │   │   │   │   ├── text-shimmer.tsx       # Shimmer efekti
│   │   │   │   │   ├── kinetic-dots-loader.tsx # Yükleme animasyonu
│   │   │   │   │   ├── theme-toggle.tsx       # Tema değiştirici
│   │   │   │   │   └── interactive-hover-button.tsx
│   │   │   │   └── chat-input.tsx     # Ana giriş bileşeni
│   │   │   └── lib/
│   │   │       ├── supabaseClient.ts  # Supabase client
│   │   │       ├── plans.ts           # Plan yapılandırmaları
│   │   │       └── subscription.ts    # Abonelik kontrolleri
│   │   └── .env.local                 # Ortam değişkenleri
│   └── extension/              # Chrome Uzantısı
│       ├── manifest.json
│       ├── content.js
│       ├── background.js
│       └── popup/
├── supabase/
│   └── full_schema.sql         # Veritabanı şeması
└── README.md
```

---

## 🚀 Kurulum

### Gereksinimler
- **Node.js** 18+ 
- **npm** veya **pnpm**
- **Supabase** hesabı (ücretsiz)
- **OpenAI** API anahtarı

### 1. Depoyu Klonla
```bash
git clone https://github.com/KULLANICI_ADIN/antigravity.git
cd antigravity
```

### 2. Bağımlılıkları Yükle
```bash
cd apps/web
npm install
```

### 3. Ortam Değişkenlerini Ayarla
```bash
cp .env.example .env.local
```

`.env.local` dosyasını düzenle:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Veritabanını Oluştur
Supabase SQL Editor'de `supabase/full_schema.sql` dosyasını çalıştır.

### 5. Uygulamayı Başlat
```bash
npm run dev
```
Uygulama: [http://localhost:3000](http://localhost:3000)

---

## 🎨 UI Bileşenleri

### Shader Background
WebGL2 fragment shader kullanarak kozmik bir arka plan efekti oluşturur. Performans için `requestAnimationFrame` ve otomatik `devicePixelRatio` ölçekleme kullanır.

### Kinetic Dots Loader
CSS animasyonlarıyla zıplayan noktalar — `gravity-bounce`, `rubber-morph` ve `ripple-expand` keyframe'leri.

### Text Shimmer
Framer Motion ile gradient animasyonlu metin efekti. Yapılandırılabilir süre ve renk desteği.

### Theme Toggle
`localStorage` destekli dark/light tema geçişi. Güneş/Ay ikonları ve yumuşak geçiş animasyonu.

---

## 📊 Plan Karşılaştırması

| Özellik | Ücretsiz | Başlangıç | Pro | Sınırsız |
|---------|----------|-----------|-----|----------|
| Aylık Prompt | 5 | 100 | 500 | ∞ |
| Günlük Limit | 2 | 20 | 100 | ∞ |
| Prompt Varyasyonu | 3 | 3 | 5 | 5 |
| AI Modeli | GPT-4o-mini | GPT-4o-mini | GPT-4o | GPT-4o |
| Geçmiş | 7 gün | 30 gün | ∞ | ∞ |
| API Erişimi | ❌ | ❌ | ❌ | ✅ |

---

## 🔧 API Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/generate` | Prompt üretimi |
| `GET` | `/api/subscription` | Abonelik durumu |
| `POST` | `/api/subscription` | Abonelik işlemleri |
| `GET` | `/api/usage` | Kullanım istatistikleri |
| `POST` | `/api/token` | Token doğrulama |

---

## 🧩 Chrome Uzantısı Kurulumu

1. `chrome://extensions/` adresine git
2. **Geliştirici Modu**'nu aç (sağ üst)
3. **Paketlenmemiş öğe yükle** → `apps/extension` klasörünü seç
4. Uzantı simgesini sabitle

---

## 🛠️ Teknoloji Yığını

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, CSS Animations |
| **Animations** | Framer Motion, WebGL2 Shaders |
| **Auth** | Supabase Auth (Magic Link) |
| **Database** | Supabase (PostgreSQL) |
| **AI** | OpenAI GPT-4o / GPT-4o-mini |
| **Extension** | Chrome Extension Manifest V3 |
| **Deployment** | Vercel (önerilen) |

---

## 📝 Lisans

Bu proje özel kullanım içindir. Tüm hakları saklıdır.

---

<p align="center">
  <strong>Built with ❤️ and a touch of antigravity ✨</strong>
</p>
