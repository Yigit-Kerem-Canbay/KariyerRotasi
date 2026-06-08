'use client';

import { use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { notFound } from 'next/navigation';

export const guidesData: Record<string, {
  title: string;
  description: string;
  readTime: string;
  date: string;
  author: string;
  content: React.ReactNode;
}> = {
  "mulakatlara-hazirlik": {
    title: "Mülakatlara Hazırlık Rehberi",
    description: "İK profesyonellerinin en çok sorduğu sorular, tuzak sorulara nasıl cevap verilir ve beden dili sırları.",
    readTime: "12 Dk Okuma",
    date: "14 Eylül 2024",
    author: "KariyerRotası Akademi",
    content: (
      <>
        <p className="text-xl text-slate-600 leading-relaxed mb-8">
          Mülakatlar, teknik becerilerinizi göstermenin ötesinde, şirket kültürüne uyumunuzu ve iletişim yeteneklerinizi sergilediğiniz en kritik aşamadır. Başarılı bir mülakatın sırrı ise %80 hazırlık, %20 sunumdur.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">1. Klasik "Bize Kendinizden Bahsedin" Sorusu</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Bu soru aslında "Özgeçmişinizi baştan sona anlatın" demek değildir. İK uzmanları bu soruyla, hangi özelliklerinizi ön plana çıkardığınızı ve özetleme yeteneğinizi ölçer.
        </p>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex gap-4">
          <Lightbulb className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <h4 className="font-bold text-indigo-900 mb-2">Formül: Geçmiş - Şimdi - Gelecek</h4>
            <p className="text-indigo-800/80 text-sm leading-relaxed">
              Geçmişteki en büyük başarım şuydu, şu an mevcut şirketimde şu projeyi yürütüyorum ve gelecekte sizin şirketinizdeki bu pozisyonda şu hedeflere ulaşmak istiyorum şeklinde 2 dakikayı geçmeyen bir özet yapın.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">2. Zayıf Yönünüz Nedir? (Tuzak Soru)</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          "Çok mükemmeliyetçiyim" veya "Çok çalışırım" gibi klişe cevaplar artık işe yaramıyor. Gerçek ama işle doğrudan (kritik derecede) ilgili olmayan bir zayıflık seçip, bunu nasıl çözdüğünüzü anlatmalısınız.
        </p>
        
        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-slate-600"><strong>Kötü Örnek:</strong> Bazen işleri yetiştirmekte zorlanıyorum.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-slate-600"><strong>İyi Örnek:</strong> Geçmişte topluluk önünde konuşurken çok heyecanlanıyordum. Bunu aşmak için son 6 aydır gönüllü olarak ekip içi sunumları ben üstleniyorum ve kendimi ciddi anlamda geliştirdim.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">3. Beden Dili ve İlk İzlenim</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Yapılan araştırmalar, işe alım kararlarının %60'ının mülakatın ilk 5 dakikasında şekillendiğini gösteriyor. Beden dili, söyledikleriniz kadar önemlidir.
        </p>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-8 flex gap-4">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold text-rose-900 mb-2">Dikkat Edilmesi Gerekenler</h4>
            <ul className="list-disc list-inside text-rose-800/80 text-sm space-y-2">
              <li>Göz teması kurun ancak karşı tarafı rahatsız edecek kadar dik dik bakmayın (5-6 saniyede bir bakışlarınızı yumuşatın).</li>
              <li>Kollarınızı bağlamayın; bu savunmaya geçildiğini gösterir.</li>
              <li>Sandalyede dik oturun ancak kaskatı kesilmeyin. Hafif öne eğilmek ilgili olduğunuzu gösterir.</li>
            </ul>
          </div>
        </div>
      </>
    )
  },
  "etkili-cv-hazirlama": {
    title: "Etkili CV Hazırlama Sanatı",
    description: "Yapay zeka tarama sistemlerini (ATS) nasıl geçersin? Öne çıkan bir özgeçmiş hazırlamanın altın kuralları.",
    readTime: "8 Dk Okuma",
    date: "12 Eylül 2024",
    author: "KariyerRotası Akademi",
    content: (
      <>
        <p className="text-xl text-slate-600 leading-relaxed mb-8">
          Ortalama bir işe alım uzmanı, bir CV'ye sadece 6 saniye bakar. Özgeçmişinizin bu kısacık sürede dikkat çekebilmesi için stratejik, okunabilir ve sisteme uygun olması gerekir.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">1. ATS (Aday Takip Sistemi) Uyumluluğu</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Büyük şirketlerin %90'ı, başvuruları okumadan önce bir yapay zeka (ATS) filtresinden geçirir. Eğer CV'niz bu sisteme uygun değilse, bir insanın ekranına asla düşmeyebilir.
        </p>

        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-slate-600"><strong>Sade Tasarım Kullanın:</strong> Çok fazla grafik, sütun ve ikon içeren Canva şablonları ATS botları tarafından okunamayabilir. Düz, tek sütunlu ve temiz tasarımlar hayat kurtarır.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-slate-600"><strong>Anahtar Kelimeler:</strong> İş ilanında geçen kelimeleri mutlaka CV'nize yedirin. İlanda "Agile" yazıyorsa siz "Çevik yöntemler" yazmayın, birebir eşleşme arayın.</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">2. Görevler Değil, Başarılar (X-Y-Z Formülü)</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Deneyimlerinizi yazarken "Sosyal medya yönetimi yaptım" demek hiçbir şey ifade etmez. Google'ın önerdiği X-Y-Z formülünü kullanın: <strong>[Z] kullanarak/yaparak, [Y] sonucunu elde ettim ve [X]'i başardım.</strong>
        </p>

        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8">
          <h4 className="font-bold text-emerald-900 mb-4">Örnek Dönüşüm</h4>
          <div className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-emerald-100">
              <div className="text-sm text-slate-400 font-bold mb-1">Zayıf (Görev Odaklı)</div>
              <div className="text-slate-700">Müşteri şikayetlerini cevapladım.</div>
            </div>
            <div className="p-4 bg-emerald-600 rounded-lg shadow-sm">
              <div className="text-sm text-emerald-200 font-bold mb-1">Güçlü (Başarı Odaklı)</div>
              <div className="text-white">Yeni CRM sistemi kullanarak müşteri bekleme süresini %40 azalttım ve müşteri memnuniyet skorunu 4.2'den 4.8'e yükselttim.</div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">3. Profil Özeti Yazımı</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          İsminizin hemen altına, 3-4 cümleyi geçmeyen güçlü bir profesyonel özet ekleyin. Bu özet, sizin "asansör konuşmanızdır" (Elevator Pitch). Sadece hevesli olduğunuzu değil, o şirkete ne katacağınızı belirtin.
        </p>
      </>
    )
  },
  "maas-muzakeresi": {
    title: "Maaş Müzakeresi Nasıl Yapılır?",
    description: "Hakkettiğin maaşı alabilmek için yapman gereken araştırmalar ve mülakat anında taktiksel konuşma adımları.",
    readTime: "10 Dk Okuma",
    date: "10 Eylül 2024",
    author: "KariyerRotası Akademi",
    content: (
      <>
        <p className="text-xl text-slate-600 leading-relaxed mb-8">
          Birçok aday, iş teklifi aldığında maaş pazarlığı yapmaktan çekinir. Oysa şirketler genellikle pazarlık payı bırakarak ilk teklifi yaparlar. Pazarlık yapmamak, masada para bırakmak demektir.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">1. Rakam Söyleyen İlk Taraf Olmayın</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Mülakatın erken aşamalarında "Maaş beklentiniz nedir?" sorusu gelirse, net bir rakam vermekten kaçının. Henüz işin tam kapsamını ve yan hakları bilmiyorsunuz.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-8 flex gap-4">
          <Lightbulb className="w-6 h-6 text-amber-600 shrink-0" />
          <div>
            <h4 className="font-bold text-amber-900 mb-2">Taktiksel Yanıt</h4>
            <p className="text-amber-800/80 text-sm leading-relaxed">
              "Maaş elbette önemli bir faktör ancak şu an için önceliğim, rolün gerekliliklerini tam olarak anlamak ve şirkete katabileceğim değeri netleştirmek. Şirketinizin bu pozisyon için belirlediği bütçe aralığını öğrenebilir miyim?"
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">2. Pazar Araştırması Hayatidir</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Pazarlık yaparken "Bu rakamı istiyorum çünkü ev kiram arttı" demek amatörcedir. Maaş pazarlığı kişisel ihtiyaçlara değil, piyasa değerinize dayanmalıdır.
        </p>

        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-slate-600">Sektörel maaş raporlarını inceleyin.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-slate-600">Aynı pozisyondaki tanıdıklarınızla veya LinkedIn'deki sektör profesyonelleriyle (kibarca) konuşun.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <span className="text-slate-600">Şirketin büyüklüğünü ve lokasyonunu hesaba katın (Startup ile Kurumsal firmanın maaş politikası farklıdır).</span>
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">3. Tüm Paketi Değerlendirin</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Sadece net maaşa odaklanmayın. Eğer şirket maaşta yukarı çıkamıyorsa, yan haklar üzerinden pazarlık yapın.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-slate-200 p-4 rounded-xl">
            <div className="font-bold text-slate-800 mb-1">Esnek Çalışma</div>
            <div className="text-sm text-slate-500">Haftada ekstra 1 gün uzaktan çalışma izni isteyebilirsiniz.</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl">
            <div className="font-bold text-slate-800 mb-1">Eğitim Bütçesi</div>
            <div className="text-sm text-slate-500">Yıllık belirli bir konferans veya online eğitim bütçesi talep edebilirsiniz.</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl">
            <div className="font-bold text-slate-800 mb-1">Performans Primi</div>
            <div className="text-sm text-slate-500">Sabit maaş artmıyorsa, 6. aydaki hedeflere bağlı bir prim maddesi ekletin.</div>
          </div>
          <div className="bg-white border border-slate-200 p-4 rounded-xl">
            <div className="font-bold text-slate-800 mb-1">Özel Sağlık Sigortası</div>
            <div className="text-sm text-slate-500">Ailenizi de kapsayacak genişletilmiş bir paket isteyebilirsiniz.</div>
          </div>
        </div>
      </>
    )
  },
  "teknoloji-sektorunde-yukselmek": {
    title: "Teknoloji Sektöründe Yükselmek",
    description: "Yazılım, Veri Bilimi ve Tasarım alanlarında kariyer basamaklarını hızla tırmanmak için öğrenmen gereken yetenekler.",
    readTime: "15 Dk Okuma",
    date: "05 Eylül 2024",
    author: "KariyerRotası Akademi",
    content: (
      <>
        <p className="text-xl text-slate-600 leading-relaxed mb-8">
          Teknoloji sektörü durmaksızın değişiyor. Dün popüler olan bir framework bugün eskimiş sayılabiliyor. Bu dinamik ortamda sadece hayatta kalmak değil, yükselmek istiyorsanız stratejik oynamalısınız.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">1. T-Shaped (T-Tipi) İnsan Olun</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Sadece tek bir alanda uzmanlaşmak (I-tipi) veya her şeyden biraz bilmek (Generalist) artık yeterli değil. Şirketler T-tipi yetenekler arıyor.
        </p>

        <ul className="space-y-4 mb-8">
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span className="text-slate-600"><strong>Yatay Çizgi:</strong> Birçok farklı alanda temel düzeyde bilgi sahibi olun (Örn: Bir Backend geliştiricinin temel DevOps, UI/UX ve Frontend kavramlarını bilmesi).</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span className="text-slate-600"><strong>Dikey Çizgi:</strong> Belirli bir alanda ise (Örn: Node.js Microservices) derinlemesine uzmanlaşın.</span>
          </li>
        </ul>

        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-8 flex gap-4">
          <Lightbulb className="w-6 h-6 text-indigo-600 shrink-0" />
          <div>
            <h4 className="font-bold text-indigo-900 mb-2">Biliyor muydunuz?</h4>
            <p className="text-indigo-800/80 text-sm leading-relaxed">
              Silikon Vadisi şirketlerinin iş ilanlarında "Cross-functional" (Çapraz fonksiyonlu) ekiplerde çalışabilme becerisi, teknik beceriler kadar önemli bir kriter haline gelmiştir.
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">2. İletişim: Yazılımcının Gizli Silahı</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          Kod yazmak işin sadece %50'sidir. Geri kalan %50'si o kodu neden yazdığınızı, sistemin nasıl çalıştığını ve teknik olmayan paydaşlara (Ürün Yöneticileri, Müşteriler) derdinizi nasıl anlattığınızdır.
        </p>
        
        <p className="text-slate-600 leading-relaxed mb-6">
          Senior veya Tech Lead (Teknik Lider) pozisyonlarına terfi edenler, sadece en iyi kodu yazanlar değil, mimari kararları takıma en iyi aktarabilen ve ikna edebilen kişilerdir. Karmaşık bir teknik sorunu, 5 yaşındaki bir çocuğa anlatır gibi basitleştirerek anlatabilme yeteneğinizi geliştirin.
        </p>

        <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-6">3. Açık Kaynak (Open Source) Katkısı</h2>
        <p className="text-slate-600 leading-relaxed mb-6">
          GitHub profiliniz sizin yaşayan CV'nizdir. Başka geliştiricilerin projelerine yapacağınız küçük PR'lar (Pull Request), sadece kod kalitenizi değil, başkalarının koduyla nasıl etkileşime girdiğinizi, dokümantasyon okuma becerinizi ve takım çalışmasına yatkınlığınızı gösterir.
        </p>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-8 flex gap-4">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <h4 className="font-bold text-rose-900 mb-2">Başlangıç İpucu</h4>
            <p className="text-rose-800/80 text-sm leading-relaxed">
              Hemen devasa bir framework'e kod yazmaya çalışmayın. Kullanmakta olduğunuz bir kütüphanenin dokümantasyonundaki ufak bir yazım hatasını (typo) düzelterek bile açık kaynak dünyasına harika bir adım atabilirsiniz.
            </p>
          </div>
        </div>
      </>
    )
  }
};

export default function GuideSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const guide = guidesData[slug];

  if (!guide) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Article Header */}
      <div className="bg-white border-b border-slate-200 pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Link href="/career-guide" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Rehberlere Dön
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
            {guide.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Author" className="w-6 h-6 object-contain" />
              <span className="font-bold text-slate-700">{guide.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {guide.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {guide.readTime}
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="prose prose-lg prose-slate max-w-none">
            {guide.content}
          </div>

          <div className="mt-16 pt-8 border-t border-slate-200">
            <div className="bg-indigo-50 rounded-[32px] p-8 md:p-12 text-center">
              <h3 className="text-2xl font-black text-slate-900 mb-4">Rehberi Faydalı Buldun mu?</h3>
              <p className="text-slate-600 mb-8 max-w-md mx-auto">
                Kariyerine yön verirken sana en uygun ilanları hemen şimdi incelemeye başla.
              </p>
              <Link href="/jobs">
                <button className="h-12 px-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors">
                  İş İlanlarına Göz At
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
