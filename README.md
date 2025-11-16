# AI Translate Field

Bu proje, çoklu dil desteği ile metin çevirisi yapabilen bir Next.js uygulamasıdır. Sistem, üç farklı çeviri API'sini kullanarak yüksek başarı oranı ve güvenilirlik sağlar.

## 🚀 Özellikler

- **Çoklu API Desteği**: Gemini AI, Free Translate API ve RapidAPI OpenL Translate entegrasyonu
- **Akıllı Fallback Mekanizması**: Bir API başarısız olursa otomatik olarak diğerine geçiş
- **Çoklu Dil Çevirisi**: Tek bir istekle birden fazla dile çeviri yapabilme
- **Otomatik Dil Algılama**: Kaynak dil otomatik olarak algılanabilir
- **CORS Desteği**: Güvenli cross-origin istekleri için yapılandırılmış CORS
- **Timeout Koruması**: 25 saniyelik genel timeout ve her API için özel timeout'lar
- **Hata Yönetimi**: Kapsamlı hata yakalama ve kullanıcı dostu hata mesajları

## 📋 Gereksinimler

- Node.js 18+ 
- npm, yarn, pnpm veya bun
- Gemini API Key (çeviri için)

## 🛠️ Kurulum

1. Projeyi klonlayın:
```bash
git clone <repository-url>
cd ai-translate-field/Frontend
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
`.env.local` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:
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

## 🔧 Translate API Sistemi

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
Frontend/
├── app/
│   ├── api/
│   │   ├── translate/
│   │   │   └── route.ts      # Translate API endpoint
│   │   └── detect/
│   │       └── route.ts      # Dil algılama endpoint
│   ├── components/
│   │   └── TranslateField.tsx # Çeviri bileşeni
│   ├── projects/
│   │   └── page.tsx          # Projeler sayfası
│   └── page.tsx              # Ana sayfa
├── public/                   # Statik dosyalar
└── README.md                 # Bu dosya
```

## 🔐 Güvenlik

- API anahtarları ortam değişkenlerinde saklanır
- CORS whitelist ile sadece yetkili origin'lerden istek kabul edilir
- Tüm API çağrıları timeout koruması altındadır
- Hata mesajları hassas bilgi içermez

## 🚀 Deployment

### Vercel'de Deploy

1. Projeyi Vercel'e bağlayın
2. Ortam değişkenlerini ekleyin:
   - `GEMINI_API_KEY`: Gemini API anahtarınız
   - `RAPIDAPI_KEY`: RapidAPI anahtarınız
3. Deploy edin

### Ortam Değişkenleri

Production ortamında aşağıdaki ortam değişkenlerini ayarlayın:

```env
GEMINI_API_KEY=your_gemini_api_key_here
RAPIDAPI_KEY=your_rapidapi_key_here
```

## 📝 Kullanım Örneği

```typescript
// Frontend'den API çağrısı
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

### Gemini API Hatası
- `GEMINI_API_KEY` ortam değişkeninin doğru ayarlandığından emin olun
- API anahtarının geçerli olduğunu kontrol edin

### CORS Hatası
- İstek yapılan origin'in whitelist'te olduğundan emin olun
- OPTIONS isteğinin başarılı olduğunu kontrol edin

### Timeout Hatası
- İnternet bağlantınızı kontrol edin
- API'lerin erişilebilir olduğundan emin olun
- Daha kısa metinlerle deneyin

## 📚 Kaynaklar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Gemini API Dokümantasyonu](https://ai.google.dev/docs)
- [RapidAPI OpenL Translate](https://rapidapi.com/opentranslate/api/openl-translate)

## 📄 Lisans

Bu proje özel bir projedir.
