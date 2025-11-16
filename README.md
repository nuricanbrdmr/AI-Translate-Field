# AI Translate Field

Bu proje, çoklu dil desteği ile metin çevirisi yapabilen bir Next.js uygulamasıdır. Sistem, üç farklı çeviri API'sini kullanarak yüksek başarı oranı ve güvenilirlik sağlar.

## 🚀 Özellikler

### Frontend
- **Çoklu API Desteği**: Gemini AI, Free Translate API ve RapidAPI OpenL Translate entegrasyonu
- **Akıllı Fallback Mekanizması**: Bir API başarısız olursa otomatik olarak diğerine geçiş
- **Çoklu Dil Çevirisi**: Tek bir istekle birden fazla dile çeviri yapabilme
- **Otomatik Dil Algılama**: Kaynak dil otomatik olarak algılanabilir
- **CORS Desteği**: Güvenli cross-origin istekleri için yapılandırılmış CORS
- **Timeout Koruması**: 25 saniyelik genel timeout ve her API için özel timeout'lar
- **Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı dostu hata mesajları

### Backend
- **RESTful API**: Express.js tabanlı modern REST API
- **MongoDB Entegrasyonu**: Mongoose ile veritabanı yönetimi
- **Çoklu Dil Proje Yönetimi**: Projeler için çoklu dil desteği (i18n)
- **CRUD İşlemleri**: Proje oluşturma, listeleme, güncelleme ve silme
- **CORS Desteği**: Frontend ile güvenli iletişim
- **Esnek Veri Yapısı**: Map tabanlı çoklu dil alanları

## 📋 Gereksinimler

- Node.js 18+ 
- npm, yarn, pnpm veya bun
- MongoDB (yerel veya MongoDB Atlas)
- Gemini API Key (çeviri için)

## 🛠️ Kurulum

### Frontend Kurulumu

1. Projeyi klonlayın:
```bash
git clone https://github.com/nuricanbrdmr/AI-Translate-Field.git
cd AI-Translate-Field/Frontend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

3. Ortam değişkenlerini ayarlayın:
`Frontend/.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
```env
GEMINI_API_KEY=your_gemini_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

### Backend Kurulumu

1. Backend klasörüne gidin:
```bash
cd AI-Translate-Field/Backend
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
# veya
pnpm install
```

3. Ortam değişkenlerini ayarlayın:
`Backend/.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

**MongoDB Connection String Örnekleri:**
- Yerel MongoDB: `mongodb://localhost:27017/ai-translate-field`
- MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/ai-translate-field?retryWrites=true&w=majority`

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
# veya
pnpm dev
```

