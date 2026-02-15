# 🚨 Redirect Sorunu Çözüm Adımları

Uygulamanızın sürekli `localhost`'a dönmesinin sebebi %99 ihtimalle **Vercel** veya **Supabase** ayarlarındaki bir eksikliktir. Kod tarafındaki tüm önlemleri aldık.

Lütfen aşağıdaki 3 adımı sırasıyla kontrol edin:

## 1. Vercel Environment Variables Kontrolü
Vercel'e eklediğiniz `NEXT_PUBLIC_APP_URL` değişkeni, uygulamanın kendini nerede olduğunu bilmesini sağlar.

1.  [Vercel Dashboard](https://vercel.com/dashboard) -> Projeniz -> **Settings** -> **Environment Variables**.
2.  `NEXT_PUBLIC_APP_URL` adında bir değişken var mı?
3.  Değeri `https://sizin-proje-adiniz.vercel.app` şeklinde mi? (Sonunda `/` olmasın).
    *   ❌ Yanlış: `https://antigravity.vercel.app/`
    *   ✅ Doğru: `https://antigravity.vercel.app`
    *   ❌ Yanlış: `http://localhost:3000` (Eğer bu yazıyorsa hemen değiştirin!)

> **Not:** Değişiklik yaptıktan sonra projenizi tekrar **Redeploy** etmeniz gerekebilir (Deployments -> Son deploy -> 3 nokta -> Redeploy).

## 2. Supabase Site URL Ayarı
Supabase, varsayılan olarak kullanıcıyı nereye göndereceğini bu ayardan bilir.

1.  [Supabase Dashboard](https://supabase.com/dashboard) -> Projeniz -> **Authentication** -> **URL Configuration**.
2.  **Site URL** kutucuğunda ne yazıyor?
    *   Eğer `http://localhost:3000` yazıyorsa, bunu Vercel adresinizle değiştirin: `https://sizin-proje-adiniz.vercel.app`

## 3. Supabase Redirect URLs (En Önemlisi)
Güvenlik listesinde Vercel adresiniz yoksa, Supabase sizi Site URL'e (o da localhost ise oraya) atar.

1.  Aynı sayfada (**URL Configuration**) aşağıda **Redirect URLs** bölümü vardır.
2.  Bu listeye şunları ekleyin:
    *   `https://sizin-proje-adiniz.vercel.app/**`
    *   `https://sizin-proje-adiniz.vercel.app/auth/callback`

**Özet:**
Kodunuz şu an "Eğer `NEXT_PUBLIC_APP_URL` varsa oraya git, yoksa `window.location.origin` kullan" diyor. Sorun yaşamaya devam ediyorsanız, tarayıcınız önbelleğe (cache) almış olabilir. **Gizli sekmede** denemeyi unutmayın.
