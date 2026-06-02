import os
from google import genai
# pyrefly: ignore [missing-import]
import pdfplumber
import tempfile
from dotenv import load_dotenv

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

    ÖNEMLİ BİLGİ: 
    - Yetenekler (skills) kısmını SADECE "Yetenekler" başlığı altından değil, adayın "Hakkımda", "Deneyim" ve "Eğitim" kısımlarında geçen teknolojilerden de çıkarım yaparak oluştur.
    - Örneğin aday React, Next.js veya Vue biliyorsa mutlaka "Frontend", "JavaScript" gibi temel yetenekleri de listeye ekle.
    - Node.js, Python, Laravel biliyorsa "Backend" ekle.
    - Tüm veritabanı, programlama dili ve frameworkleri detaylı bir şekilde tek boyutlu (düz) bir liste (array) olarak döndür.

    İstenen JSON formatı:
    {
      "about": "Kişi hakkında çok profesyonel 1 paragraflık özet",
      "skills": ["Frontend", "Backend", "React", "Node.js", "SQL", "JavaScript"],
      "languages": [
        {"language": "İngilizce", "level": "B2"},
        {"language": "Almanca", "level": "A2"}
      ],
      "education": [
        {
          "school": "Üniversite Adı",
          "degree": "Lisans",
          "fieldOfStudy": "Bilgisayar Mühendisliği",
          "startDate": "2015-09-01T00:00:00.000Z",
          "endDate": "2019-06-01T00:00:00.000Z",
          "isContinuing": false
        }
      ],
      "experience": [
        {
          "company": "Şirket Adı",
          "title": "Unvan/Pozisyon",
          "startDate": "2020-01-01T00:00:00.000Z",
          "endDate": "2023-01-01T00:00:00.000Z",
          "isContinuing": false,
          "description": "Yapılan işlerin kısa açıklaması"
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
        return data
    except Exception as e:
        print("JSON Parse Error:", e)
        print("Raw Output:", result)
        return {"error": "Could not parse JSON from Gemini"}