5. Backend API [http://localhost:4000](http://localhost:4000) adresinde çalışacaktır.

## 🔧 Backend API Sistemi

### Proje Yönetimi API Endpoints

Backend, proje yönetimi için RESTful API sağlar. Tüm endpoint'ler `/api/project` prefix'i ile başlar.

#### 1. Proje Oluşturma

**POST** `/api/project/add`

Yeni bir proje oluşturur. Çoklu dil desteği ile title ve description alanları desteklenir.

**İstek Formatı:**
```json
{
  "title": "Proje Başlığı",  // veya { "tr": "Başlık", "en": "Title" }
  "description": "Proje açıklaması",  // veya { "tr": "Açıklama", "en": "Description" }
  "title_i18n": { "en": "Title", "de": "Titel" },  // Opsiyonel: Ek dil desteği
  "description_i18n": { "en": "Description", "de": "Beschreibung" },  // Opsiyonel
  "ranking": 1,
  "link": "https://example.com",
  "technologies": ["React", "Node.js", "MongoDB"],  // veya "React,Node.js,MongoDB"
  "image": "https://example.com/image.jpg"  // Opsiyonel
}
```

**Yanıt Formatı:**
```json
{
  "success": true,
  "message": "Project Added"
}
```

#### 2. Proje Listeleme

**GET** `/api/project/list`

Tüm projeleri listeler.

**Yanıt Formatı:**
```json
{
  "success": true,
  "projects": [
    {
      "_id": "project_id",
      "title": { "tr": "Başlık", "en": "Title" },
      "description": { "tr": "Açıklama", "en": "Description" },
      "ranking": 1,
      "link": "https://example.com",
      "technologies": ["React", "Node.js"],
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

#### 3. Proje Güncelleme

**PUT** `/api/project/update/:id`

Mevcut bir projeyi günceller.

**İstek Formatı:**
```json
{
  "title": { "tr": "Yeni Başlık", "en": "New Title" },  // Opsiyonel
  "description": { "tr": "Yeni Açıklama", "en": "New Description" },  // Opsiyonel
  "ranking": 2,  // Opsiyonel
  "link": "https://newlink.com",  // Opsiyonel
  "technologies": ["Vue.js", "Express"]  // Opsiyonel
}
```

**Yanıt Formatı:**
```json
{
  "success": true,
  "message": "Project Updated Successfully",
  "project": { /* güncellenmiş proje objesi */ }
}
```

#### 4. Proje Silme

**DELETE** `/api/project/remove/:id`

Bir projeyi siler.

**Yanıt Formatı:**
```json
{
  "success": true,
  "message": "Project removed success"
}
```

### Veri Modeli

**Project Schema:**
- `title` (Map): Çoklu dil başlık alanı, örn: `{ "tr": "Başlık", "en": "Title" }`
- `description` (Map): Çoklu dil açıklama alanı, örn: `{ "tr": "Açıklama", "en": "Description" }`
- `ranking` (Number): Proje sıralaması
- `link` (String): Proje linki
- `technologies` (Array): Kullanılan teknolojiler listesi
- `image` (String, Opsiyonel): Proje görseli URL'i

### Çoklu Dil Desteği

Backend, projeler için esnek çoklu dil desteği sağlar:
- `title` ve `description` alanları Map tipinde saklanır
- Her dil kodu için ayrı değer saklanabilir (tr, en, de, fr, vb.)
- Hem string hem de object formatında veri kabul edilir
- Güncelleme işlemlerinde mevcut diller korunur, yeni diller eklenir

## 🔧 Frontend Translate API Sistemi

### API Endpoint

**POST** `/api/translate`

### İstek Formatı

```json
{
  "text": "Çevrilecek metin",
  "targetLangs": ["en", "de", "fr", "ar"],
  "sourceLang": "auto" // veya "tr", "en" gibi spesifik dil kodu
}
```

### Yanıt Formatı

```json
{
  "en": "Translated text in English",
  "de": "Übersetzter Text auf Deutsch",
  "fr": "Texte traduit en français",
  "ar": "النص المترجم بالعربية"
}
```

### Çeviri API'leri ve Özellikleri

#### 1. **Gemini AI** (Birincil)
- **Model**: `gemini-2.5-flash`
- **Timeout**: 8 saniye
- **Özellikler**:
  - Çoklu dil çevirisi (tek istekle tüm diller)
  - Yüksek kaliteli, doğal çeviriler
  - Terminoloji koruması
  - Otomatik dil algılama
- **Gereksinim**: `GEMINI_API_KEY` ortam değişkeni

#### 2. **Free Translate API** (Fallback 1)
- **Endpoint**: `https://ftapi.pythonanywhere.com/translate`
- **Timeout**: 5 saniye
- **Özellikler**:
  - Ücretsiz kullanım
  - Hızlı yanıt süresi
  - Otomatik dil algılama desteği

#### 3. **RapidAPI OpenL Translate** (Fallback 2)
- **Endpoint**: `https://openl-translate.p.rapidapi.com/translate/bulk`
- **Timeout**: 5 saniye
- **Özellikler**:
  - Bulk çeviri desteği
  - Yüksek güvenilirlik
  - Geniş dil desteği
- **Gereksinim**: `RAPIDAPI_KEY` ortam değişkeni

### Çeviri Akışı

1. **İlk Deneme**: Gemini AI ile tüm hedef diller için çeviri yapılır
2. **Eksik Diller**: Gemini'den sonuç alınamayan diller için:
   - Önce Free Translate API denenir
   - Başarısız olursa RapidAPI OpenL Translate denenir
3. **Sonuç**: Tüm diller için çeviri sonuçları döndürülür (başarısız olanlar boş string olarak)


### Timeout Yönetimi

- **Genel Timeout**: 25 saniye (tüm işlem için)
- **Gemini AI Timeout**: 8 saniye
- **Free Translate API Timeout**: 5 saniye
- **RapidAPI Timeout**: 5 saniye

Timeout durumunda, mevcut sonuçlar kullanıcıya döndürülür ve bir uyarı mesajı eklenir.

### Hata Yönetimi

Sistem aşağıdaki hata durumlarını yönetir:

- **400 Bad Request**: Metin parametresi eksik veya geçersiz
- **500 Internal Server Error**: Genel hata durumu
- **504 Gateway Timeout**: İstek zaman aşımına uğradı

## 📁 Proje Yapısı

```
AI-Translate-Field/
├── Frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── translate/
│   │   │   │   └── route.ts      # Translate API endpoint
│   │   │   └── detect/
│   │   │       └── route.ts      # Dil algılama endpoint
│   │   ├── components/
│   │   │   └── TranslateField.tsx # Çeviri bileşeni
│   │   ├── projects/
│   │   │   └── page.tsx          # Projeler sayfası
│   │   └── page.tsx              # Ana sayfa
│   ├── public/                   # Statik dosyalar
│   └── package.json
│
├── Backend/
│   ├── config/
│   │   └── mongodb.js            # MongoDB bağlantı yapılandırması
│   ├── controllers/
│   │   └── projectController.js  # Proje CRUD işlemleri
│   ├── models/
│   │   └── Project.js            # Proje Mongoose modeli
│   ├── routes/
│   │   └── projectRoute.js       # Proje route tanımlamaları
│   ├── index.js                  # Express server giriş noktası
│   └── package.json
│
└── README.md                     # Bu dosya
```

## 🔐 Güvenlik

### Frontend
- API anahtarları ortam değişkenlerinde saklanır
- CORS whitelist ile sadece yetkili origin'lerden istek kabul edilir
- Tüm API çağrıları timeout koruması altındadır
- Hata mesajları hassas bilgi içermez

### Backend
- MongoDB connection string ortam değişkeninde saklanır
- CORS middleware ile güvenli cross-origin istekleri
- Express.js güvenlik best practices
- Mongoose ile veri doğrulama ve sanitization

## 🚀 Deployment

### Frontend - Vercel'de Deploy

1. Frontend klasörünü Vercel'e bağlayın
2. Ortam değişkenlerini ekleyin:
   - `GEMINI_API_KEY`: Gemini API anahtarınız
   - `RAPIDAPI_KEY`: RapidAPI anahtarınız
3. Deploy edin

### Ortam Değişkenleri

**Frontend (.env.local):**
```env
GEMINI_API_KEY=your_gemini_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

**Backend (.env):**
```env
MONGODB_URI=your_mongodb_connection_string
PORT=4000
```

**Production Ortam Değişkenleri:**
- Frontend için Vercel Environment Variables
- Backend için seçtiğiniz platformun Environment Variables ayarları

## 📝 Kullanım Örnekleri

### Frontend - Translate API

```typescript
// Frontend'den çeviri API çağrısı
const response = await fetch('/api/translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Merhaba dünya',
    targetLangs: ['en', 'de', 'fr'],
    sourceLang: 'tr'
  })
});

