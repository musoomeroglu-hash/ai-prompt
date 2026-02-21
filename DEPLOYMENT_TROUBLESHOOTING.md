# 🚀 Antigravity Projesi — Dağıtım Sorun Giderme Kılavuzu

**Rol:** Kıdemli DevOps Mühendisi  
**Amaç:** GitHub'a gönderilen son kodların Vercel'e yansımaması (Stuck Deployment) sorununu teşhis etmek ve çözmek.  
**Tarih:** 14.02.2026

---

## 🚨 Yönetici Özeti

Kodlarınızı GitHub'a başarıyla "push" etmenize rağmen Vercel dağıtımınız eski bir sürümde takılı kalıyorsa, bunun temel nedeni neredeyse her zaman şu üç durumdan biridir:

1.  **Kopuk Webhook:** Vercel, GitHub'dan gelen "yeni kod var" sinyalini almıyordur.
2.  **Yoksayılan Build:** Vercel sinyali alır ancak proje ayarlarındaki bir kural yüzünden (örneğin: "sadece README değiştiyse derleme") işlemi başlatmaz.
3.  **Branch Uyuşmazlığı:** Siz `main` dalına kod atıyorsunuzdur ama Vercel `master` dalını dinliyordur (veya tam tersi).

Bu kılavuz, **Antigravity** projenizdeki bu sıkışmayı çözmek için sistematik adımlar içerir.

---

## 🔍 Faz 1: Teşhis (Diagnosis)

Çözümlere geçmeden önce, Vercel Panelinizdeki şu kritik göstergeleri kontrol edin:

1.  **Vercel Dashboard > Project > Deployments** menüsüne gidin.
2.  **En üstteki satırı (son dağıtımı) inceleyin:**
    *   **Orada mı?** Eğer son GitHub commit mesajınız listede görünüyorsa, Vercel kodu almıştır. Sorun muhtemelen **Tarayıcı Önbelleği (Browser Cache)** veya **CDN** kaynaklıdır.
    *   **Yok mu?** Eğer son commit mesajınız listede HİÇ yoksa, Vercel tetikleyiciyi **alamamıştır**. Bu bir **Git Entegrasyon** sorunudur.
    *   **"Canceled" veya "Skipped" mi yazıyor?** Vercel haberi almış ama **derlemeyi reddetmiş**. Bu bir **Ignored Build Step** sorunudur.

---

## 🛠️ Faz 2: Kök Neden Analizi ve Çözümler

### 1. "Sessiz Hata" (Kopuk Git Hook)
**Belirti:** GitHub'a push yaparsınız ama Vercel'de yaprak kımıldamaz.
**Sebep:** GitHub ile Vercel arasındaki webhook bağlantısı kopmuştur veya yetkiler geri alınmıştır.

**Çözüm:**
1.  `Vercel Dashboard > Settings > Git` menüsüne gidin.
2.  **"Connected Git Repository"** kısmına bakın.
3.  "Connected" yazsa bile, **Disconnect** yapıp hemen ardından tekrar **Connect** yapın. Bu işlem webhook'ları yeniler.
4.  GitHub tarafında Vercel uygulamasına izin verildiğinden emin olun (`GitHub > Settings > Applications > Vercel`).

### 2. "Yoksayılan Build" (Vercel Mantığı)
**Belirti:** Vercel'de dağıtım görünür ama durumu anında `Skipped` veya `Canceled` olur.
**Sebep:** Vercel'in "Ignored Build Step" komutu `exit 0` (başarılı) döndürerek Vercel'e "Önemli bir şey değişmedi, boşuna yorulma" demiştir.

**Çözüm:**
1.  `Vercel Dashboard > Settings > Git` menüsüne gidin.
2.  **"Ignored Build Step"** kutusunu bulun.
3.  **Önerilen:** Bu kutuyu tamamen boş bırakın (varsayılan davranış: her push işleminde derle).

### 3. Production Branch (Ana Dal) Uyuşmazlığı
**Belirti:** `dev` veya test dallarındaki kodlar giderken Production (Canlı) site güncellenmez.
**Sebep:** Vercel projeniz `master` dalını Production sanıyordur, ama siz `main` dalını kullanıyorsunuzdur.

**Çözüm:**
1.  `Vercel Dashboard > Settings > Git` menüsüne gidin.
2.  **"Production Branch"** ayarını kontrol edin.
3.  Bunun GitHub'daki varsayılan dalınızla (muhtemelen `main`) birebir aynı olduğundan emin olun.

### 4. Edge Network & Önbellek (Hala Eski Kod Var Sorunu)
**Belirti:** Dağıtım "Ready" (Yeşil) görünür, ama canlı sitede hala eski kodlar veya hatalar vardır.
**Sebep:** Vercel'in Edge Network (CDN) veya Next.js ISR (Incremental Static Regeneration) mekanizması eski içeriği sunmaya devam ediyordur.

**Çözüm (Anlık):**
*   **Önbelleksiz Zorla Yeniden Dağıtım (Redeploy):**
    Terminalinizde (Vercel CLI ile) şu komutu çalıştırın:
    ```bash
    vercel redeploy --no-cache --prod
    ```
    *Bu komut, tüm önbellek katmanlarını atlayarak sıfırdan temiz bir derleme başlatır.*

---

## ⚔️ Faz 3: "Nükleer" Seçenek (Zorla Deploy)

Eğer hata ayıklamakla zaman kaybetmek istemiyorsanız ve kodu **HEMEN ŞİMDİ** canlıya almanız gerekiyorsa, GitHub entegrasyonunu tamamen devre dışı bırakıp Vercel CLI ile manuel yükleme yapın.

**Ön Hazırlık:** Bilgisayarınızda `vercel` CLI yüklü olmalıdır (`npm i -g vercel`).

### Adım 1: Giriş Yapın
```bash
vercel login
```

### Adım 2: Production'a Zorla Yükle (Dosyaları Direkt Gönder)
Bu komut, GitHub'daki kodu değil, **bilgisayarınızdaki yerel klasörü** paketleyip Vercel'e yükler. En kesin çözümdür.

```bash
vercel --prod
```

*   **İpucu:** Eğer bu yöntem çalışıyor ama GitHub push çalışmıyorsa, sorun %100 **GitHub <-> Vercel Entegrasyonu** katmanındadır (Faz 2, Madde 1), kodunuzda bir sorun yoktur.

---

## 📝 Doğrulama Kontrol Listesi

Bir düzeltme uyguladıktan sonra şu testi yapın:

1.  Ufak, zararsız bir değişiklik yapın (örn: `README.md` dosyasına bir boşluk ekleyin).
2.  `git add . && git commit -m "chore: trigger deployment"`
3.  `git push origin main`
4.  **Vercel Dashboard'u izleyin.** 10 saniye içinde yeni bir "Building" satırı beliriyor mu?
    *   **Evet:** Sorun çözüldü. Entegrasyon çalışıyor. 🚀
    *   **Hayır:** Webhook hala bozuk. Entegrasyon ayarlarını incelerken geçici olarak "Nükleer Seçenek" (CLI) kullanın.

---

*Antigravity DevOps Ekibi Tarafından Onaylanmıştır*
