# 🐾 PodoTrace: Ankara İstihbarat Paneli

> **Dağınık verileri tutarlı bir ürün deneyimine dönüştüren gerçek zamanlı istihbarat analiz platformu**

PodoTrace, çoklu kaynaklardan gelen yapılandırılmamış istihbarat verilerini (sightings, messages, check-ins, anonymous tips) tek bir kohesif arayüzde birleştirerek, operasyonel istihbarat analizini görselleştirir ve hızlandırır.

---

## 🎯 Vizyon

Modern istihbarat operasyonlarında en büyük zorluk, dağınık ve heterojen veri kaynaklarını anlamlı bir bütüne dönüştürmektir. PodoTrace, bu sorunu çözmek için tasarlanmış bir **Intelligence Dashboard** olarak:

- **Scattered Clues → Coherent Experience**: Farklı form kaynaklarından gelen verileri normalize eder ve tek bir görünümde sunar
- **Spatial-Temporal Intelligence**: Zaman ve mekan korelasyonlarını otomatik tespit eder
- **Entity Resolution**: Farklı yazım varyasyonlarını (Kağan/kagan/k.) tek bir varlığa indirger
- **Interactive Analysis**: Kullanıcının veriyle etkileşimini merkeze alarak keşif odaklı bir deneyim sunar

---

## ✨ Teknik Özellikler

### 🔗 Entity Linking & Name Normalization
```javascript
// Farklı yazım varyasyonlarını tek bir canonical forma indirger
normalizeName("k.yılmaz") → "KAĞAN"
normalizeName("kagan a.") → "KAĞAN"
normalizeName("Kağan")    → "KAĞAN"
```
- **Fuzzy matching** ile alias tespiti
- **Invalid name filtering** (lokasyon isimlerini kişi olarak algılamayı önler)
- **Turkish locale support** ile doğru büyük/küçük harf dönüşümü

### 📍 Spatial-Temporal Analysis
```javascript
// 15 dakika içinde aynı lokasyonda olan kayıtları tespit eder
if (timeDiff < 15min && location === sameLocation) {
  → "Proximity Alert" göster
}
```
- **Temporal proximity detection**: Zaman yakınlığı analizi
- **Location clustering**: GPS koordinatlarına göre gruplama
- **Co-occurrence analysis**: Podo ile şüphelilerin ortak görülme analizi

### 🎯 Focus Mode
Bir şüpheli seçildiğinde:
- **Harita filtreleme**: Sadece seçili kişinin lokasyonları gösterilir
- **Timeline filtering**: İlgili kayıtlar vurgulanır
- **Connection analytics**: Podo ile bağlantı skorları hesaplanır
- **Alias aggregation**: Tüm kullanılan isim varyasyonları listelenir

### 🗺️ Interactive Map Intelligence
- **Leaflet.js** tabanlı interaktif harita
- **Marker clustering** ile lokasyon yoğunluğu görselleştirmesi
- **Click-to-filter**: Harita marker'larına tıklayarak filtreleme
- **Real-time legend**: Dinamik gösterge sistemi

### 📊 Top 3 Suspects Panel
- **Suspicion scoring**: Kayıt sayısına göre otomatik skor hesaplama
- **Color-coded badges**: Risk seviyesine göre renk kodlaması
  - 🔴 6+ puan: Yüksek risk (kırmızı)
  - 🟡 3-5 puan: Orta risk (sarı)
  - 🟢 1-2 puan: Düşük risk (yeşil)
- **Progress bars**: Görsel skor karşılaştırması

---

## 🎨 UI/UX Architecture

### Atomic Design System
```
Atoms (Button, StatusBadge, SearchInput)
  ↓
Molecules (Toast, SkeletonLoader, ErrorState)
  ↓
Organisms (MapView, Timeline, Sidebar)
  ↓
Templates (PodoApp Layout)
```

### Reusable UI Components
- **`<Button />`**: Variant-based button system (primary, ghost, danger)
- **`<StatusBadge />`**: Type-aware badge component with dot indicators
- **`<SearchInput />`**: Accessible search with icon integration
- **`<Toast />`**: Context-based notification system
- **`<SkeletonLoader />`**: Content loading states
- **`<ErrorState />`**: Error boundary with retry mechanism
- **`<EmptyState />`**: Zero-state handling

