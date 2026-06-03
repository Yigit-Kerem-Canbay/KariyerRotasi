import os
import tempfile
from dotenv import load_dotenv

from google import genai # type: ignore
import pdfplumber # type: ignore

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini Client
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    text = ""
    # Write to a temp file because pdfplumber expects a file path or file object
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
        temp_pdf.write(pdf_bytes)
        temp_pdf_path = temp_pdf.name

    try:
        with pdfplumber.open(temp_pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    finally:
        os.remove(temp_pdf_path)
    
    return text

def parse_cv_with_gemini(cv_text: str) -> dict:
    prompt = """
    Sen uzman bir İnsan Kaynakları (İK) yetkilisi ve Kıdemli Yazılım Mühendisisin.
    Aşağıda verilen CV (Özgeçmiş) metnini analiz et ve sonucu SADECE aşağıdaki JSON formatında döndür. Hiçbir markdown veya ekstra metin ekleme, sadece JSON objesini ver.

    ÖNEMLİ BİLGİLER:

    1. YETENEK ÇIKARIMI (GENİŞLETİLMİŞ VE KAPSAMLI):
    - Yetenekler (skills) kısmını SADECE "Yetenekler" başlığı altından değil, adayın "Hakkımda", "Deneyim", "Projeler" ve "Eğitim" kısımlarında geçen teknolojilerden de çıkarım yaparak oluştur.
    - GENELLEŞTİRME KURALI (ZORUNLU): Adayın yeteneklerine bakarak, eğer React, Next.js, Vue vb. biliyorsa mutlaka "Frontend Geliştirme", "Web Geliştirme", "JavaScript" ekle. 
    - Eğer Node.js, Python, Laravel, Java, .NET biliyorsa "Backend Geliştirme", "Yazılım Geliştirme" ekle.
    - Eğer React Native, Flutter, Swift, Kotlin varsa "Mobil Uygulama Geliştirme" ekle.
    - Sadece spesifik framework'leri değil, genel endüstri alanlarını (Frontend, Backend, DevOps, Data Science vb.) listeye DAHİL ET. Listenin geniş ve kapsamlı (15-30 yetenek arası) olması tercih edilir. Eksik bırakma.
    - Tüm yetenekleri detaylı bir şekilde tek boyutlu (düz) bir liste (array) olarak döndür.

    2. DENEYİM vs PROJE AYIRIMI (ÇOK ÖNEMLİ VE KRİTİK):
    Adayın CV'sindeki TÜM "Projeler" veya "Portfolyo" başlığı altındaki projeleri EKSİKSİZ şekilde çek. Tek bir projeyi dahi atlama.
    
    "experience" (İŞ DENEYİMİ) sadece şunları içerir:
    - Resmi iş deneyimleri, Maaşlı pozisyonlar, Stajlar
    - Şirket adı, pozisyon/unvan ve çalışma süreleri olan kayıtlar. Örn: "X Şirketi Yazılım Geliştirici"

    "projects" (PROJELER) şunları içerir:
    - CV'de "Projeler" bölümünde bahsedilen her bir madde.
    - Kişisel projeler, Akademik projeler, Portfolyo projeleri, Freelance projeler, Açık kaynak katkılar
    - Örnekler: "AI Chatbot Uygulaması", "E-ticaret Web Sitesi", "Mobil Uygulama", vs.
    DİKKAT: CV'de yer alan hiçbir projeyi kaybetme, uzun da olsa description kısımlarına özetleyerek projects dizisine ekle!

    Her bir deneyim ve proje için "confidence" puanı ver (0-100 arası):
    - 90-100: Kesinlikle doğru sınıflandırma
    - 80-89: Büyük olasılıkla doğru
    - 60-79: Belirsiz, kullanıcı onayı gerekebilir
    - 0-59: Düşük güven, kullanıcı kararı beklenmeli

    3. SERTİFİKALAR:
    Sertifika, kurs tamamlama belgeleri, eğitim programları ve benzeri belgeleri "certifications" altında topla.
    Eğitim geçmişinden (okul/üniversite) ayrı tut.

    İstenen JSON formatı:
    {
      "about": "Kişi hakkında çok profesyonel 1 paragraflık özet",
      "skills": ["Frontend", "Backend", "React", "Node.js", "SQL", "JavaScript"],
      "languages": [
        {"language": "İngilizce", "level": "B2", "confidence": 95},
        {"language": "Almanca", "level": "A2", "confidence": 85}
      ],
      "education": [
        {
          "school": "Üniversite Adı",
          "degree": "Lisans",
          "fieldOfStudy": "Bilgisayar Mühendisliği",
          "startDate": "2015-09-01T00:00:00.000Z",
          "endDate": "2019-06-01T00:00:00.000Z",
          "isContinuing": false,
          "confidence": 98
        }
      ],
      "experience": [
        {
          "company": "Şirket Adı",
          "title": "Unvan/Pozisyon",
          "location": "Şehir, Ülke",
          "startDate": "2020-01-01T00:00:00.000Z",
          "endDate": "2023-01-01T00:00:00.000Z",
          "isContinuing": false,
          "description": "Yapılan işlerin kısa açıklaması",
          "confidence": 95
        }
      ],
      "projects": [
        {
          "name": "Proje Adı",
          "description": "Projenin kısa açıklaması",
          "technologies": ["React", "Node.js", "MongoDB"],
          "startDate": "2022-06-01T00:00:00.000Z",
          "endDate": "2022-12-01T00:00:00.000Z",
          "isContinuing": false,
          "confidence": 88
        }
      ],
      "certifications": [
        {
          "name": "Sertifika Adı",
          "issuer": "Veren Kurum",
          "issueDate": "2023-03-01T00:00:00.000Z",
          "confidence": 90
        }
      ]
    }

    Tarihleri ISO-8601 formatına (YYYY-MM-DDTHH:mm:ss.sssZ) çevirmeye çalış. Eğer kesin gün veya ay yoksa "2020-01-01T00:00:00.000Z" gibi varsayılan yap.
    
    İşte CV Metni:
    -----------------
    """ + cv_text

    if not client:
        return {"error": "Gemini API key is missing. Please set GEMINI_API_KEY."}

    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    # Clean the response to ensure it's valid JSON
    result = response.text.strip()
    if result.startswith("```json"):
        result = result[7:]
    if result.endswith("```"):
        result = result[:-3]
        
    import json
    try:
        data = json.loads(result)
        
        # Ensure all expected keys exist with defaults
        data.setdefault("about", "")
        data.setdefault("skills", [])
        data.setdefault("languages", [])
        data.setdefault("education", [])
        data.setdefault("experience", [])
        data.setdefault("projects", [])
        data.setdefault("certifications", [])
        
        # Security: Check if it's an irrelevant PDF (e.g., a storybook or math notes)
        has_content = (
            len(data.get("skills") or []) > 0 or 
            len(data.get("education") or []) > 0 or 
            len(data.get("experience") or []) > 0 or 
            len(data.get("projects") or []) > 0 or 
            len(data.get("about") or "") > 10
        )
        if not has_content:
            return {"error": "Bu dosya geçerli bir CV formatında görünmüyor. Lütfen özgeçmiş içerdiğinden emin olun."}

        return data
    except Exception as e:
        print("JSON Parse Error:", e)
        print("Raw Output:", result)
        return {"error": "Failed to parse JSON from Gemini"}
