# CS 568.A - Project 1: Speed Testing

## Bizim son durumumuz - 6 Kasım 2026

**Ekip:** Emre Karataş ve Furkan Çağatay Ekinci

**GitHub:** https://github.com/chyzerone/cs568-speed-testing-project1

**Canlı site:** https://cs568-speed-testing-project1.onrender.com/

**İngilizce arayüzü tamamladığımız commit:** `c868780` (Translate user interface to English)

**Şu anda çalışmaya devam eden:** Emre

## Şimdiye kadar neler yaptık?

- ✅ İki Windows bilgisayarında Python 3.14.10, Git ve VS Code ortamını hazırladık.
- ✅ FastAPI ile Ping, Download ve Upload endpoint'lerini yazdık.
- ✅ JavaScript tarafında üç testi tek **Start Test** düğmesine bağladık.
- ✅ Ping için bir ısınma isteği ve beş ölçüm kullanıyoruz; ortanca değeri gösteriyoruz.
- ✅ Download verisini gerçekten okuyup byte sayısını kontrol ediyoruz.
- ✅ Upload'da sunucunun aldığı byte miktarını doğruluyoruz.
- ✅ Test ilerlemesini, hız sonuçlarını ve kullanılan test verisini ekranda gösteriyoruz.
- ✅ Arayüzü İngilizceye çevirdik ve ekip bilgilerini footer'a ekledik.
- ✅ Uygulamayı Render Free üzerinde Frankfurt bölgesinde yayınladık.
- ✅ Gerçek internet üzerinden testler yaptık, farklı veri boyutları denedik ve Ookla ile karşılaştırdık.
- ✅ Emre'nin bilgisayarını `c868780` sürümüne eşitledik; yerel testler çalışıyor.

## Denemelerimiz ve seçtiğimiz ayarlar

İlk başta Download ve Upload için 4 MiB kullanıyorduk. Render'da üç test yaptığımızda ortalama **96.17 ms HTTP Ping**, **36.02 Mbps Download** ve **8.77 Mbps Upload** gördük.

Download boyutunu karşılaştırınca şu sonuçları aldık:

| Download boyutu | Hız | Süre |
|---|---:|---:|
| 4 MiB | 33.18 Mbps | 1.011 s |
| 8 MiB | 43.73 Mbps | 1.535 s |

8 MiB testinde daha yüksek bir hız gördüğümüz için şu an **8 MiB Download + 4 MiB Upload** kullanıyoruz. Fazladan bir ön indirme yapmıyoruz. Adaptif bir test sistemi de eklemedik; sabit boyutların sonuçlarımızı nasıl etkilediğini deneyerek gördük.

Başarılı bir tam testte saydığımız veri: **12 byte Ping yanıtı + 8,388,608 byte Download + 4,194,304 byte Upload = 12,582,924 byte (12.58 MB)**. Bu sayaca ağ protokolünün ek yükü dahil değil.

## Kaydettiğimiz son sonuçlar

| Nerede test yaptık? | HTTP Ping | Download | Upload |
|---|---:|---:|---:|
| Furkan - Render | 85.90 ms | 43.19 Mbps | 8.12 Mbps |
| Furkan - Render, İngilizce arayüz | 87.50 ms | 43.01 Mbps | 8.73 Mbps |
| Emre - Render, 6 Kasım | 57.80 ms | 50.02 Mbps | 49.87 Mbps |
| Emre - localhost, 6 Kasım | 6.40 ms | 2807.90 Mbps | 1177.35 Mbps |

Localhost testinde tarayıcıyla sunucu aynı bilgisayarda çalışıyor. Bu yüzden oradaki yüksek hızları internet hızı olarak değerlendirmiyoruz. Render sonuçlarımız da farklı bağlantı veya zamanlarda alınmış olabilir; bunları aynı koşullarda tekrarlanmış testler gibi yorumlamıyoruz.

Ookla'da Frankfurt sunucularıyla karşılaştırma da yaptık:

- **GSL Network:** 45 ms Ping, 69.80 Mbps Download, 12.03 Mbps Upload.
- **Melbicom:** 50 ms Ping, 65.48 Mbps Download, 9.95 Mbps Upload.

Bizim Download sonuçlarımız daha düşük kaldı. Tek bağlantıyla ölçüm yapmamız, sunucu farkları ve Render Free'nin sınırlamaları etkili olabilir. Farkın tamamını tek bir sebebe bağlayamıyoruz. Ayrıca bizim HTTP Ping ölçümümüz, Ookla Ping ile tamamen aynı yöntem değil.

## Teslim öncesi son durum

- ✅ README dosyamızı kurulum, ölçüm yöntemleri ve test sonuçlarıyla tamamladık.
- ✅ Arayüzün İngilizce sürümünü hazırladık.
- ✅ Favicon ekledik ve tarayıcıda çalıştığını kontrol ettik.
- ✅ Son değişiklikleri GitHub'a gönderdik.
- ✅ Emre ve Furkan'ın bilgisayarlarında uygulamayı çalıştırdık.
- ✅ Render üzerinde gerçek internet testleri gerçekleştirdik.
- ⬜ Projeyi temiz bir klasörde README'ye göre tekrar kurup kontrol edeceğiz.
- ⬜ Gerekli kaynak dosyalarını `Karatas_Ekinci_project1.zip` dosyasında toplayacağız.
- ⬜ ZIP içeriğini kontrol edip Google Classroom'a yükleyeceğiz.
- ⬜ İkimiz de Ping, Download, Upload, Mbps hesabı ve ölçüm sınırlamalarını demoda açıklamaya hazırlanacağız.

