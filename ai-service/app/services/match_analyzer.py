import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

def analyze_job_match_with_gemini(user_profile: dict, job_details: dict) -> dict:
    prompt = f"""
    Sen uzman bir İK uzmanı ve kariyer danışmanısın.
    Adayın profil bilgilerini, yani yetenekler, eğitim, deneyim, maaş beklentisi, konum tercihleri, çalışma saatleri vb. özelliklerini, iş ilanının gereksinimleriyle (aranan yetenekler, çalışma modeli, çalışma şekli, çalışma saatleri, konum, maaş aralığı, eğitim seviyesi, tecrübe seviyesi, askerlik durumu ve yabancı dil) detaylıca karşılaştırıp bir UYUM ANALİZİ yap. İş ilanında aranan nitelikleri veya iş tanımını bulamazsan iş ilanının başlığını temel alarak analiz edebilirsin. İş ilanındaki teknolojileri/yetenekleri de dikkate al.
    Özellikle ilanın "employmentTypes" (çalışma şekli - Tam Zamanlı vb.) ve adayın "employmentTypes" tercihlerini karşılaştır.
    Ayrıca ilanın JSON formatındaki "workSchedule" alanındaki günleri ve saatleri, adayın "preferredSchedule" günleri ve saatleri ile tek tek kıyasla. Adayın tercih ettiği saatlerle ilanın saatleri birebir uyuşmasa bile (örneğin 1-2 saatlik farklar veya kısmi örtüşmeler varsa) bu durumu doğrudan uyumsuzluk (skor %0) olarak değil, esnek bir toleransla (örneğin %70-%80 uyum) değerlendir. Bu durumu değerlendirme raporuna mantıklı ve yapıcı bir şekilde yansıt. İlan esnek veya belirlenmemiş saatlerdeyse adaya uyar olarak kabul edebilirsin.
    
    Adayın Yetenekleri/Profili:
    {user_profile}

    İş İlanının Detayları:
    {job_details}

    Aşağıdaki JSON formatında yanıt ver:
    {{
        "matchedSkills": ["Eşleşen Yetenek 1", "Eşleşen Yetenek 2"],
        "missingSkills": ["Eksik Yetenek 1", "Eksik Yetenek 2"],
        "recommendation": "1-2 paragraflık samimi ve profesyonel tavsiye yazısı..."
    }}
    
    ÖNEMLİ KURALLAR:
    - Eğer adayın profilinde belirli bir bilgi (örneğin askerlik durumu, ehliyet veya adres) eksikse, bunu aday o şarta uymuyor gibi olumsuz değerlendirme. "Adayın durumu belirsiz, ancak olumsuz etkilemesin" şeklinde nötr kabul et ve recommendation kısmında dostane bir şekilde "Profilinize askerlik/ehliyet bilgilerinizi eklerseniz daha iyi sonuç alabilirsiniz" gibi tavsiyede bulun. Asla adayı sertçe eleştirme.
    
    Sadece JSON çıktısı ver.
    """

    if not client:
        return {"error": "Gemini API key is missing. Please set GEMINI_API_KEY."}

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        result = response.text.strip()
        import json
        data = json.loads(result)
        return data
    except Exception as e:
        print("Match Analysis Error:", e)
        return {
            "matchedSkills": [],
            "missingSkills": [],
            "recommendation": "Şu anda yapay zeka servisimiz yoğunluk nedeniyle yanıt veremiyor. Lütfen daha sonra sayfayı yenileyerek tekrar deneyin."
        }
