# 🌐 Vercel Web Paneli Kurulum Rehberi (Bilgisayarsız Yöntem)

**Bilgilendirme:** Bu rehber, Vercel CLI (komut satırı) kullanmadan, tamamen **Vercel Web Sitesi** üzerinden projenizi kurmanızı ve `ai-prompt-gilt` alan adını almanızı sağlar.

---

## 🚀 Adım 1: Vercel Dashboard'a Giriş

1.  Tarayıcınızdan **[vercel.com/dashboard](https://vercel.com/dashboard)** adresine gidin.
2.  Giriş yapmadıysanız giriş yapın.

---

## �️ Adım 2: Eski Projeyi Silin (Eğer Varsa)

Eğer listenizde `ai-prompt` veya `ai-prompt-gilt` adında eski, bozuk bir proje varsa:
1.  O projeye tıklayın.
2.  Üst menüden **Settings** sekmesine gidin.
3.  En alta inin ve **Delete Project** butonuna basın.
4.  Kutucuğa proje adını yazıp onaylayın.

*(Domain adını boşa çıkarmak için bu şarttır)*

---

## ➕ Adım 3: Yeni Proje Ekleyin

1.  Dashboard ana sayfasında sağ üstteki **"Add New..."** butonuna tıklayın.
2.  **"Project"** seçeneğini seçin.
3.  Karşınıza GitHub repolarınız gelecek. `ai-prompt` reposunun yanındaki **Import** butonuna basın.

---

## ⚙️ Adım 4: Proje Ayarları (En Önemli Kısım!)

Karşınıza çıkan "Configure Project" ekranında şu ayarları yapın:

1.  **Project Name:** Buraya tam olarak `ai-prompt-gilt` yazın. (Bu sayede istediğiniz domaini alacaksınız).
2.  **Framework Preset:** `Next.js` olarak kalsın (Otomatik).
3.  **Environment Variables:** Bu bölüme tıklayıp genişletin. Aşağıdaki değerleri tek tek kopyalayıp ekleyin:

    | Key (Anahtar) | Value (Değer) |
    | :--- | :--- |
    | `GEMINI_API_KEY` | `AIzaSyC5XnUTurRrN1pBQUPuICBnTCXsEGuITuY` |
    | `NEXT_PUBLIC_SUPABASE_URL` | `https://yukejmmofhfreixucmfc.supabase.co` |
    | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a2VqbW1vZmhmcmVpeHVjbWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA5ODcwODAsImV4cCI6MjA4NjU2MzA4MH0.g7Y_h2iXh1iXh1iXh1iXh1iXh1iXh1iXh1iXh1iXh1` |
    | `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1a2VqbW1vZmhmcmVpeXVjbWZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDk4NzA4MCwiZXhwIjoyMDg2NTYzMDgwfQ.WWe7bnWaD-moMIDnbH898VEumySbARqr8mPZcoDPqDk` |

    *Her birini ekledikten sonra **Add** butonuna basmayı unutmayın.*
    
    *Dikkat: `NEXT_PUBLIC_APP_URL` değerini de eklemelisiniz:*
    
    | Key (Anahtar) | Value (Değer) |
    | :--- | :--- |
    | `NEXT_PUBLIC_APP_URL` | `https://ai-prompt-gilt.vercel.app` |

4.  **Root Directory (Kök Dizin):**
    *   **Edit** butonuna tıklayın.
    *   Kutucuğa `apps/web` yazın.
    *   (Bu çok önemli, çünkü projeniz alt klasörde).

---

## 🚀 Adım 5: Deploy

Tüm değişkenleri eklediyseniz, alttaki büyük **Deploy** butonuna basın.

Vercel yaklaşık 1-2 dakika içinde projeyi derleyecek ve yeşil konfetiler patlatacaktır. 🎉

**Tebrikler!** Siteniz `https://ai-prompt-gilt.vercel.app` adresinde yayında.

---

### ❓ Sık Karşılaşılan Hata: "No Next.js version detected"

Eğer deploy sırasında kırmızı bir hata alırsanız ve **"No Next.js version detected"** diyorsa:
1.  **Settings -> General** sayfasına gidin.
2.  **Root Directory** ayarını kontrol edin.
3.  Eğer boşsa veya farklıysa, **Edit** diyip `apps/web` yazın ve kaydedin.
4.  Bu hatayı düzeltmek için **Deployments** sekmesine gidin, son başarısız denemenin yanındaki üç noktaya basıp **Redeploy** seçeneğini kullanın.

