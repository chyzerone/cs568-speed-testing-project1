# CS 568.A — Project 1: Speed Testing

## Güncel durum — 5 Kasım 2026

**Ekip:** Emre Karataş ve Furkan Çağatay Ekinci

**Repository:** https://github.com/chyzerone/cs568-speed-testing-project1

**Son doğrulanmış geliştirme commit'i:** `d84b93d`

**Aktif geliştirici devri:** Emre → Furkan

### Tamamlanan çalışmalar

- ✅ İki Windows bilgisayarında Python 3.14.10, Git ve VS Code ortamı hazırlandı.
- ✅ FastAPI ve Uvicorn backend oluşturuldu.
- ✅ HTTP Ping modülü geliştirildi ve yerelde test edildi.
- ✅ Download ve Upload ölçümleri geliştirildi.
- ✅ Sunucunun aldığı Upload byte miktarı doğrulandı.
- ✅ Ping → Download → Upload tek Başlat düğmesiyle birleştirildi.
- ✅ Test ilerlemesi ve veri kullanım göstergeleri eklendi.
- ✅ Responsive CSS tasarımı ve ekip footer'ı eklendi.
- ✅ Değişiklikler GitHub main branch'ine gönderildi.

### Son yerel ölçüm örneği

Emre'nin localhost testinden:

| Ölçüm | Sonuç |
|---|---|
| HTTP Ping | 6.40 ms |
| Download | 1853.84 Mbps |
| Upload | 1023.00 Mbps |
| Download verisi | 4,194,304 byte |
| Upload verisi | 4,194,304 byte |
| Toplam sayılan test gövdesi | 8,388,620 byte |

**Not:** Bu sonuçlar localhost ortamında alınmıştır; gerçek internet bağlantı hızı olarak yorumlanmamalıdır. Veri kullanım sayacı tüm ağ protokolü ek yükünü kapsamamaktadır.

### Şu anda devam eden aşama

🔄 **Render Free üzerinde FastAPI uygulamasının yayınlanması**

Emre, Render hesabını oluşturdu. GitHub uygulamasında depo seçimi sırasında sorun yaşandı çünkü depo `chyzerone` hesabına ait. Furkan, Render GitHub uygulamasını kendi hesabına ve yalnızca proje deposuna yetkilendirerek kuruluma devam edecek.

### Bekleyen çalışmalar

- ⬜ Render Free Web Service oluşturulması
- ⬜ Public HTTPS URL üzerinden uçtan uca test
- ⬜ Sunucu performansı ve ölçüm güvenilirliği
- ⬜ Veri boyutu ve ölçüm süresi optimizasyonu
- ⬜ Referans hız testleriyle karşılaştırma
- ⬜ README ve kurulum dokümantasyonunun tamamlanması
- ⬜ Teslim ZIP dosyasının hazırlanması
- ⬜ Demo provası ve Google Classroom teslimi

### Teknoloji

Python 3.14.10, FastAPI, Uvicorn, Vanilla JavaScript, HTML5 ve CSS3.

### Teslim bilgisi

Son teslim günü: **7 Kasım 2026 Cumartesi**.

Google Classroom'daki kesin son teslim saati henüz doğrulanmadı.

### Sonraki geliştirici

**Furkan Çağatay Ekinci:** Önce GitHub'dan güncel main branch'ini al. Sonra Render Free üzerinde Web Service oluşturup uygulamayı yayınla. Başarılı URL'yi ve test sonuçlarını bu belgeye ekle.