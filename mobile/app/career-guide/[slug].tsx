import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Clock, Calendar, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react-native';

export default function CareerGuideDetailScreen() {
  const { slug } = useLocalSearchParams();
  const router = useRouter();

  const renderContent = () => {
    switch(slug) {
      case 'mulakatlara-hazirlik':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.paragraph}>
              Mülakatlar, teknik becerilerinizi göstermenin ötesinde, şirket kültürüne uyumunuzu ve iletişim yeteneklerinizi sergilediğiniz en kritik aşamadır. Başarılı bir mülakatın sırrı ise %80 hazırlık, %20 sunumdur.
            </Text>

            <Text style={styles.h2}>1. Klasik "Bize Kendinizden Bahsedin" Sorusu</Text>
            <Text style={styles.paragraph}>
              Bu soru aslında "Özgeçmişinizi baştan sona anlatın" demek değildir. İK uzmanları bu soruyla, hangi özelliklerinizi ön plana çıkardığınızı ve özetleme yeteneğinizi ölçer.
            </Text>
            
            <View style={[styles.infoBox, { backgroundColor: '#EEF2FF', borderColor: '#E0E7FF' }]}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                <Lightbulb size={24} color="#4F46E5" />
                <Text style={[styles.infoBoxTitle, { color: '#312E81' }]}>Formül: Geçmiş - Şimdi - Gelecek</Text>
              </View>
              <Text style={[styles.infoBoxText, { color: '#3730A3' }]}>
                Geçmişteki en büyük başarım şuydu, şu an mevcut şirketimde şu projeyi yürütüyorum ve gelecekte sizin şirketinizdeki bu pozisyonda şu hedeflere ulaşmak istiyorum şeklinde 2 dakikayı geçmeyen bir özet yapın.
              </Text>
            </View>

            <Text style={styles.h2}>2. Zayıf Yönünüz Nedir? (Tuzak Soru)</Text>
            <Text style={styles.paragraph}>
              "Çok mükemmeliyetçiyim" veya "Çok çalışırım" gibi klişe cevaplar artık işe yaramıyor. Gerçek ama işle doğrudan (kritik derecede) ilgili olmayan bir zayıflık seçip, bunu nasıl çözdüğünüzü anlatmalısınız.
            </Text>
            
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CheckCircle size={20} color="#10B981" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}><Text style={{fontWeight: 'bold'}}>Kötü Örnek:</Text> Bazen işleri yetiştirmekte zorlanıyorum.</Text>
              </View>
              <View style={styles.bulletItem}>
                <CheckCircle size={20} color="#10B981" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}><Text style={{fontWeight: 'bold'}}>İyi Örnek:</Text> Geçmişte topluluk önünde konuşurken çok heyecanlanıyordum. Bunu aşmak için son 6 aydır gönüllü olarak ekip içi sunumları ben üstleniyorum ve kendimi ciddi anlamda geliştirdim.</Text>
              </View>
            </View>

            <Text style={styles.h2}>3. Beden Dili ve İlk İzlenim</Text>
            <Text style={styles.paragraph}>
              Yapılan araştırmalar, işe alım kararlarının %60'ının mülakatın ilk 5 dakikasında şekillendiğini gösteriyor. Beden dili, söyledikleriniz kadar önemlidir.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: '#FFF1F2', borderColor: '#FFE4E6' }]}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                <AlertCircle size={24} color="#E11D48" />
                <Text style={[styles.infoBoxTitle, { color: '#881337' }]}>Dikkat Edilmesi Gerekenler</Text>
              </View>
              <Text style={[styles.infoBoxText, { color: '#9F1239' }]}>
                • Göz teması kurun ancak karşı tarafı rahatsız edecek kadar dik dik bakmayın.{'\n'}
                • Kollarınızı bağlamayın; bu savunmaya geçildiğini gösterir.{'\n'}
                • Sandalyede dik oturun ancak kaskatı kesilmeyin. Hafif öne eğilmek ilgili olduğunuzu gösterir.
              </Text>
            </View>
          </View>
        );

      case 'etkili-cv-hazirlama':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.paragraph}>
              Ortalama bir işe alım uzmanı, bir CV'ye sadece 6 saniye bakar. Özgeçmişinizin bu kısacık sürede dikkat çekebilmesi için stratejik, okunabilir ve sisteme uygun olması gerekir.
            </Text>

            <Text style={styles.h2}>1. ATS (Aday Takip Sistemi) Uyumluluğu</Text>
            <Text style={styles.paragraph}>
              Büyük şirketlerin %90'ı, başvuruları okumadan önce bir yapay zeka (ATS) filtresinden geçirir. Eğer CV'niz bu sisteme uygun değilse, bir insanın ekranına asla düşmeyebilir.
            </Text>

            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <CheckCircle size={20} color="#6366F1" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}><Text style={{fontWeight: 'bold'}}>Sade Tasarım Kullanın:</Text> Çok fazla grafik, sütun ve ikon içeren Canva şablonları ATS botları tarafından okunamayabilir. Düz, tek sütunlu ve temiz tasarımlar hayat kurtarır.</Text>
              </View>
              <View style={styles.bulletItem}>
                <CheckCircle size={20} color="#6366F1" style={{ marginTop: 2 }} />
                <Text style={styles.bulletText}><Text style={{fontWeight: 'bold'}}>Anahtar Kelimeler:</Text> İş ilanında geçen kelimeleri mutlaka CV'nize yedirin. İlanda "Agile" yazıyorsa siz "Çevik yöntemler" yazmayın, birebir eşleşme arayın.</Text>
              </View>
            </View>

            <Text style={styles.h2}>2. Görevler Değil, Başarılar (X-Y-Z Formülü)</Text>
            <Text style={styles.paragraph}>
              Deneyimlerinizi yazarken "Sosyal medya yönetimi yaptım" demek hiçbir şey ifade etmez. Google'ın önerdiği X-Y-Z formülünü kullanın: Z kullanarak, Y sonucunu elde ettim ve X'i başardım.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: '#ECFDF5', borderColor: '#D1FAE5' }]}>
              <Text style={[styles.infoBoxTitle, { color: '#064E3B', marginBottom: 8 }]}>Örnek Dönüşüm</Text>
              <Text style={[styles.infoBoxText, { color: '#047857' }]}>
                Zayıf (Görev Odaklı): Müşteri şikayetlerini cevapladım.{'\n\n'}
                Güçlü (Başarı Odaklı): Yeni CRM sistemi kullanarak müşteri bekleme süresini %40 azalttım ve müşteri memnuniyet skorunu 4.2'den 4.8'e yükselttim.
              </Text>
            </View>
          </View>
        );

      case 'maas-muzakeresi':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.paragraph}>
              Birçok aday, iş teklifi aldığında maaş pazarlığı yapmaktan çekinir. Oysa şirketler genellikle pazarlık payı bırakarak ilk teklifi yaparlar. Pazarlık yapmamak, masada para bırakmak demektir.
            </Text>

            <Text style={styles.h2}>1. Rakam Söyleyen İlk Taraf Olmayın</Text>
            <Text style={styles.paragraph}>
              Mülakatın erken aşamalarında "Maaş beklentiniz nedir?" sorusu gelirse, net bir rakam vermekten kaçının. Henüz işin tam kapsamını ve yan hakları bilmiyorsunuz.
            </Text>

            <View style={[styles.infoBox, { backgroundColor: '#FFFBEB', borderColor: '#FEF3C7' }]}>
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
                <Lightbulb size={24} color="#D97706" />
                <Text style={[styles.infoBoxTitle, { color: '#78350F' }]}>Taktiksel Yanıt</Text>
              </View>
              <Text style={[styles.infoBoxText, { color: '#92400E' }]}>
                "Maaş elbette önemli bir faktör ancak şu an için önceliğim, rolün gerekliliklerini tam olarak anlamak ve şirkete katabileceğim değeri netleştirmek. Şirketinizin bu pozisyon için belirlediği bütçe aralığını öğrenebilir miyim?"
              </Text>
            </View>

            <Text style={styles.h2}>2. Pazar Araştırması Hayatidir</Text>
            <Text style={styles.paragraph}>
              Pazarlık yaparken "Bu rakamı istiyorum çünkü ev kiram arttı" demek amatörcedir. Maaş pazarlığı kişisel ihtiyaçlara değil, piyasa değerinize dayanmalıdır. Sektörel maaş raporlarını inceleyin ve pozisyonunuzun ederi hakkında fikir sahibi olun.
            </Text>

            <Text style={styles.h2}>3. Tüm Paketi Değerlendirin</Text>
            <Text style={styles.paragraph}>
              Sadece net maaşa odaklanmayın. Eğer şirket maaşta yukarı çıkamıyorsa, yan haklar üzerinden pazarlık yapın. Esnek çalışma, eğitim bütçesi, performans primi veya özel sağlık sigortası gibi haklar talep edebilirsiniz.
            </Text>
          </View>
        );

      case 'teknoloji-sektorunde-yukselmek':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.paragraph}>
              Teknoloji sektörü sürekli gelişen ve adapte olmayı gerektiren dinamik bir yapıdır. Sadece kod yazmak veya tasarım yapmak yeterli değildir; sürekli öğrenme ve ağ kurma (networking) becerileri kariyer basamaklarını hızla tırmanmanızı sağlar.
            </Text>

            <Text style={styles.h2}>1. Sürekli Öğrenme (Continuous Learning)</Text>
            <Text style={styles.paragraph}>
              Teknolojiler her yıl yenilenir. Bugünün popüler dili yarın yerini yenisine bırakabilir. Bu nedenle, öğrenmeyi öğrenmek en büyük yeteneğiniz olmalıdır.
            </Text>

            <Text style={styles.h2}>2. Networking (Ağ Kurma)</Text>
            <Text style={styles.paragraph}>
              İş fırsatlarının büyük bir kısmı ilan sitelerinden ziyade referanslar aracılığıyla doldurulur. Topluluklara katılın, etkinliklere gidin ve diğer profesyonellerle bağlantı kurun.
            </Text>

            <Text style={styles.h2}>3. Soft Skills (Sosyal Beceriler)</Text>
            <Text style={styles.paragraph}>
              İletişim, takım çalışması ve problem çözme becerileri, teknik yetenekleriniz kadar değerlidir. Karmaşık bir problemi teknik olmayan birine basitçe açıklayabilmek, sizi bir geliştirici olmaktan çıkarıp bir lider yapar.
            </Text>
          </View>
        );

      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.paragraph}>Bu rehber içeriği bulunamadı.</Text>
          </View>
        );
    }
  };

  const getHeaderData = () => {
    switch(slug) {
      case 'mulakatlara-hazirlik': return { title: 'Mülakatlara Hazırlık Rehberi', readTime: '12 Dk Okuma', date: '14 Eylül 2024' };
      case 'etkili-cv-hazirlama': return { title: 'Etkili CV Hazırlama Sanatı', readTime: '8 Dk Okuma', date: '12 Eylül 2024' };
      case 'maas-muzakeresi': return { title: 'Maaş Müzakeresi Nasıl Yapılır?', readTime: '10 Dk Okuma', date: '10 Eylül 2024' };
      case 'teknoloji-sektorunde-yukselmek': return { title: 'Teknoloji Sektöründe Yükselmek', readTime: '15 Dk Okuma', date: '5 Eylül 2024' };
      default: return { title: 'Rehber', readTime: '', date: '' };
    }
  };

  const headerData = getHeaderData();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.mainTitle}>{headerData.title}</Text>
        
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Clock size={14} color="#64748B" />
            <Text style={styles.metaText}>{headerData.readTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={14} color="#64748B" />
            <Text style={styles.metaText}>{headerData.date}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {renderContent()}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 60, paddingBottom: 10, paddingHorizontal: 20,
    backgroundColor: '#0F172A',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  
  scrollContent: { padding: 20, paddingBottom: 100 },
  mainTitle: { fontSize: 28, fontWeight: '900', color: '#0F172A', marginBottom: 16, lineHeight: 36 },
  
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24 },
  
  contentContainer: { gap: 16 },
  paragraph: { fontSize: 16, color: '#475569', lineHeight: 26, marginBottom: 16 },
  h2: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 24, marginBottom: 12 },
  
  infoBox: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  infoBoxTitle: { fontSize: 16, fontWeight: '800' },
  infoBoxText: { fontSize: 14, lineHeight: 22, fontWeight: '500' },
  
  bulletList: { gap: 12, marginBottom: 16 },
  bulletItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletText: { flex: 1, fontSize: 15, color: '#475569', lineHeight: 24 },
});
