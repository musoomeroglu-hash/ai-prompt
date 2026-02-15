# 🚀 GitHub'a Deploy Etme Rehberi (Adım Adım)

Bu rehber, **antigravity** projesini GitHub'a yükleme sürecini sıfırdan anlatır.

---

## 📋 Ön Gereksinimler

- [x] Git yüklü olmalı (✅ Git v2.53.0 zaten yüklendi)
- [ ] GitHub hesabın olmalı → [github.com](https://github.com) adresinden ücretsiz kayıt
- [ ] **Personal Access Token (PAT)** oluşturulmalı (aşağıda anlatılıyor)

---

## Adım 1: Git Kullanıcı Bilgilerini Ayarla

> **Amaç:** Commit'lerde kim olduğunu belirler. Bir kez yapılır.

```bash
git config --global user.name "Senin Adın"
git config --global user.email "senin@email.com"
```

⚠️ **Önemli:** E-posta, GitHub hesabındaki e-posta ile **aynı** olmalı.

**Doğrula:**
```bash
git config --global --list
```

---

## Adım 2: GitHub'da Yeni Repo Oluştur

> **Amaç:** Kodunun internetteki adresi olacak.

1. [github.com/new](https://github.com/new) adresine git
2. **Repository name** → `antigravity` yaz
3. **Description** → `AI Prompt App — Yapay zeka prompt'larınızı optimize edin`
4. **Public** veya **Private** seç:
   - **Public**: Herkes görebilir (portfolio için ideal)
   - **Private**: Sadece sen görebilirsin
5. ⚠️ **"Add a README file" kutusunu İŞARETLEME** — zaten yerel depoda var
6. ⚠️ **".gitignore" ekleme** — zaten yerel depoda var
7. **"Create repository"** butonuna tıkla

Oluşturulduktan sonra şöyle bir URL göreceksin:
```
https://github.com/KULLANICI_ADIN/antigravity.git
```
Bu URL'yi kopyala — birazdan lazım olacak.

---

## Adım 3: Personal Access Token (PAT) Oluştur

> **Amaç:** GitHub artık şifreyle push'u kabul etmiyor. Token gerekli.

1. GitHub → sağ üstte profil fotoğrafı → **Settings**
2. Sol menüde en altta → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token** → **Generate new token (classic)**
5. Ayarlar:
   - **Note**: `git push antigravity`
   - **Expiration**: 90 days (veya No expiration)
   - **Scopes**: `repo` kutusunu ✅ işaretle (tüm alt kutuları otomatik seçilir)
6. **Generate token** butonuna tıkla
7. Token'ı **hemen kopyala** ve güvenli bir yere kaydet (bir daha gösterilmez!)

Token şöyle görünür: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Adım 4: Yerel Depoyu GitHub'a Bağla

> **Amaç:** Yerel bilgisayarındaki kodu GitHub'a yönlendirir.

```bash
cd C:\Users\Acer\.gemini\antigravity\scratch
git remote add origin https://github.com/KULLANICI_ADIN/antigravity.git
```

**Doğrula:**
```bash
git remote -v
```
Çıktı:
```
origin  https://github.com/KULLANICI_ADIN/antigravity.git (fetch)
origin  https://github.com/KULLANICI_ADIN/antigravity.git (push)
```

---

## Adım 5: İlk Commit ve Push

> **Amaç:** Kodunu ilk kez GitHub'a yükle.

```bash
# Ana branch adını ayarla
git branch -M main

# Tüm dosyaları ekle
git add .

# İlk commit
git commit -m "Initial commit: AI Prompt App with shader background UI"

# GitHub'a yükle
git push -u origin main
```

**Push sırasında GitHub şifre soracak:**
- **Username**: GitHub kullanıcı adın
- **Password**: Adım 3'te oluşturduğun **PAT token** (şifre DEĞİL, token!)

> 💡 `-u origin main` sadece **ilk push'ta** gerekli. Sonraki push'larda sadece `git push` yeterli.

---

## Adım 6: Sonraki Değişiklikleri Push Etme

> **Amaç:** Her kod değişikliğinden sonra bu döngüyü tekrarla.

```bash
# 1. Değişiklikleri gör
git status

# 2. Tüm değişiklikleri ekle
git add .

# 3. Commit yap (açıklayıcı mesaj yaz)
git commit -m "Açıklayıcı mesaj: ne değişti?"

# 4. GitHub'a gönder
git push
```

**Örnek commit mesajları:**
- `"feat: dark mode eklendi"`
- `"fix: login hatası düzeltildi"`
- `"ui: shader background animasyonu güncellendi"`
- `"docs: README güncellendi"`

---

## Adım 7: Branching (İsteğe Bağlı)

> **Amaç:** Ana kodu bozmadan yeni özellik geliştir.

```bash
# Yeni branch oluştur ve geç
git checkout -b yeni-ozellik

# ... değişiklikler yap, commit et ...
git add .
git commit -m "Yeni özellik eklendi"

# Branch'i GitHub'a gönder
git push -u origin yeni-ozellik

# Ana branch'e geri dön ve birleştir
git checkout main
git merge yeni-ozellik
git push
```

**Branch akışı:**
```
main ──●──●──●──────────●── (ana kod)
              \        /
               ●──●──● yeni-ozellik
```

---

## Adım 8: GitHub Pages ile Yayımlama (İsteğe Bağlı)

> **Amaç:** Static web sitelerini ücretsiz yayımla.

1. GitHub deposuna git → **Settings** → sol menüde **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` → Folder: `/ (root)`
4. **Save** butonuna tıkla

Site adresi: `https://KULLANICI_ADIN.github.io/antigravity/`

> ⚠️ Next.js projeleri için GitHub Pages yerine **Vercel** önerilir — çok daha kolay.

---

## 🔄 Hızlı Referans Kartı

```bash
# İlk kurulum (bir kez)
git init
git remote add origin https://github.com/user/repo.git
git branch -M main
git add .
git commit -m "İlk commit"
git push -u origin main

# Günlük iş akışı
git add .
git commit -m "açıklayıcı mesaj"
git push
```

---

## ❓ Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| `remote origin already exists` | `git remote remove origin` sonra tekrar ekle |
| `rejected - non-fast-forward` | `git pull origin main --rebase` sonra `git push` |
| `Authentication failed` | PAT token süresi dolmuş → yeni token oluştur |
| `.env.local push oldu!` | `git rm --cached .env.local` sonra commit & push |
| `Permission denied` | Token scope'unda `repo` seçili mi kontrol et |

---

## 🤖 Gemini ile Push

Bana **"push"** dediğinde otomatik olarak şu işlemleri yapacağım:
1. `git add .` — tüm değişiklikleri staging'e al
2. `git commit -m "mesaj"` — commit oluştur
3. `git push` — GitHub'a gönder

İlk seferde GitHub kullanıcı adın ve repo URL'ini vermeni isteyeceğim.

---

<p align="center"><strong>Built with ❤️ and a touch of antigravity ✨</strong></p>