const translations = await response.json();
console.log(translations);
// {
//   "en": "Hello world",
//   "de": "Hallo Welt",
//   "fr": "Bonjour le monde"
// }
```

## 🐛 Sorun Giderme

### Frontend Sorunları

**Gemini API Hatası:**
- `GEMINI_API_KEY` ortam değişkeninin doğru ayarlandığından emin olun
- API anahtarının geçerli olduğunu kontrol edin

**CORS Hatası:**
- İstek yapılan origin'in whitelist'te olduğundan emin olun
- OPTIONS isteğinin başarılı olduğunu kontrol edin

**Timeout Hatası:**
- İnternet bağlantınızı kontrol edin
- API'lerin erişilebilir olduğundan emin olun
- Daha kısa metinlerle deneyin

## 📚 Kaynaklar

### Frontend
- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Gemini API Dokümantasyonu](https://ai.google.dev/docs)
- [RapidAPI OpenL Translate](https://rapidapi.com/opentranslate/api/openl-translate)

### Backend
- [Express.js Dokümantasyonu](https://expressjs.com/)
- [Mongoose Dokümantasyonu](https://mongoosejs.com/docs/)
- [MongoDB Dokümantasyonu](https://www.mongodb.com/docs/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

## 📄 Lisans

Bu proje özel bir projedir.
