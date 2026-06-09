# KariyerRotası 🚀

**Türkiye'nin yapay zeka destekli, akıllı kariyer platformu**

KariyerRotası; iş arayanlar ile işverenler için uçtan uca bir kariyer ekosistemi sunar. Yapay zeka tabanlı CV analizi, semantik vektör eşleşmesi ve davranışsal öğrenme altyapısıyla, her adaya kişiselleştirilmiş iş önerileri sunar.

---

## 📋 İçindekiler

- [Proje Hakkında](#-proje-hakkında)
- [Öne Çıkan Özellikler](#-öne-çıkan-özellikler)
- [Mimari Genel Bakış](#-mimari-genel-bakış)
- [Teknoloji Yığını](#-teknoloji-yığını)
- [Proje Yapısı](#-proje-yapısı)
- [Veritabanı Modeli](#-veritabanı-modeli)
- [Web Uygulaması (Frontend)](#-web-uygulaması-frontend)
- [Mobil Uygulama](#-mobil-uygulama)
- [Backend API](#-backend-api)
- [Yapay Zeka Servisi](#-yapay-zeka-servisi)
- [Yapay Zeka Eşleşme Motoru](#-yapay-zeka-eşleşme-motoru)
- [Kurulum ve Çalıştırma](#-kurulum-ve-çalıştırma)
- [Çevre Değişkenleri](#-çevre-değişkenleri)

---

## 🎯 Proje Hakkında

KariyerRotası, geleneksel iş arama platformlarındaki temel sorunları çözmek için geliştirilmiş, **4 bağımsız servisten** oluşan tam kapsamlı bir uygulamadır:

| Sorun | KariyerRotası Çözümü |
|-------|----------------------|
| Alakasız iş ilanı önerileri | Semantik vektör eşleşmesi + davranışsal öğrenme |
| Manuel CV girişi | AI destekli otomatik CV analizi ve profil doldurma |
| Belirsiz uyum skoru | 11 parametreli şeffaf uyum analizi raporu |
| Web-only erişim | Tam özellikli iOS/Android mobil uygulama |
| İşveren kör noktası | Aday-ilan uyum raporu + analiz paneli |

---

## ⭐ Öne Çıkan Özellikler

### 🤖 Yapay Zeka Destekli Özellikler

#### 1. Akıllı CV Analizi
- PDF formatındaki CV'yi yapay zeka ile okuyup ayrıştırır
- Google Gemini 2.5 Flash modeli ile İK perspektifinden CV metnini işler
- Eğitim, deneyim, projeler, yetenekler, sertifikalar, diller gibi tüm bölümleri otomatik çıkarır
- Mevcut profil verileriyle akıllıca **birleştirir** (merge), çakışan bilgileri günceller, eksikleri tamamlar
- CV versiyonlama: tüm yüklenen CV'ler arşivlenir, geçmiş görüntülenebilir

#### 2. Semantik Vektör Eşleşmesi (pgvector)
- Kullanıcı profili, iş ilanları ve yetenekler için `sentence-transformers` ile 384 boyutlu embedding vektörleri üretilir
- PostgreSQL `pgvector` uzantısı ile cosine similarity hesaplanır
- Geleneksel anahtar kelime eşleşmesinin ötesinde **anlam tabanlı** eşleştirme sağlar
- Örnek: "React" bilen kullanıcıya "Frontend Developer" ilanı, sadece "React" kelimesi geçmese bile semantik olarak önerilir

#### 3. Davranışsal Öğrenme (Behavioral Embedding)
- Kullanıcının ilan görüntüleme, başvuru ve kaydetme davranışları izlenir
- Her etkileşim farklı ağırlıkla (görüntüleme: 0.05, başvuru: 0.30, kaydetme: 0.15) kullanıcının davranış vektörüne eklenir
- Sistem, etkileşim sayısına göre statik profil embedding'i ile davranış embedding'ini **dinamik olarak harmanlıyor**:
  - 0-20 etkileşim: %90 statik + %10 davranış
  - 20-100 etkileşim: %70 statik + %30 davranış
  - 100-500 etkileşim: %50 statik + %50 davranış
  - 500+ etkileşim: %40 statik + %60 davranış
- Kullanıcı sistemi kullandıkça öneriler giderek kişiselleşir

#### 4. Çok Parametreli Eşleşme Motoru (MatchEngine)
Bir kullanıcının bir iş ilanıyla ne kadar uyumlu olduğunu 11 farklı parametre üzerinden hesaplar:

| Parametre | Açıklama |
|-----------|----------|
| **Yetenek Uyumu** | Kullanıcı yeteneklerinin ilan gereksinimleriyle semantic + exact match karşılaştırması |
| **Deneyim Uyumu** | Toplam iş deneyimi yılını ilan beklentisiyle karşılaştırır |
| **İçerik Eşleşmesi (AI)** | Profil embedding'i ile ilan embedding'i cosine similarity skoru |
| **Eğitim** | Kullanıcının en yüksek eğitim seviyesini ilan şartıyla karşılaştırır |
| **Lokasyon** | Şehir eşleşmesi + tercih edilen şehirler |
| **Çalışma Şekli** | Remote/hybrid/onsite tercihi eşleşmesi |
| **Maaş** | Kullanıcı minimum beklentisi ile ilan maksimum maaşı karşılaştırması |
| **Dil** | Yabancı dil seviyesi uyumu |
| **Askerlik** | Askerlik durumu şartı karşılaştırması |
| **Çalışma Saatleri** | Haftalık çalışma saati tercihleri |
| **Başarı Skoru Bonusu** | Kullanıcının geçmiş başarı geçmişine dayalı dinamik bonus |

**Dinamik Ağırlık Profilleri:** İlanın sektörüne göre parametrelerin ağırlıkları otomatik ayarlanır:
- **Teknoloji/Yazılım:** Yetenek %40, İçerik Eşleşmesi %20, Deneyim %8
- **Akademik:** Eğitim %20, İçerik %25, Dil %10
- **Satış/Perakende:** Lokasyon %18, Deneyim %15, Çalışma Saatleri %10
- **Mühendislik:** Yetenek %35, Deneyim %12, Eğitim %10

Tüm bilinen parametreler normalize edilmiş ağırlıklı ortalama ile birleştirilir; eksik veriler formülden çıkarılır — bilgisi olmayan kullanıcı cezalandırılmaz. Son skor 0-100 arasında raporlanır.

#### 5. Gemini Destekli Detaylı Uyum Raporu
- Kullanıcı bir iş ilanına girdiğinde "Yapay Zeka ile Analiz Et" butonu bulunur
- Gemini 2.5 Flash modeli, adayın tüm profil bilgilerini iş ilanının tüm gereksinimleriyle karşılaştırır
- Sonuç: eşleşen yetenekler, eksik yetenekler ve kişiselleştirilmiş kariyer tavsiyesi içeren **tam metin raporu**
- Çalışma saatleri uyumu, maaş aralığı uyumu ve istihdam türü uyumu da analize dahildir

---

### 👤 İş Arayan Özellikleri (Job Seeker)

- **Kişiselleştirilmiş Ana Sayfa:** Uyum skoruna göre sıralanmış önerilen ilanlar
- **Gelişmiş Arama ve Filtreleme:** Şehir, sektör, çalışma modeli, deneyim, eğitim, maaş, askerlik durumu, dil filtreleri
- **Otomatik Tamamlama:** Pozisyon, şirket ve sektör için Türkçe karakter desteği ile akıllı arama önerileri
- **İlan Detayı:** Tüm iş şartları, şirket bilgisi, benzer ilanlar, maaş aralığı, Yapay Zeka uyum analizi
- **Profil Yönetimi:** Eğitim, deneyim, projeler, sertifikalar, yetenekler, diller, tercihler — tümü ekleme/düzenleme/silme
- **CV Yönetimi:** PDF yükleme, AI ile otomatik okuma ve profil doldurma, CV görüntüleme, silme
- **Profil Doluluğu:** Profilin yüzde kaç dolu olduğunu gösteren canlı skor
- **Başvuru Takibi:** Başvurulan ilanların durumu (Değerlendirmede / Kabul / Reddedildi)
- **Favori İlanlar:** İlanları kaydetme ve kaydedilmiş ilanlar listesi
- **Kariyer Rehberi:** Mülakat teknikleri, CV hazırlama, kariyer gelişim makaleleri

---

### 🏢 İşveren Özellikleri (Employer)

- **İlan Yayınlama:** Detaylı iş ilanı oluşturma; pozisyon, açıklama, şehir(ler), maaş aralığı, çalışma modeli, gerekli yetenekler, çalışma saatleri, istihdam türü
- **İlan Yönetimi:** Yayınlanan ilanları listeleme, düzenleme, güncelleme
- **Başvuru Paneli:** İlana başvuran tüm adayları görüntüleme
- **Aday Profili Detayı:** Başvuran adayın tam profili: eğitim, deneyim, projeler, yetenekler
- **Uyum Skoru Görüntüleme:** Her başvuran adayın ilan ile uyum yüzdesini görme
- **Başvuru Durumu Güncelleme:** Adayı kabul etme veya reddetme
- **Şirket Profil Yönetimi:** Şirket açıklaması, logo, web sitesi, sektör bilgileri

---

### 🏛️ Admin Özellikleri

- Şirket doğrulama (onaylandı / beklemede / reddedildi)
- Kullanıcı ve ilan istatistikleri

---

## 🏗️ Mimari Genel Bakış

```
┌─────────────────────────────────────────────────────────────┐
│                    KariyerRotası Mimarisi                   │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  Web (Next)  │ Mobil (Expo) │  Backend API │   AI Service   │
│  Port: 3000  │  Expo Go     │  Port: 4000  │   Port: 8000   │
├──────────────┴──────────────┴──────┬───────┴────────────────┤
│                                    │                        │
│         PostgreSQL (pgvector)      │   Google Gemini API    │
│              Port: 5433            │   sentence-transformers│
└────────────────────────────────────┴────────────────────────┘
```

Tüm servisler Docker Compose ile orkestre edilir. Üretim ortamında backend container'ı içinde çalışır.

---

## 🛠️ Teknoloji Yığını

### Frontend (Web) — Next.js 15
| Teknoloji | Versiyon | Neden Seçildi |
|-----------|----------|----------------|
| **Next.js** | 15 | Server Components, App Router, SSR/CSR esnekliği, SEO optimizasyonu |
| **React** | 19 | Güncel Concurrent Features, Suspense desteği |
| **TypeScript** | 5.x | Tip güvenliği, büyük proje için bakım kolaylığı |
| **Zustand** | 5 | Basit, performanslı global state (auth, kullanıcı) |
| **Axios** | 1.x | HTTP istemcisi, interceptor desteği ile JWT yönetimi |
| **Lucide React** | — | Modern, hafif ve tutarlı ikon seti |
| **Vanilla CSS** | — | Tam kontrol, glassmorphism & gradient tasarım |

### Mobil — Expo / React Native
| Teknoloji | Versiyon | Neden Seçildi |
|-----------|----------|----------------|
| **Expo** | ~54 | iOS + Android + Web tek kod tabanı, hızlı geliştirme |
| **Expo Router** | ~6 | Dosya tabanlı navigasyon, web ile aynı routing mantığı |
| **React Native** | 0.81.5 | Native performans, gerçek platform bileşenleri |
| **Zustand** | 5 | Web ile aynı state yönetimi, AsyncStorage entegrasyonu |
| **Axios** | 1.x | Web ile aynı API istemcisi, token yönetimi |
| **react-native-chart-kit** | 6.x | Bar, Line, Pie chart desteği (şirket analitik sayfası) |
| **expo-image-picker** | 17 | Galeri erişimi, profil fotoğrafı yükleme |
| **expo-document-picker** | 14 | CV dosyası (PDF) seçme |
| **Lucide React Native** | 1.17 | Mobil uyumlu ikon seti |
| **React Hook Form + Zod** | — | Form yönetimi ve validasyon |

### Backend — NestJS
| Teknoloji | Versiyon | Neden Seçildi |
|-----------|----------|----------------|
| **NestJS** | 11 | Modüler mimari, decorator tabanlı, TypeScript-native |
| **Prisma ORM** | 7.4 | Tip-güvenli veritabanı sorguları, migration yönetimi |
| **PostgreSQL + pgvector** | 17 | ACID uyumlu relational DB + semantik vektör arama |
| **JWT (Passport)** | — | Stateless kimlik doğrulama, rol tabanlı erişim kontrolü |
| **Multer** | 2.x | Multipart form-data dosya yükleme (CV, avatar) |
| **Nodemailer** | 8 | E-posta doğrulama sistemi |
| **bcrypt** | 6 | Parola hashleme (salt rounds: 10) |
| **Axios** | 1.x | AI servis iletişimi (backend → Python) |

### Yapay Zeka Servisi — FastAPI (Python)
| Teknoloji | Versiyon | Neden Seçildi |
|-----------|----------|----------------|
| **FastAPI** | — | Yüksek performanslı Python API, async desteği, otomatik OpenAPI |
| **Google Gemini 2.5 Flash** | — | Düşük gecikme, yüksek kaliteli metin üretimi, JSON mode desteği |
| **sentence-transformers** | — | Yerel embedding üretimi, `all-MiniLM-L6-v2` modeli (384 boyut) |
| **pdfplumber** | — | PDF metin çıkarımı (OCR olmaksızın metin katmanlı PDF'ler) |
| **Pydantic** | — | Request/response tip doğrulama |
| **Uvicorn** | — | ASGI web sunucusu |

### Veritabanı
| Teknoloji | Neden Seçildi |
|-----------|----------------|
| **PostgreSQL 17** | Güçlü ACID uyumu, JSON desteği, gelişmiş indeksleme |
| **pgvector** | Native PostgreSQL vektör uzantısı, cosine similarity sorguları, 384-boyutlu embedding'ler |

### Altyapı
| Teknoloji | Kullanım |
|-----------|---------|
| **Docker + Docker Compose** | Tüm servislerin konteynerize çalışması |
| **pgvector/pgvector:pg17** | Vektör destekli PostgreSQL Docker imajı |

---

## 📁 Proje Yapısı

```
KariyerRotasi/
├── backend/                    # NestJS API Sunucusu
│   ├── src/
│   │   ├── ai/                 # AI servisiyle entegrasyon
│   │   ├── applications/       # Başvuru yönetimi
│   │   ├── auth/               # JWT kimlik doğrulama
│   │   ├── companies/          # Şirket CRUD
│   │   ├── jobs/               # İlan CRUD + MatchEngine + VectorUtils
│   │   │   ├── match-engine.ts # 11 parametreli eşleşme motoru
│   │   │   ├── vector-utils.ts # pgvector cosine similarity
│   │   │   └── evidence-scorer.ts # Yetenek kanıt skoru
│   │   ├── mail/               # E-posta servisi
│   │   ├── saved-jobs/         # Favori ilanlar
│   │   ├── skills/             # Yetenek yönetimi
│   │   ├── uploads/            # Dosya yükleme servisi
│   │   └── users/              # Kullanıcı profil yönetimi
│   └── prisma/
│       └── schema.prisma       # Veritabanı şeması (18 model)
│
├── frontend/                   # Next.js 15 Web Uygulaması
│   └── src/
│       └── app/
│           ├── page.tsx        # Ana sayfa (kişiselleştirilmiş öneriler)
│           ├── (auth)/         # Giriş & Kayıt sayfaları
│           ├── jobs/           # İlan listeleme + filtreleme
│           ├── job/[id]/       # İlan detayı + AI uyum analizi
│           ├── companies/      # Şirket listeleme
│           ├── company/[id]/   # Şirket detayı
│           ├── profile/        # Kullanıcı profil yönetimi
│           ├── career-guide/   # Kariyer rehberi makaleleri
│           └── employer/       # İşveren paneli
│               ├── page.tsx    # İlan listesi
│               ├── post-job/   # Yeni ilan oluşturma
│               ├── jobs/[id]/  # İlan düzenleme
│               └── applicants/ # Aday listesi + başvuru detayı
│
├── mobile/                     # Expo React Native Uygulaması
│   └── app/
│       ├── (auth)/             # Giriş & Kayıt
│       ├── (tabs)/             # Ana navigasyon tabları
│       │   ├── index.tsx       # Ana sayfa
│       │   ├── jobs.tsx        # İlanlar
│       │   ├── companies.tsx   # Şirketler
│       │   └── profile/        # Profil yönetimi
│       ├── (employer-tabs)/    # İşveren paneli tabları
│       ├── job/[id].tsx        # İlan detayı
│       ├── company/[id].tsx    # Şirket detayı + grafikler
│       ├── my-applications.tsx # Başvurularım
│       ├── saved-jobs.tsx      # Favori ilanlar
│       ├── settings.tsx        # Ayarlar & Gizlilik
│       └── career-guide/       # Kariyer rehberi
│
└── ai-service/                 # FastAPI Python AI Servisi
    └── app/
        ├── main.py             # API endpoint'leri
        └── services/
            ├── cv_parser.py    # PDF okuma + Gemini ayrıştırma
            ├── match_analyzer.py # Gemini eşleşme analizi
            └── embedding_service.py # sentence-transformers
```

---

## 🗄️ Veritabanı Modeli

```
User ──────────────────────────────────────────────┐
 │  id, name, email, role, cvUrl, avatarUrl         │
 │  role: job_seeker | individual_employer |         │
 │        corporate_employer | admin                │
 ├── UserProfile (1:1)                             │
 │    about, title, phone, birthDate, gender,      │
 │    militaryStatus, driverLicense, city,          │
 │    linkedinUrl, githubUrl, portfolioUrl          │
 │    embedding (vector 384) ← Semantik profil     │
 │    behavioralEmbedding (vector 384) ← Davranış  │
 ├── UserEducation[] ─ okul, derece, bölüm, tarih  │
 ├── UserExperience[] ─ şirket, unvan, tarih       │
 ├── UserProject[] ─ ad, açıklama, URL, teknolojiler│
 ├── UserCertification[] ─ ad, issuer, URL         │
 ├── UserLanguage[] ─ dil, seviye (A1-C2)          │
 ├── UserPreference (1:1) ─ maaş, şehir, workModel │
 ├── UserCV[] ─ versiyon, parsedData, mergePreview │
 ├── UserSkill[] ─ skillId + level + confidence    │
 ├── Application[] ─ iş başvuruları               │
 ├── SavedJob[] ─ favori ilanlar                   │
 └── AuditLog[] ─ profil değişiklik geçmişi        │
                                                   │
Company ──────────────────────────────────────────┤
 │  name, description, sector, logoUrl, website    │
 │  verificationStatus, taxNumber                  │
 └── Job[]                                        │
      │  title, description, city/cities,          │
      │  salaryMin/Max, workModel, experienceYears  │
      │  educationLevel, militaryStatus, language   │
      │  embedding (vector 384) ← Semantik ilan     │
      ├── JobSkill[] ─ ilanda aranan yetenekler    │
      ├── Application[]                            │
      └── SavedJob[]                               │
                                                   │
Skill ────────────────────────────────────────────┘
  name (unique), embedding (vector 384)
  ├── UserSkill[]
  └── JobSkill[]
```

**Önemli vektör alanları:**
- `user_profiles.embedding` → Kullanıcının statik profil vektörü
- `user_profiles.behavioral_embedding` → Kullanıcının davranış vektörü
- `jobs.embedding` → İlanın semantik vektörü
- `skills.embedding` → Her yeteneğin semantik vektörü

---

## 🌐 Web Uygulaması (Frontend)

### Sayfalar ve Özellikler

#### Ana Sayfa (`/`)
- **Kişiselleştirilmiş ilan önerileri:** Giriş yapan kullanıcıya uyum skoruna göre sıralanmış ilanlar, her ilanın yanında yeşil renkte yüzde uyum göstergesi
- **Gerçek zamanlı istatistikler:** Aktif ilan sayısı, şirket sayısı
- **Akıllı arama:** Türkçe karakter desteği, otomatik tamamlama
- **Populer aramalar:** Frontend, Backend, React Native, UI/UX
- **Deneyim seviyesine göre filtreleme:** Yeni Mezun → Yönetici
- **Öne çıkan sektörler:** En çok ilan yayınlayan sektörler
- **Lider şirketler:** Aktif işe alım yapan şirketlerin karusel görünümü
- **Kariyer zirvesi banner'ı:** Etkinlik duyurusu

#### İş İlanları (`/jobs`)
- Şehir, sektör, çalışma modeli, deneyim, eğitim, maaş, askerlik, dil filtreleri
- Sıralama: En yeni, en eski, en yüksek maaş, en düşük maaş, popüler, kişiye özel
- Kişiye özel sıralamada her ilanın uyum skoru gösterilir
- Sayfalama, yükleme skeleton'ları
- Arama önerileri (pozisyon adı, şirket adı, sektör)

#### İlan Detayı (`/job/[id]`)
- Tam iş ilanı açıklaması ve gereksinimleri
- Şirket bilgisi, logosu
- Gerekli yetenekler listesi
- Maaş aralığı (TRY/USD/EUR)
- Çalışma modeli, şehir, eğitim seviyesi, deneyim şartı
- **🤖 Yapay Zeka Uyum Analizi:** Profilini ilanla karşılaştıran tam metin rapor
  - Eşleşen yetenekler ve eksik yetenekler
  - Kişiselleştirilmiş kariyer tavsiyesi
  - Uyum skoru çemberi (görsel)
- Benzer ilanlar önerisi
- **Başvur** butonu (CV ile başvurma desteği)
- **Favorilere Ekle** butonu

#### Şirketler (`/companies`)
- Sektör bazlı filtreleme
- Arama desteği
- Her şirket kartında aktif ilan sayısı

#### Şirket Detayı (`/company/[id]`)
- Şirket hakkında, sektör, çalışan sayısı, web sitesi
- O şirkete ait tüm aktif ilanlar

#### Profil (`/profile`)
- **Profil doluluğu skoru** (canlı yüzde)
- **CV yönetimi:** Yükleme, AI ile okuma, görüntüleme, silme
- **Hakkımda** bölümü düzenleme
- **Eğitim:** Okul, derece, bölüm, tarih, not ortalaması — Ekleme/Düzenleme/Silme
- **Deneyim:** Şirket, unvan, lokasyon, tarih, açıklama — Ekleme/Düzenleme/Silme
- **Projeler:** İsim, açıklama, URL, teknolojiler, tarih — Ekleme/Düzenleme/Silme
- **Sertifikalar:** Ad, kurum, tarih, sertifika URL — Ekleme/Düzenleme/Silme
- **Yetenekler:** Ekleme/Silme
- **Diller:** Dil adı + seviye (A1-C2) — Ekleme/Düzenleme/Silme
- **Tercihler:** Minimum maaş, çalışma modeli, tercih edilen şehirler, istihdam türü
- **Kişisel bilgiler:** Doğum tarihi, cinsiyet, askerlik durumu, sürücü belgesi
- **Sosyal medya:** LinkedIn, GitHub, Portfolyo linkleri
- Başvurularım listesi
- Kaydedilen ilanlar listesi

#### Kariyer Rehberi (`/career-guide`)
- CV hazırlama ipuçları
- Mülakat teknikleri
- Kariyer gelişim makaleleri

#### İşveren Paneli (`/employer`)
- **Dashboard:** Yayınlanan ilanlar, toplam başvuru sayısı
- **İlan Yayınla:** (`/employer/post-job`) Pozisyon, açıklama, şehirler, maaş, çalışma modeli, yetenekler, saatler, istihdam türü
- **İlan Düzenleme:** Mevcut ilanları güncelleme
- **Başvuranlar:** (`/employer/applicants/[jobId]`) İlana başvuran tüm adaylar, her aday için uyum skoru
- **Aday Detayı:** (`/employer/applicant-detail/[applicationId]`) Adayın tam profili, CV, başvuruyu kabul/reddetme

#### Kimlik Doğrulama
- Kayıt (iş arayan / bireysel işveren / kurumsal işveren)
- Giriş
- E-posta doğrulama (SMTP)

---

## 📱 Mobil Uygulama

Expo ile geliştirilen mobil uygulama, web ile aynı backend'i kullanır ve tüm özellikler mobil deneyime uyarlanmıştır.

### Navigasyon Yapısı

```
(auth)/
  ├── login.tsx          ← Giriş ekranı
  └── register.tsx       ← Kayıt ekranı

(tabs)/                  ← İş arayan tabları
  ├── index.tsx          ← Ana sayfa
  ├── jobs.tsx           ← İlanlar listesi
  ├── companies.tsx      ← Şirketler listesi
  └── profile/
      ├── index.tsx      ← Profil görüntüleme + düzenleme
      └── edit.tsx       ← Kişisel bilgileri düzenleme

(employer-tabs)/         ← İşveren tabları
  ├── index.tsx          ← İşveren paneli
  └── post-job.tsx       ← İlan yayınlama

job/[id].tsx             ← İlan detayı
company/[id].tsx         ← Şirket detayı + grafikler
my-applications.tsx      ← Başvurularım
saved-jobs.tsx           ← Favori ilanlar
settings.tsx             ← Ayarlar & Gizlilik
career-guide/            ← Kariyer rehberi
```

### Mobil Ekranlar ve Özellikler

#### Ana Sayfa
- KariyerRotası logosu ve navigasyon
- "Sizin İçin Seçilen İlanlar" — uyum skoru yeşil badge ile gösterilir
- Lider şirketler yatay karusel
- Deneyim seviyesine göre iş ara
- Öne çıkan sektörler ızgarası
- En yeni ilanlar

#### İlanlar Ekranı
- Tam metin arama (Türkçe karakter desteği)
- Filtre modalı: Şehir, sektör, çalışma modeli, deneyim, eğitim, maaş, askerlik, dil
- Sıralama modal: En yeni, en eski, maaş, kişiye özel
- Sayfalama (önceki/sonraki)
- Her ilan kartında uyum skoru göstergesi (varsa)

#### İlan Detayı
- Tüm ilan bilgileri
- **Yapay Zeka Uyum Analizi** (web ile aynı)
- Başvur butonu
- Favorilere ekle

#### Şirketler Ekranı
- Sektör bazlı filtreleme
- Arama

#### Şirket Detayı
- Şirket bilgisi ve açıklaması
- **Analitik Grafikler** (react-native-chart-kit):
  - Departman dağılımı (Bar chart)
  - Çalışan sayısı dağılımı (Pie chart)
  - Yıllara göre işe alım trendi (Line chart)
  - Mezuniyet bölümleri dağılımı (Bar chart)
  - Eğitim seviyesi dağılımı (Pie chart)
- Şirketin tüm ilanları
- Benzer şirketler

#### Profil Ekranı
- Profil fotoğrafı (galeri erişimi, avatar yükleme)
- CV yükleme + AI okuma
- Profil doluluğu çubuğu
- Tüm bölümlerin düzenlenmesi (modaller aracılığıyla):
  - Hakkımda, Eğitim, Deneyim, Projeler, Sertifikalar, Yetenekler, Diller, Tercihler
- İletişim & kişisel bilgiler
- Sosyal medya linkleri
- Başvurularım ve Favorilerim navigasyon linkleri
- Çıkış Yap

#### Başvurularım
- Başvuru durum filtresi: Hepsi / Değerlendirmede / Kabul / Reddedildi
- Her başvuru: Şirket logosu, pozisyon, tarih, durum badge'i
- İlan detayına yönlendirme

#### Favori İlanlar
- Kaydedilen tüm ilanlar listesi

#### Ayarlar & Gizlilik
- Bildirim tercihleri (toggle)
- Karanlık mod (yakında)
- Uygulama dili
- Şifre değiştirme
- Gizlilik politikası / Kullanım koşulları
- Çıkış Yap
- Hesap silme

---

## ⚙️ Backend API

### API Endpoint'leri

#### Kimlik Doğrulama (`/api/auth`)
```
POST /api/auth/register      ← Yeni kullanıcı kaydı
POST /api/auth/login         ← Giriş, JWT token döner
POST /api/auth/verify-email  ← E-posta doğrulama kodu
GET  /api/auth/me            ← Mevcut kullanıcı bilgisi
```

#### Kullanıcı & Profil (`/api/users`)
```
GET    /api/users/me                         ← Tam profil (tüm ilişkilerle)
PATCH  /api/users/me                         ← Ad, email güncelle
PATCH  /api/users/me/profile                 ← Profil detayları güncelle
POST   /api/users/me/avatar                  ← Profil fotoğrafı yükle
POST   /api/users/me/upload-cv               ← CV yükle (AI parsing ile)
DELETE /api/users/me/cv                      ← CV sil

POST   /api/users/me/education               ← Eğitim ekle
PATCH  /api/users/me/education/:id           ← Eğitim güncelle
DELETE /api/users/me/education/:id           ← Eğitim sil

POST   /api/users/me/experience              ← Deneyim ekle
PATCH  /api/users/me/experience/:id          ← Deneyim güncelle
DELETE /api/users/me/experience/:id          ← Deneyim sil

POST   /api/users/me/project                 ← Proje ekle
PATCH  /api/users/me/project/:id             ← Proje güncelle
DELETE /api/users/me/project/:id             ← Proje sil

POST   /api/users/me/certification           ← Sertifika ekle
PATCH  /api/users/me/certification/:id       ← Sertifika güncelle
DELETE /api/users/me/certification/:id       ← Sertifika sil

POST   /api/users/me/language                ← Dil ekle
PATCH  /api/users/me/language/:id            ← Dil güncelle
DELETE /api/users/me/language/:id            ← Dil sil

POST   /api/users/me/skill                   ← Yetenek ekle
DELETE /api/users/me/skill/:id               ← Yetenek sil

PATCH  /api/users/me/preferences             ← Tercihler güncelle
```

#### İş İlanları (`/api/jobs`)
```
GET  /api/jobs                    ← İlanlar (filtre + sayfalama + skor)
GET  /api/jobs/discover           ← Kişiselleştirilmiş öneriler
GET  /api/jobs/:id                ← İlan detayı (görüntüleme sayacı + davranış kaydı)
GET  /api/jobs/similar/:id        ← Benzer ilanlar
GET  /api/jobs/stats/total        ← Toplam ilan sayısı
GET  /api/jobs/stats/top-sectors  ← Öne çıkan sektörler
GET  /api/jobs/autocomplete       ← Otomatik tamamlama önerileri
POST /api/jobs                    ← İlan oluştur (işveren)
PATCH /api/jobs/:id               ← İlan güncelle (işveren)
```

#### Şirketler (`/api/companies`)
```
GET  /api/companies               ← Şirketler listesi (sektör filtresi)
GET  /api/companies/top           ← En çok ilan yayınlayan şirketler
GET  /api/companies/:id           ← Şirket detayı
PATCH /api/companies/:id          ← Şirket güncelle
```

#### Başvurular (`/api/applications`)
```
POST /api/applications            ← Başvur (opsiyonel CV eki)
GET  /api/applications/me         ← Kendi başvurularım
GET  /api/applications/job/:jobId ← İlana gelen başvurular (işveren)
PATCH /api/applications/:id/status ← Başvuru durumu güncelle
```

#### Kaydedilen İlanlar (`/api/saved-jobs`)
```
POST   /api/saved-jobs/:jobId  ← Favorilere ekle
DELETE /api/saved-jobs/:jobId  ← Favorilerden çıkar
GET    /api/saved-jobs/me      ← Favori ilanlarım
```

#### AI Entegrasyonu (`/api/ai`)
```
POST /api/ai/analyze-match   ← Profil-ilan uyum analizi (Gemini)
```

---

## 🤖 Yapay Zeka Servisi

### Endpoint'ler (Port: 8000)

#### `/parse-cv` (POST)
PDF CV dosyasını alır, iki aşamalı işler:
1. **pdfplumber** ile PDF'den ham metin çıkarır
2. **Gemini 2.5 Flash** ile metni yapılandırılmış JSON'a dönüştürür:
   ```json
   {
     "name": "...",
     "email": "...",
     "phone": "...",
     "education": [...],
     "experience": [...],
     "skills": [...],
     "languages": [...],
     "certifications": [...],
     "projects": [...]
   }
   ```

#### `/analyze-match` (POST)
Kullanıcı profili ve iş ilanı detaylarını alır, Gemini 2.5 Flash ile İK perspektifli analiz yapar:
```json
{
  "matchedSkills": ["React", "TypeScript"],
  "missingSkills": ["Docker", "Kubernetes"],
  "recommendation": "Profiliniz bu pozisyon için güçlü bir uyum gösteriyor..."
}
```

#### `/embed` (POST)
Metin girdisini `sentence-transformers (all-MiniLM-L6-v2)` modeli ile 384 boyutlu embedding vektörüne çevirir. Backend'in yeni ilan ve profil embeddingi oluşturması için kullanılır.

---

## 🚀 Kurulum ve Çalıştırma

### Ön Gereksinimler
- Docker Desktop
- Node.js 20+
- Python 3.11+ (AI servisi için, Docker olmadan çalıştırılacaksa)
- Expo Go (mobil test için)

### Docker ile Tüm Servisleri Başlatma (Önerilen)

```bash
# 1. Repository'yi klonla
git clone https://github.com/kullanici-adi/KariyerRotasi.git
cd KariyerRotasi

# 2. Çevre değişkenlerini ayarla
cp backend/.env.example backend/.env
# backend/.env içinde DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, SMTP ayarlarını doldur
# ai-service/.env içinde GEMINI_API_KEY'i doldur

# 3. Docker volume oluştur (ilk kurulumda)
docker volume create kariyerrotasi-pgdata

# 4. Tüm servisleri başlat
docker compose up -d

# 5. Veritabanı migrasyonunu çalıştır
docker exec kariyerrotasi-backend npx prisma migrate deploy

# 6. (Opsiyonel) Seed verisi yükle
docker exec kariyerrotasi-backend npm run seed
```

Servisler:
- 🌐 Web: http://localhost:3000
- ⚙️ API: http://localhost:4000/api
- 🤖 AI: http://localhost:8000
- 🗄️ DB: localhost:5433

---

### Manuel Kurulum (Geliştirme)

#### Backend
```bash
cd backend
npm install
cp .env.example .env   # Değerleri doldur
npx prisma migrate dev
npm run start:dev      # Port: 4000
```

#### Web Frontend
```bash
cd frontend
npm install
npm run dev            # Port: 3000
```

#### Mobil Uygulama
```bash
cd mobile
npm install
npx expo start

# Expo Go ile taramak için QR kodu kullan
# Android: expo start --android
# iOS: expo start --ios
```

#### AI Servisi
```bash
cd ai-service
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # GEMINI_API_KEY ekle
uvicorn app.main:app --reload --port 8000
```

---

## 🔐 Çevre Değişkenleri

### `backend/.env`
```env
DATABASE_URL=postgresql://postgres:kariyersifre@localhost:5433/kariyerrotasi?schema=public
JWT_SECRET=your_jwt_secret_here
AI_SERVICE_URL=http://localhost:8000

# SMTP (E-posta doğrulama)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### `ai-service/.env`
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://postgres:kariyersifre@localhost:5433/kariyerrotasi?schema=public
```

### `frontend/.env.local`
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### `mobile` — `lib/config.ts`
```typescript
export const API_BASE_URL = 'http://YOUR_LOCAL_IP:4000/api';
```

---

## 🔒 Güvenlik

- JWT tabanlı kimlik doğrulama (Bearer token)
- Parola bcrypt ile hashlenmiş (salt rounds: 10)
- Rol tabanlı erişim kontrolü (job_seeker / individual_employer / corporate_employer / admin)
- E-posta doğrulama (kayıt sonrası 6 haneli kod)
- Dosya boyutu sınırı (CV: 5MB, Avatar: 2MB)

---

## 📊 Projenin Diğer Platformlardan Farkı

| Özellik | LinkedIn | Kariyer.net | **KariyerRotası** |
|---------|----------|-------------|-------------------|
| Yapay zeka eşleşme motoru | ✅ (kara kutu) | ❌ | ✅ **Şeffaf 11 parametre** |
| CV otomatik okuma | ❌ | ❌ | ✅ **Gemini AI** |
| Semantik vektör arama | ✅ | ❌ | ✅ **pgvector** |
| Davranışsal öğrenme | ✅ | ❌ | ✅ **Etkileşim bazlı** |
| Açık kaynak / incelenebilir algoritma | ❌ | ❌ | ✅ |
| Mobil uygulama | ✅ | ✅ | ✅ **iOS + Android** |
| Yetenek kanıt skoru | ❌ | ❌ | ✅ **Evidence Scorer** |
| Detaylı uyum raporu (metin) | ❌ | ❌ | ✅ **Gemini analizi** |
| Türkçe karakter arama | ✅ | ✅ | ✅ **Çok varyantlı** |

---

## 📄 Lisans

Bu proje özel lisanslıdır. Tüm hakları saklıdır.

---

*KariyerRotası — Yapay zeka ile kariyerine yön ver.*