### Accessibility (A11y)
- ✅ **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<aside>`, `<section>`
- ✅ **ARIA labels**: `aria-label`, `aria-live`, `aria-pressed`, `aria-atomic`
- ✅ **Keyboard navigation**: Tab order ve focus management
- ✅ **Screen reader support**: Anlamlı etiketler ve durum bildirimleri
- ✅ **Color contrast**: WCAG AA standartlarına uygun renk paletleri

### Performance Optimizations
- **`useMemo`**: Ağır hesaplamaların cache'lenmesi (suspects list, filtered clues)
- **`useCallback`**: Event handler'ların memoization'ı
- **Lazy evaluation**: Sadece görünen içeriğin render edilmesi
- **CSS containment**: Layout thrashing'in önlenmesi

---

## 🛠️ Tech Stack

| Kategori | Teknoloji | Versiyon |
|----------|-----------|----------|
| **Framework** | React | 19.2.4 |
| **Build Tool** | Vite | 8.0.4 |
| **Styling** | Tailwind CSS | 4.2.2 |
| **Mapping** | Leaflet + React-Leaflet | 1.9.4 / 5.0.0 |
| **API** | JotForm REST API | - |
| **Language** | JavaScript (ES2022+) | - |

---

## 🚀 How to Run

### Prerequisites
- Node.js 18+ 
- npm 9+

### Installation
```bash
# Clone repository
git clone https://github.com/sennaates/2026-frontend-challenge-ankara.git
cd 2026-frontend-challenge-ankara

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
npm run build
npm run preview
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde çalışacaktır (port kullanımdaysa otomatik olarak 5174, 5175 vb. denenecektir).

---

## 🔍 Soruşturma Bulguları

### Birincil Şüpheli: Kağan

**Analiz Sonuçları:**
```
Toplam Kayıt: 12 adet
Podo ile Ortak Görülme: 4 lokasyon
Mesaj Alışverişi: 3 adet
Anonim İhbar: 2 adet
Şüphe Seviyesi: YÜKSEK
```

**Kanıt Zinciri:**
1. **Yüksek aktivite frekansı**: 12 kayıt ile en aktif şüpheli
2. **Podo ile yakın temas**: 4 farklı lokasyonda ortak görülme
3. **Çoklu iletişim kanalı**: Hem doğrudan mesajlaşma hem anonim ihbar
4. **Temporal pattern**: 15 dakika içinde aynı lokasyonda tekrarlayan görülmeler
5. **Alias kullanımı**: "k.", "k.yılmaz", "kagan a." gibi farklı isim varyasyonları

**Sonuç**: Veri analizi, Kağan'ın Podo ile en yoğun etkileşime sahip ve en fazla istihbarat kaydında yer alan kişi olduğunu göstermektedir. Spatial-temporal korelasyon analizi, bu etkileşimin tesadüfi olmadığını desteklemektedir.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── MapView.jsx           # Leaflet harita bileşeni
│   ├── Timeline.jsx          # Kronolojik olay akışı
│   └── ui/                   # Atomic UI bileşenleri
│       ├── Button.jsx
│       ├── StatusBadge.jsx
│       ├── SearchInput.jsx
│       ├── Toast.jsx
│       ├── SkeletonLoader.jsx
│       ├── ErrorState.jsx
│       └── EmptyState.jsx
├── services/
│   └── Api.js                # JotForm API entegrasyonu
├── assets/                   # Statik dosyalar
├── App.jsx                   # Ana uygulama mantığı
├── App.css                   # Component-specific styles
├── index.css                 # Global styles & theme
└── main.jsx                  # React entry point
```

---

## 🎯 Key Features Showcase

### 1. Real-time Data Aggregation
5 farklı JotForm kaynağından veri çekimi ve normalizasyon:
- ✅ Check-ins
- ✅ Messages
- ✅ Sightings
- ✅ Personal Notes
- ✅ Anonymous Tips

### 2. Smart Filtering System
- **Person-based filtering**: Şüpheli bazlı filtreleme
- **Location-based filtering**: Lokasyon bazlı filtreleme
- **Text search**: İsim ve lokasyon araması
- **Combined filters**: Çoklu filtre desteği

### 3. Responsive Design
- 📱 **Mobile**: Horizontal scrollable suspect list
- 💻 **Desktop**: Sidebar navigation with full-height cards
- 🖥️ **Large screens**: Dual-panel layout (map + timeline)

### 4. Visual Intelligence
- **Color-coded clue types**: Her kayıt tipi için farklı renk
- **GPS tagging**: Koordinat bilgisi olan kayıtlar işaretli
- **Proximity indicators**: Yakınlık uyarıları
- **Progress visualization**: Skor karşılaştırma barları

---

## 🔐 Data Privacy & Security

- ✅ API key'ler environment variable olarak yönetilmeli (production için)
- ✅ Client-side data processing (hassas veriler backend'e gönderilmez)
- ✅ No persistent storage (veriler tarayıcı belleğinde tutulur)

---

## 🤝 Contributing

Bu proje **2026 Frontend Challenge** kapsamında geliştirilmiştir. Katkıda bulunmak için:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

Bu proje eğitim amaçlı geliştirilmiştir.

---

## 👤 Developer

**Sena Ateş**
- GitHub: [@sennaates](https://github.com/sennaates)
- Repository: [2026-frontend-challenge-ankara](https://github.com/sennaates/2026-frontend-challenge-ankara)

---

## 🙏 Acknowledgments

- **JotForm API**: Veri kaynağı sağlayan platform
- **Leaflet.js**: Açık kaynak harita kütüphanesi
- **React Team**: Modern UI framework
- **Tailwind CSS**: Utility-first CSS framework

---

<div align="center">
  <strong>🐾 PodoTrace - Turning scattered clues into coherent intelligence</strong>
</div>
